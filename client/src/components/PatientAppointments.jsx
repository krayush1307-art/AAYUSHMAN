import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import VideoConsultation from "./VideoConsultation.jsx";
import API_BASE_URL from "../config/api.js";
function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeAppointment, setActiveAppointment] = useState(null);

  // Close the video meeting.
  const closeVideoMeeting = useCallback(() => {
    setActiveAppointment(null);
  }, []);

  // Fetch appointments belonging to the logged-in patient.
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("aayushman-token");

      if (!token) {
        setError("Please log in to view your appointments.");
        setAppointments([]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/appointments/patient`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load appointments.");
      }

      const appointmentList = Array.isArray(data)
        ? data
        : data.appointments || [];

      setAppointments(appointmentList);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();

    window.addEventListener("aayushman-auth-changed", fetchAppointments);

    return () => {
      window.removeEventListener("aayushman-auth-changed", fetchAppointments);
    };
  }, [fetchAppointments]);

  // Appointment status styling.
  const getStatusStyle = (status) => {
    const styles = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:!bg-yellow-500/10 dark:!text-yellow-300 dark:!border-yellow-500/20",
      accepted:
        "bg-green-100 text-green-700 dark:!bg-[#39B982]/10 dark:!text-[#55CD96] dark:!border-[#39B982]/25",
      rejected:
        "bg-red-100 text-red-700 dark:!bg-red-500/10 dark:!text-red-300 dark:!border-red-500/20",
      completed:
        "bg-blue-100 text-blue-700 dark:!bg-blue-500/10 dark:!text-blue-300 dark:!border-blue-500/20",
      cancelled:
        "bg-gray-100 text-gray-700 dark:!bg-white/5 dark:!text-gray-300 dark:!border-white/10",
    };

    return styles[status] || "bg-gray-100 text-gray-700";
  };

  // Loading state.
  if (loading) {
    return (
      <section className="mt-8 rounded-2xl border border-blue-100 bg-gradient-to-br from-[#F5F9FE] via-[#EAF4FC] to-[#DCEBFA] p-10 text-center dark:!border-[#3C4942] dark:!bg-gradient-to-br dark:!from-[#242C29] dark:!via-[#293831] dark:!to-[#30483A]">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600 dark:!border-[#3C4942] dark:!border-t-[#39B982]" />
        <p className="font-medium text-[#183B56] dark:!text-[#F5F7F5]">
          Loading your appointments...
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:!text-[#A0AEA5]">
          Please wait a moment.
        </p>
      </section>
    );
  }

  return (
    <section
      id="patient-appointments"
      className="mt-8 rounded-2xl border border-blue-100 bg-gradient-to-br from-[#F5F9FE] via-[#EAF4FC] to-[#DCEBFA] p-5 shadow-sm transition-colors duration-300 sm:p-7 dark:!border-[#3C4942] dark:!bg-gradient-to-br dark:!from-[#242C29] dark:!via-[#293831] dark:!to-[#30483A]"
    >
      {/* Section heading and refresh button */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl dark:!bg-[#39B982]/10">
              📅
            </span>

            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:!text-[#39B982]">
              Patient dashboard
            </span>
          </div>

          <h2 className="text-2xl font-bold text-[#183B56] dark:!text-[#F5F7F5]">
            My Appointments
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:!text-[#A0AEA5]">
            Track your bookings and connect with your doctor.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAppointments}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-[#00C2D1] px-4 py-2.5 text-sm font-semibold text-[#183B56] transition hover:bg-[#00C2D1]/10 disabled:opacity-50 dark:!border-[#3C4942] dark:!bg-[#242C29] dark:!text-[#39B982] dark:hover:!border-[#39B982]/50 dark:hover:!bg-[#303C36]"
        >
          <span className="text-lg">↻</span>
          Refresh
        </button>
      </div>

      {/* Appointment summary */}
      {!error && appointments.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Total",
              value: appointments.length,
              icon: "📋",
            },
            {
              label: "Pending",
              value: appointments.filter((a) => a.status === "pending").length,
              icon: "⏳",
            },
            {
              label: "Accepted",
              value: appointments.filter((a) => a.status === "accepted").length,
              icon: "✓",
            },
            {
              label: "Completed",
              value: appointments.filter((a) => a.status === "completed")
                .length,
              icon: "✦",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:!border-[#3C4942] dark:!bg-[#242C29]"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 dark:!text-[#A0AEA5]">
                  {item.label}
                </span>
                <span className="text-base text-blue-600 dark:!text-[#39B982]">
                  {item.icon}
                </span>
              </div>

              <p className="text-2xl font-bold text-[#183B56] dark:!text-[#F5F7F5]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:!border-red-500/20 dark:!bg-red-500/10">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-red-700 dark:!text-red-300">
                Unable to load appointments
              </h3>
              <p className="mt-1 text-sm text-red-600 dark:!text-red-200/80">
                {error}
              </p>
              <button
                type="button"
                onClick={fetchAppointments}
                className="mt-3 text-sm font-semibold text-red-700 underline dark:!text-red-300"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty appointment state */}
      {!error && appointments.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-12 text-center dark:!border-[#3C4942] dark:!bg-[#242C29]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-3xl dark:!bg-[#39B982]/10">
            📅
          </div>

          <h3 className="text-lg font-bold text-[#183B56] dark:!text-[#F5F7F5]">
            No appointments yet
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500 dark:!text-[#A0AEA5]">
            You haven't booked an appointment yet. Find a doctor and schedule
            your first consultation.
          </p>

          <Link
            to="/doctors"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 dark:!bg-[#39B982] dark:!text-[#10251B] dark:hover:!bg-[#55CD96]"
          >
            Find a Doctor
            <span>→</span>
          </Link>
        </div>
      )}

      {/* Appointment cards */}
      {!error && appointments.length > 0 && (
        <div className="grid gap-5 xl:grid-cols-2">
          {appointments.map((appointment) => {
            const doctor = appointment.doctor || appointment.doctorId || {};

            const doctorName = doctor.name || doctor.fullName || "Doctor";
            const doctorEmail = doctor.email || "Not available";
            const doctorPhone = doctor.phone || "Not available";

            const appointmentDate = appointment.appointmentDate
              ? new Date(appointment.appointmentDate)
              : null;

            const formattedDate =
              appointmentDate && !Number.isNaN(appointmentDate.getTime())
                ? appointmentDate.toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "Not available";

            const status = appointment.status || "unknown";

            return (
              <article
                key={appointment._id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:!border-[#3C4942] dark:!bg-[#242C29] dark:hover:!border-[#39B982]/40"
              >
                {/* Doctor header */}
                <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-5 dark:!border-[#3C4942]">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl dark:!bg-[#39B982]/10">
                      👨‍⚕️
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-500 dark:!text-[#A0AEA5]">
                        Consultation with
                      </p>
                      <h3 className="mt-1 truncate text-lg font-bold text-[#183B56] dark:!text-[#F5F7F5]">
                        Dr. {doctorName}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold capitalize ${getStatusStyle(
                      status,
                    )}`}
                  >
                    {status}
                  </span>
                </div>

                {/* Appointment information */}
                <div className="space-y-4 p-5">
                  <div className="rounded-xl bg-blue-50/70 p-4 dark:!bg-[#303C36]">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:!text-[#A0AEA5]">
                      Appointment date & time
                    </p>
                    <p className="mt-2 font-semibold text-[#183B56] dark:!text-[#F5F7F5]">
                      📅 {formattedDate}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 dark:!text-[#A0AEA5]">
                        Email address
                      </p>
                      <p className="mt-1 break-all text-sm font-medium text-gray-700 dark:!text-[#D0DAD3]">
                        {doctorEmail}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 dark:!text-[#A0AEA5]">
                        Phone number
                      </p>
                      <p className="mt-1 break-all text-sm font-medium text-gray-700 dark:!text-[#D0DAD3]">
                        {doctorPhone}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:!text-[#A0AEA5]">
                      Reason for appointment
                    </p>
                    <p className="mt-1 text-sm leading-6 text-gray-700 dark:!text-[#D0DAD3]">
                      {appointment.reason || "Not provided"}
                    </p>
                  </div>

                  <div className="border-t border-gray-100 pt-3 dark:!border-[#3C4942]">
                    <p className="break-all text-xs text-gray-400 dark:!text-[#A0AEA5]">
                      Appointment ID: {appointment._id}
                    </p>
                  </div>

                  {/* Accepted appointment: join video consultation */}
                  {status === "accepted" && (
                    <button
                      type="button"
                      onClick={() => setActiveAppointment(appointment)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white transition hover:bg-blue-700 dark:!bg-[#39B982] dark:!text-[#10251B] dark:hover:!bg-[#55CD96]"
                    >
                      <span className="text-lg">📹</span>
                      Join Video Consultation
                    </button>
                  )}

                  {/* Pending appointment message */}
                  {status === "pending" && (
                    <div className="flex items-start gap-3 rounded-xl bg-yellow-50 p-4 dark:!bg-yellow-500/10">
                      <span>⏳</span>
                      <p className="text-sm leading-5 text-yellow-800 dark:!text-yellow-200">
                        Your appointment request is waiting for the doctor to
                        accept it.
                      </p>
                    </div>
                  )}

                  {/* Rejected appointment message */}
                  {status === "rejected" && (
                    <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 dark:!bg-red-500/10">
                      <span>⚠️</span>
                      <p className="text-sm leading-5 text-red-700 dark:!text-red-300">
                        This appointment was rejected by the doctor.
                      </p>
                    </div>
                  )}

                  {/* Completed appointment message */}
                  {status === "completed" && (
                    <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4 dark:!bg-blue-500/10">
                      <span>✓</span>
                      <p className="text-sm leading-5 text-blue-700 dark:!text-blue-300">
                        This appointment has been completed.
                      </p>
                    </div>
                  )}

                  {/* Cancelled appointment message */}
                  {status === "cancelled" && (
                    <div className="flex items-start gap-3 rounded-xl bg-gray-100 p-4 dark:!bg-white/5">
                      <span>ℹ️</span>
                      <p className="text-sm leading-5 text-gray-700 dark:!text-gray-300">
                        This appointment has been cancelled.
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Open the shared video room for the selected appointment. */}
      {activeAppointment && (
        <VideoConsultation
          appointmentId={activeAppointment._id}
          displayName="AAYUSHMAN Patient"
          onClose={closeVideoMeeting}
        />
      )}
    </section>
  );
}

export default PatientAppointments;
