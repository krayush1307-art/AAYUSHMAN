import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PatientAppointments from "./PatientAppointments.jsx";
import VideoConsultation from "./VideoConsultation.jsx";
import AmbulanceOperatorDashboard from "./AmbulanceOperatorDashboard.jsx";
import PharmacyDashboard from "./PharmacyDashboard.jsx";
// API URL: local development and live deployment support.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
// Role-specific dashboard information and navigation.
const roleDashboard = {
  patient: {
    title: "Patient Dashboard",
    description: "Your healthcare journey starts here.",
    icon: "🧑",
    actions: [
      {
        icon: "🏥",
        title: "Find Healthcare",
        description: "Explore hospitals and health centres.",
        link: "/find-care",
        button: "Find Care",
      },
      {
        icon: "👨‍⚕️",
        title: "Find Doctors",
        description: "Explore available doctor profiles.",
        link: "/doctors",
        button: "Explore Doctors",
      },
      {
        icon: "📅",
        title: "Consultation",
        description: "Explore the consultation demo.",
        link: "/consultation",
        button: "View Consultation",
      },
      {
        icon: "📚",
        title: "Health Resources",
        description: "Read general health information.",
        link: "/health-resources",
        button: "Explore Resources",
      },
    ],
  },

  doctor: {
    title: "Doctor Dashboard",
    description: "Your professional healthcare workspace.",
    icon: "🩺",
    actions: [
      {
        icon: "📅",
        title: "My Appointments",
        description: "Manage patient consultation requests.",
        link: "#doctor-appointments",
        button: "Manage Appointments",
      },
      {
        icon: "👨‍⚕️",
        title: "Doctor Directory",
        description: "View doctor directory profiles.",
        link: "/doctors",
        button: "View Directory",
      },
      {
        icon: "📚",
        title: "Health Resources",
        description: "Explore general healthcare resources.",
        link: "/health-resources",
        button: "View Resources",
      },
    ],
  },

  pharmacy: {
    title: "Pharmacy Dashboard",
    description: "Your pharmacy workspace.",
    icon: "💊",
    actions: [
      {
        icon: "💊",
        title: "Medicine Catalogue",
        description: "Explore the sample medicine catalogue.",
        link: "/medicines",
        button: "View Catalogue",
      },
      {
        icon: "🏥",
        title: "Healthcare Facilities",
        description: "Explore listed healthcare facilities.",
        link: "/find-care",
        button: "Find Facilities",
      },
      {
        icon: "📚",
        title: "Health Resources",
        description: "Explore general health information.",
        link: "/health-resources",
        button: "View Resources",
      },
    ],
  },

  ambulance: {
    title: "Ambulance Dashboard",
    description: "Your emergency services workspace.",
    icon: "🚑",
    actions: [
      {
        icon: "🚨",
        title: "Ambulance Services",
        description: "Explore the ambulance request demo.",
        link: "/ambulance",
        button: "Open Services",
      },
      {
        icon: "🏥",
        title: "Healthcare Facilities",
        description: "Explore nearby healthcare listings.",
        link: "/find-care",
        button: "View Facilities",
      },
      {
        icon: "📚",
        title: "Health Resources",
        description: "Explore emergency and health information.",
        link: "/health-resources",
        button: "View Resources",
      },
    ],
  },

  admin: {
    title: "Admin Dashboard",
    description: "Manage and monitor the AAYUSHMAN platform.",
    icon: "🛡️",
    actions: [
      {
        icon: "📊",
        title: "Platform Statistics",
        description: "Monitor registered users across the platform.",
        link: "#admin-statistics",
        button: "View Statistics",
      },
      {
        icon: "👥",
        title: "User Management",
        description: "Search and manage registered platform accounts.",
        link: "#admin-users",
        button: "Manage Users",
      },
      {
        icon: "🏥",
        title: "Healthcare Facilities",
        description: "Explore healthcare facilities.",
        link: "/find-care",
        button: "Explore Facilities",
      },
      {
        icon: "👨‍⚕️",
        title: "Doctor Directory",
        description: "Explore the doctor directory.",
        link: "/doctors",
        button: "View Doctors",
      },
    ],
  },
};

// Reusable Admin statistics card.
function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-[#356589] dark:bg-[#234E70]">
      <div className="text-3xl">{icon}</div>
      <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-300">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-slate-800 dark:text-[#EAF4FA]">
        {value ?? 0}
      </p>
    </div>
  );
}

// Reusable appointment status badge.
function AppointmentStatus({ status }) {
  const styles = {
    pending:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    accepted:
      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    completed:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    cancelled:
      "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[status] || styles.pending}`}
    >
      {status || "unknown"}
    </span>
  );
}

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Admin statistics states.
  const [statistics, setStatistics] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");

  // Admin user-management states.
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

  // Edit-user popup states.
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "patient",
  });

  // Track Admin user actions and show feedback.
  const [updatingUserId, setUpdatingUserId] = useState("");
  const [userActionMessage, setUserActionMessage] = useState("");
  const [userActionError, setUserActionError] = useState("");

  // Doctor appointment states.
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState("");
  const [appointmentActionMessage, setAppointmentActionMessage] = useState("");
  const [appointmentActionError, setAppointmentActionError] = useState("");
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState("");

  // Video consultation state for the doctor's selected appointment.
  const [activeVideoAppointment, setActiveVideoAppointment] = useState(null);

  const closeVideoMeeting = useCallback(() => {
    setActiveVideoAppointment(null);
  }, []);

  // Fetch the authenticated user's profile.
  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("aayushman-token");

    if (!token) {
      setUser(null);
      setStatistics(null);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Unable to load profile.");

      setUser(data.user);
    } catch (err) {
      setUser(null);
      setStatistics(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Admin statistics.
  const fetchAdminStats = useCallback(async () => {
    const token = localStorage.getItem("aayushman-token");
    if (!token) return;

    setStatsLoading(true);
    setStatsError("");

    try {
      const response = await fetch(`${API_URL}/users/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Unable to load admin statistics.");

      setStatistics(data.statistics);
    } catch (err) {
      setStatistics(null);
      setStatsError(err.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch all registered users.
  const fetchAdminUsers = useCallback(async () => {
    const token = localStorage.getItem("aayushman-token");
    if (!token) return;

    setUsersLoading(true);
    setUsersError("");

    try {
      const response = await fetch(`${API_URL}/users/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Unable to load registered users.");

      setUsers(data.users || []);
    } catch (err) {
      setUsers([]);
      setUsersError(err.message);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Fetch appointments assigned to the logged-in doctor.
  const fetchDoctorAppointments = useCallback(async () => {
    const token = localStorage.getItem("aayushman-token");
    if (!token) return;

    setAppointmentsLoading(true);
    setAppointmentsError("");

    try {
      const response = await fetch(`${API_URL}/appointments/doctor`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Unable to load appointments.");

      setAppointments(data.appointments || []);
    } catch (err) {
      setAppointments([]);
      setAppointmentsError(err.message);
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  // Update appointment status as a doctor.
  const handleAppointmentStatus = async (appointmentId, status) => {
    const token = localStorage.getItem("aayushman-token");
    if (!token) return;

    setUpdatingAppointmentId(appointmentId);
    setAppointmentActionMessage("");
    setAppointmentActionError("");

    try {
      const response = await fetch(
        `${API_URL}/appointments/${appointmentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        },
      );

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Unable to update appointment.");

      setAppointments((previousAppointments) =>
        previousAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, ...data.appointment }
            : appointment,
        ),
      );

      setAppointmentActionMessage(
        data.message || "Appointment status updated successfully.",
      );
    } catch (err) {
      setAppointmentActionError(err.message);
    } finally {
      setUpdatingAppointmentId("");
    }
  };

  // Load profile when authentication changes.
  useEffect(() => {
    fetchProfile();

    window.addEventListener("aayushman-auth-changed", fetchProfile);

    return () => {
      window.removeEventListener("aayushman-auth-changed", fetchProfile);
    };
  }, [fetchProfile]);

  // Load Admin-only data after profile verification.
  useEffect(() => {
    if (user?.role === "admin") {
      fetchAdminStats();
      fetchAdminUsers();
    } else {
      setStatistics(null);
      setStatsError("");
      setUsers([]);
      setUsersError("");
    }
  }, [user, fetchAdminStats, fetchAdminUsers]);

  // Load Doctor appointments only for a logged-in doctor.
  useEffect(() => {
    if (user?.role === "doctor") {
      fetchDoctorAppointments();
    } else {
      setAppointments([]);
      setAppointmentsError("");
      setActiveVideoAppointment(null);
    }
  }, [user, fetchDoctorAppointments]);

  // Open the edit popup with the selected user's current details.
  const openEditUser = (registeredUser) => {
    setEditingUser(registeredUser);
    setEditForm({
      name: registeredUser.name || "",
      email: registeredUser.email || "",
      phone: registeredUser.phone || "",
      role: registeredUser.role || "patient",
    });
    setUserActionMessage("");
    setUserActionError("");
  };

  // Save edited user details using the Admin update API.
  const handleUpdateUser = async (event) => {
    event.preventDefault();
    if (!editingUser) return;

    const token = localStorage.getItem("aayushman-token");
    setUpdatingUserId(editingUser._id);
    setUserActionMessage("");
    setUserActionError("");

    try {
      const response = await fetch(
        `${API_URL}/users/admin/users/${editingUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        },
      );

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Unable to update user.");

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item._id === editingUser._id ? data.user : item,
        ),
      );

      setSelectedUser((previousUser) =>
        previousUser?._id === editingUser._id ? data.user : previousUser,
      );

      setEditingUser(null);
      setUserActionMessage("User details updated successfully!");
    } catch (err) {
      setUserActionError(err.message);
    } finally {
      setUpdatingUserId("");
    }
  };

  // Activate or deactivate a user account.
  const handleUserStatus = async (registeredUser) => {
    const nextStatus = registeredUser.isActive === false;
    const actionText = nextStatus ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} ${registeredUser.name || "this user"}?`,
    );

    if (!confirmed) return;

    const token = localStorage.getItem("aayushman-token");
    setUpdatingUserId(registeredUser._id);
    setUserActionMessage("");
    setUserActionError("");

    try {
      const response = await fetch(
        `${API_URL}/users/admin/users/${registeredUser._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: nextStatus }),
        },
      );

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Unable to update account status.");

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item._id === registeredUser._id ? data.user : item,
        ),
      );

      setSelectedUser((previousUser) =>
        previousUser?._id === registeredUser._id ? data.user : previousUser,
      );

      setUserActionMessage(data.message);
    } catch (err) {
      setUserActionError(err.message);
    } finally {
      setUpdatingUserId("");
    }
  };

  // Hide the dashboard when the user is logged out.
  if (!localStorage.getItem("aayushman-token")) return null;

  const dashboard = roleDashboard[user?.role];

  return (
    <section
      id="dashboard"
      className="bg-gradient-to-br from-[#F3F7FD] via-[#E9F0FA] to-[#DFE8F5] px-4 py-16 transition-colors duration-300 dark:bg-gradient-to-br dark:from-[#171C1B] dark:via-[#202A30] dark:to-[#293B43] sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        {/* Dashboard heading */}
        <div className="mb-8">
          <p className="font-semibold text-blue-600 dark:text-[#00C2D1]">
            AAYUSHMAN ACCOUNT
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-800 dark:text-[#EAF4FA]">
            My Dashboard
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Manage your account and explore your healthcare workspace.
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 dark:border-[#356589] dark:bg-[#234E70] dark:text-slate-300">
            Loading your profile...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-400/40 dark:bg-[#234E70] dark:text-red-300">
            {error}
            <button
              type="button"
              onClick={fetchProfile}
              className="ml-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && user && (
          <>
            {/* Welcome card */}
            <div className="rounded-2xl bg-blue-600 p-6 text-white dark:bg-[#234E70] sm:p-8">
              <div className="text-4xl">{dashboard?.icon || "👋"}</div>
              <h3 className="mt-4 text-2xl font-bold">Welcome, {user.name}!</h3>
              <p className="mt-2 text-blue-100 dark:text-slate-300">
                {dashboard?.description || "Welcome to AAYUSHMAN."}
              </p>
            </div>

            {user?.role === "pharmacy" && <PharmacyDashboard />}

            {/* Ambulance Operator Dashboard */}
            {user.role === "ambulance" && <AmbulanceOperatorDashboard />}

            {/* Patient appointment history */}
            {user.role === "patient" && <PatientAppointments />}

            {/* Doctor Appointment Management */}
            {user.role === "doctor" && (
              <div id="doctor-appointments" className="mt-10">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="font-semibold text-blue-600 dark:text-[#00C2D1]">
                      PATIENT CONSULTATIONS
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-slate-800 dark:text-[#EAF4FA]">
                      My Appointments
                    </h3>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">
                      Review patient requests and manage consultation status.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={fetchDoctorAppointments}
                    disabled={appointmentsLoading}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#00C2D1] dark:text-[#183B56] dark:hover:bg-cyan-300"
                  >
                    {appointmentsLoading
                      ? "Refreshing..."
                      : "↻ Refresh Appointments"}
                  </button>
                </div>

                {appointmentActionMessage && (
                  <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 dark:border-green-400/40 dark:bg-[#234E70] dark:text-green-300">
                    {appointmentActionMessage}
                  </div>
                )}

                {appointmentActionError && (
                  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-400/40 dark:bg-[#234E70] dark:text-red-300">
                    {appointmentActionError}
                  </div>
                )}

                {appointmentsError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-400/40 dark:bg-[#234E70] dark:text-red-300">
                    {appointmentsError}
                    <button
                      type="button"
                      onClick={fetchDoctorAppointments}
                      className="ml-3 font-semibold underline"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {appointmentsLoading && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 dark:border-[#356589] dark:bg-[#234E70] dark:text-slate-300">
                    Loading your appointments...
                  </div>
                )}

                {!appointmentsLoading && !appointmentsError && (
                  <>
                    {/* Appointment summary cards */}
                    <div className="mb-6 grid gap-4 sm:grid-cols-3">
                      <StatCard
                        icon="📋"
                        label="Total Appointments"
                        value={appointments.length}
                      />
                      <StatCard
                        icon="⏳"
                        label="Pending Requests"
                        value={
                          appointments.filter(
                            (item) => item.status === "pending",
                          ).length
                        }
                      />
                      <StatCard
                        icon="✅"
                        label="Accepted"
                        value={
                          appointments.filter(
                            (item) => item.status === "accepted",
                          ).length
                        }
                      />
                    </div>

                    {appointments.length === 0 ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-[#356589] dark:bg-[#234E70]">
                        <div className="text-5xl">📅</div>
                        <h4 className="mt-4 text-xl font-bold text-slate-800 dark:text-[#EAF4FA]">
                          No Appointments Yet
                        </h4>
                        <p className="mt-2 text-slate-600 dark:text-slate-300">
                          New patient consultation requests will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-5">
                        {appointments.map((appointment) => {
                          const patient = appointment.patient || {};
                          const isBusy =
                            updatingAppointmentId === appointment._id;

                          return (
                            <div
                              key={appointment._id}
                              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-[#356589] dark:bg-[#234E70]"
                            >
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-[#00C2D1]">
                                    Patient Consultation
                                  </p>
                                  <h4 className="mt-2 text-xl font-bold text-slate-800 dark:text-[#EAF4FA]">
                                    {patient.name ||
                                      "Patient details unavailable"}
                                  </h4>
                                  <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-300">
                                    {patient.email || "Email not available"}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                                    Phone: {patient.phone || "Not provided"}
                                  </p>
                                </div>

                                <AppointmentStatus
                                  status={appointment.status}
                                />
                              </div>

                              <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 dark:border-[#356589] sm:grid-cols-2">
                                <div>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Appointment Date
                                  </p>
                                  <p className="mt-1 font-semibold text-slate-800 dark:text-[#EAF4FA]">
                                    {appointment.appointmentDate
                                      ? new Date(
                                          appointment.appointmentDate,
                                        ).toLocaleString()
                                      : "Not available"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Appointment ID
                                  </p>
                                  <p className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-200">
                                    {appointment._id}
                                  </p>
                                </div>

                                <div className="sm:col-span-2">
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Consultation Reason
                                  </p>
                                  <p className="mt-1 text-slate-800 dark:text-[#EAF4FA]">
                                    {appointment.reason || "Not provided"}
                                  </p>
                                </div>
                              </div>

                              {/* Only pending appointments can be accepted or rejected. */}
                              {appointment.status === "pending" && (
                                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-[#356589] sm:flex-row">
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() =>
                                      handleAppointmentStatus(
                                        appointment._id,
                                        "accepted",
                                      )
                                    }
                                    className="flex-1 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                                  >
                                    {isBusy
                                      ? "Please wait..."
                                      : "✓ Accept Appointment"}
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() =>
                                      handleAppointmentStatus(
                                        appointment._id,
                                        "rejected",
                                      )
                                    }
                                    className="flex-1 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                                  >
                                    {isBusy
                                      ? "Please wait..."
                                      : "✕ Reject Appointment"}
                                  </button>
                                </div>
                              )}

                              {/* Accepted appointments can join the video call or be marked completed. */}
                              {appointment.status === "accepted" && (
                                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-[#356589] sm:flex-row">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActiveVideoAppointment(appointment)
                                    }
                                    className="flex-1 rounded-xl bg-[#00C2D1] px-5 py-3 font-semibold text-[#183B56] transition hover:bg-cyan-300"
                                  >
                                    📹 Join Video Consultation
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() =>
                                      handleAppointmentStatus(
                                        appointment._id,
                                        "completed",
                                      )
                                    }
                                    className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-[#356589]"
                                  >
                                    {isBusy
                                      ? "Please wait..."
                                      : "✓ Mark as Completed"}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                {/* Doctor joins the same appointment room as the patient. */}
                {activeVideoAppointment && (
                  <VideoConsultation
                    appointmentId={activeVideoAppointment._id}
                    displayName="AAYUSHMAN Doctor"
                    onClose={closeVideoMeeting}
                  />
                )}
              </div>
            )}

            {/* Admin statistics */}
            {user.role === "admin" && (
              <div id="admin-statistics" className="mt-10">
                <div className="mb-6">
                  <p className="font-semibold text-blue-600 dark:text-[#00C2D1]">
                    PLATFORM OVERVIEW
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-800 dark:text-[#EAF4FA]">
                    Admin Statistics
                  </h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">
                    Live registered user statistics from the AAYUSHMAN database.
                  </p>
                </div>

                {statsLoading && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 dark:border-[#356589] dark:bg-[#234E70] dark:text-slate-300">
                    Loading platform statistics...
                  </div>
                )}

                {statsError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-400/40 dark:bg-[#234E70] dark:text-red-300">
                    {statsError}
                    <button
                      type="button"
                      onClick={fetchAdminStats}
                      className="ml-3 font-semibold underline"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {!statsLoading && statistics && (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                      icon="👥"
                      label="Total Registered Users"
                      value={statistics.total}
                    />
                    <StatCard
                      icon="🧑"
                      label="Patients"
                      value={statistics.patients}
                    />
                    <StatCard
                      icon="🩺"
                      label="Doctors"
                      value={statistics.doctors}
                    />
                    <StatCard
                      icon="💊"
                      label="Pharmacies"
                      value={statistics.pharmacies}
                    />
                    <StatCard
                      icon="🚑"
                      label="Ambulance Operators"
                      value={statistics.ambulances}
                    />
                    <StatCard
                      icon="🛡️"
                      label="Administrators"
                      value={statistics.admins}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Admin user management */}
            {user.role === "admin" && (
              <div id="admin-users" className="mt-10">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="font-semibold text-blue-600 dark:text-[#00C2D1]">
                      ACCOUNT MANAGEMENT
                    </p>
                    <h3 className="mt-2 text-2xl font-bold text-slate-800 dark:text-[#EAF4FA]">
                      Registered Users
                    </h3>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">
                      View, edit, activate and deactivate platform accounts.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={fetchAdminUsers}
                    disabled={usersLoading}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#00C2D1] dark:text-[#183B56] dark:hover:bg-cyan-300"
                  >
                    {usersLoading ? "Refreshing..." : "↻ Refresh Users"}
                  </button>
                </div>

                {userActionMessage && (
                  <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 dark:border-green-400/40 dark:bg-[#234E70] dark:text-green-300">
                    {userActionMessage}
                  </div>
                )}

                {userActionError && (
                  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-400/40 dark:bg-[#234E70] dark:text-red-300">
                    {userActionError}
                  </div>
                )}

                {/* Search and role filter */}
                <div className="mb-5 grid gap-4 sm:grid-cols-2">
                  <input
                    type="search"
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-500 dark:border-[#356589] dark:bg-[#234E70] dark:text-[#EAF4FA] dark:placeholder:text-slate-400 dark:focus:border-[#00C2D1]"
                  />

                  <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-500 dark:border-[#356589] dark:bg-[#234E70] dark:text-[#EAF4FA] dark:focus:border-[#00C2D1]"
                  >
                    <option value="all">All Roles</option>
                    <option value="patient">Patients</option>
                    <option value="doctor">Doctors</option>
                    <option value="pharmacy">Pharmacies</option>
                    <option value="ambulance">Ambulance Operators</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>

                {usersError && (
                  <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-400/40 dark:bg-[#234E70] dark:text-red-300">
                    {usersError}
                    <button
                      type="button"
                      onClick={fetchAdminUsers}
                      className="ml-3 font-semibold underline"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {usersLoading && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 dark:border-[#356589] dark:bg-[#234E70] dark:text-slate-300">
                    Loading registered users...
                  </div>
                )}

                {!usersLoading && !usersError && (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-[#356589] dark:bg-[#234E70]">
                    {(() => {
                      const filteredUsers = users.filter((registeredUser) => {
                        const searchText = userSearch.trim().toLowerCase();
                        const matchesSearch =
                          (registeredUser.name || "")
                            .toLowerCase()
                            .includes(searchText) ||
                          (registeredUser.email || "")
                            .toLowerCase()
                            .includes(searchText);
                        const matchesRole =
                          roleFilter === "all" ||
                          registeredUser.role === roleFilter;
                        return matchesSearch && matchesRole;
                      });

                      return (
                        <>
                          <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 dark:border-[#356589] sm:flex-row sm:items-center sm:justify-between">
                            <p className="font-semibold text-slate-800 dark:text-[#EAF4FA]">
                              Showing {filteredUsers.length} of {users.length}{" "}
                              users
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-300">
                              Passwords and private credentials are never
                              displayed.
                            </p>
                          </div>

                          {filteredUsers.length === 0 ? (
                            <p className="p-8 text-center text-slate-500 dark:text-slate-300">
                              No users match your search or selected role.
                            </p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[1050px] text-left text-sm">
                                <thead className="bg-slate-100 text-slate-600 dark:bg-[#183B56] dark:text-slate-200">
                                  <tr>
                                    <th className="px-5 py-4 font-semibold">
                                      Name
                                    </th>
                                    <th className="px-5 py-4 font-semibold">
                                      Email
                                    </th>
                                    <th className="px-5 py-4 font-semibold">
                                      Role
                                    </th>
                                    <th className="px-5 py-4 font-semibold">
                                      Status
                                    </th>
                                    <th className="px-5 py-4 font-semibold">
                                      Registered On
                                    </th>
                                    <th className="px-5 py-4 font-semibold">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100 dark:divide-[#356589]">
                                  {filteredUsers.map((registeredUser) => {
                                    const isActive =
                                      registeredUser.isActive !== false;
                                    const isSelf =
                                      registeredUser._id === user._id;
                                    const isBusy =
                                      updatingUserId === registeredUser._id;

                                    return (
                                      <tr
                                        key={registeredUser._id}
                                        className="text-slate-700 dark:text-slate-200"
                                      >
                                        <td className="px-5 py-4 font-medium text-slate-800 dark:text-[#EAF4FA]">
                                          {registeredUser.name || "—"}
                                        </td>
                                        <td className="px-5 py-4">
                                          {registeredUser.email || "—"}
                                        </td>
                                        <td className="px-5 py-4">
                                          <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-700 dark:bg-[#356589] dark:text-[#EAF4FA]">
                                            {registeredUser.role || "unknown"}
                                          </span>
                                        </td>
                                        <td className="px-5 py-4">
                                          <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isActive ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"}`}
                                          >
                                            {isActive ? "Active" : "Inactive"}
                                          </span>
                                        </td>
                                        <td className="px-5 py-4">
                                          {registeredUser.createdAt
                                            ? new Date(
                                                registeredUser.createdAt,
                                              ).toLocaleDateString()
                                            : "Not available"}
                                        </td>
                                        <td className="px-5 py-4">
                                          <div className="flex flex-wrap gap-2">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setSelectedUser(registeredUser)
                                              }
                                              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 dark:bg-[#356589] dark:hover:bg-[#42799f]"
                                            >
                                              View
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                openEditUser(registeredUser)
                                              }
                                              className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600"
                                            >
                                              Edit
                                            </button>

                                            <button
                                              type="button"
                                              disabled={
                                                isBusy || (isSelf && isActive)
                                              }
                                              onClick={() =>
                                                handleUserStatus(registeredUser)
                                              }
                                              className={`rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 ${isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                                            >
                                              {isBusy
                                                ? "Please wait..."
                                                : isActive
                                                  ? "Deactivate"
                                                  : "Activate"}
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Selected user details popup */}
            {user.role === "admin" && selectedUser && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
                onClick={() => setSelectedUser(null)}
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="selected-user-title"
                  className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#356589] dark:bg-[#183B56] sm:p-8"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-blue-600 dark:text-[#00C2D1]">
                        ACCOUNT INFORMATION
                      </p>
                      <h3
                        id="selected-user-title"
                        className="mt-2 text-2xl font-bold text-slate-800 dark:text-[#EAF4FA]"
                      >
                        User Details
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      aria-label="Close user details"
                      className="rounded-lg px-3 py-2 text-xl text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#234E70]"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-7 grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Full Name
                      </p>
                      <p className="mt-1 font-semibold text-slate-800 dark:text-[#EAF4FA]">
                        {selectedUser.name || "Not provided"}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Email Address
                      </p>
                      <p className="mt-1 break-all font-semibold text-slate-800 dark:text-[#EAF4FA]">
                        {selectedUser.email || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Mobile Number
                      </p>
                      <p className="mt-1 font-semibold text-slate-800 dark:text-[#EAF4FA]">
                        {selectedUser.phone || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Account Role
                      </p>
                      <p className="mt-1 font-semibold capitalize text-blue-700 dark:text-[#00C2D1]">
                        {selectedUser.role || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Account Status
                      </p>
                      <p
                        className={`mt-1 font-semibold ${selectedUser.isActive === false ? "text-red-600" : "text-green-600"}`}
                      >
                        {selectedUser.isActive === false
                          ? "Inactive"
                          : "Active"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Registration Date
                      </p>
                      <p className="mt-1 font-semibold text-slate-800 dark:text-[#EAF4FA]">
                        {selectedUser.createdAt
                          ? new Date(selectedUser.createdAt).toLocaleString()
                          : "Not available"}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        User ID
                      </p>
                      <p className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-200">
                        {selectedUser._id || "Not available"}
                      </p>
                    </div>
                  </div>

                  <p className="mt-6 rounded-xl bg-slate-100 p-4 text-sm text-slate-600 dark:bg-[#234E70] dark:text-slate-300">
                    Passwords and private credentials are not displayed in this
                    profile view.
                  </p>

                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 dark:bg-[#00C2D1] dark:text-[#183B56] dark:hover:bg-cyan-300"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            )}

            {/* Edit user popup */}
            {user.role === "admin" && editingUser && (
              <div
                className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4"
                onClick={() => setEditingUser(null)}
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="edit-user-title"
                  className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#356589] dark:bg-[#183B56] sm:p-8"
                  onClick={(event) => event.stopPropagation()}
                >
                  <h3
                    id="edit-user-title"
                    className="text-2xl font-bold text-slate-800 dark:text-[#EAF4FA]"
                  >
                    Edit User Details
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                    Update this user's account information.
                  </p>

                  <form onSubmit={handleUpdateUser} className="mt-6 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(event) =>
                          setEditForm({ ...editForm, name: event.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-500 dark:border-[#356589] dark:bg-[#234E70] dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={editForm.email}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            email: event.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-500 dark:border-[#356589] dark:bg-[#234E70] dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            phone: event.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-500 dark:border-[#356589] dark:bg-[#234E70] dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                        Account Role
                      </label>
                      <select
                        value={editForm.role}
                        onChange={(event) =>
                          setEditForm({ ...editForm, role: event.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-blue-500 dark:border-[#356589] dark:bg-[#234E70] dark:text-white"
                      >
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                        <option value="pharmacy">Pharmacy</option>
                        <option value="ambulance">Ambulance Operator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {userActionError && (
                      <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        {userActionError}
                      </p>
                    )}

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                      <button
                        type="submit"
                        disabled={updatingUserId === editingUser._id}
                        className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60 dark:bg-[#00C2D1] dark:text-[#183B56]"
                      >
                        {updatingUserId === editingUser._id
                          ? "Saving..."
                          : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="flex-1 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 dark:border-[#356589] dark:text-slate-200 dark:hover:bg-[#234E70]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Personal information */}
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-[#356589] dark:bg-[#234E70] md:col-span-2">
                <h3 className="text-xl font-bold text-slate-800 dark:text-[#EAF4FA]">
                  Personal Information
                </h3>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Full Name
                    </p>
                    <p className="mt-1 font-semibold text-slate-800 dark:text-[#EAF4FA]">
                      {user.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Email Address
                    </p>
                    <p className="mt-1 break-all font-semibold text-slate-800 dark:text-[#EAF4FA]">
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Mobile Number
                    </p>
                    <p className="mt-1 font-semibold text-slate-800 dark:text-[#EAF4FA]">
                      {user.phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account role */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-[#356589] dark:bg-[#234E70]">
                <h3 className="text-xl font-bold text-slate-800 dark:text-[#EAF4FA]">
                  Account Type
                </h3>
                <div className="mt-5 text-4xl">🛡️</div>
                <p className="mt-3 text-lg font-bold capitalize text-blue-700 dark:text-[#00C2D1]">
                  {user.role}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                  Your registered account role.
                </p>
              </div>
            </div>

            {/* Role-specific dashboard actions */}
            <div className="mt-10">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-[#EAF4FA]">
                {dashboard?.title || "Your Workspace"}
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Quick access to relevant AAYUSHMAN sections.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {(dashboard?.actions || []).map((action) => (
                  <div
                    key={action.title}
                    className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 dark:border-[#356589] dark:bg-[#234E70]"
                  >
                    <div className="text-3xl">{action.icon}</div>
                    <h4 className="mt-4 text-lg font-bold text-slate-800 dark:text-[#EAF4FA]">
                      {action.title}
                    </h4>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {action.description}
                    </p>

                    <Link
                      to={action.link}
                      className="mt-5 inline-block rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700 dark:bg-[#00C2D1] dark:text-[#183B56] dark:hover:bg-cyan-300"
                    >
                      {action.button}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-8 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Some dashboard sections currently contain demonstration features.
              They do not represent live bookings, medical appointments,
              medicine orders, or ambulance dispatch.
            </p>
          </>
        )}
      </div>
    </section>
  );
}

export default Dashboard;
