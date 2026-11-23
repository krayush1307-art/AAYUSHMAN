import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [reason, setReason] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");

  const getUserRole = () => {
    try {
      const user = JSON.parse(localStorage.getItem("aayushman-user"));
      return user?.role || "";
    } catch {
      return "";
    }
  };

  // Load active registered doctors from the existing public API.
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/users/doctors/public`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load doctors.");
      }

      setDoctors(data.doctors || []);
    } catch (err) {
      setError(err.message || "Unable to load doctors.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();

    window.addEventListener("aayushman-auth-changed", fetchDoctors);

    return () => {
      window.removeEventListener("aayushman-auth-changed", fetchDoctors);
    };
  }, [fetchDoctors]);

  // Search doctors by name.
  const filteredDoctors = useMemo(() => {
    const query = search.toLowerCase().trim();

    return doctors.filter((doctor) =>
      doctor.name?.toLowerCase().includes(query),
    );
  }, [doctors, search]);

  const getMinimumDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };
  // Demo profile photos for registered doctors.
  const doctorImages = [
    "/images/doctor-profile-1.jpg",
    "/images/doctor-profile-2.jpg",
    "/images/doctor-profile-3.jpg",
    "/images/doctor-profile-4.jpg",
    "/images/doctor-profile-5.jpg",
    "/images/doctor-profile-6.jpg",
  ];

  // Assign different photos using a consistent ordering of doctor IDs.
  const doctorImageMap = useMemo(() => {
    const sortedDoctors = [...doctors].sort((a, b) =>
      String(a._id).localeCompare(String(b._id)),
    );

    const imageMap = {};

    sortedDoctors.forEach((doctor, index) => {
      imageMap[doctor._id] = doctorImages[index % doctorImages.length];
    });

    return imageMap;
  }, [doctors]);

  const getDoctorImage = (doctor) =>
    doctor.profileImage ||
    doctor.avatar ||
    doctor.image ||
    doctorImageMap[doctor._id] ||
    "/images/doctor-profile-placeholder.jpg";
  // Open appointment booking after checking login and role.
  const openBooking = (doctor) => {
    const token = localStorage.getItem("aayushman-token");
    const role = getUserRole();

    setBookingMessage("");
    setBookingError("");

    if (!token) {
      setSelectedDoctor(null);
      setBookingError(
        "Please login with your patient account to book an appointment.",
      );
      return;
    }

    if (role !== "patient") {
      setSelectedDoctor(null);
      setBookingError("Only patient accounts can book appointments.");
      return;
    }

    setSelectedDoctor(doctor);
    setAppointmentDate("");
    setReason("");
  };

  // Submit appointment request using the existing API.
  const handleBooking = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("aayushman-token");

    if (!token || getUserRole() !== "patient") {
      setBookingError("Please login with your patient account first.");
      return;
    }

    if (!selectedDoctor || !appointmentDate || !reason.trim()) {
      setBookingError("Please complete all appointment details.");
      return;
    }

    try {
      setBooking(true);
      setBookingError("");
      setBookingMessage("");

      const response = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoctor._id,
          appointmentDate: new Date(appointmentDate).toISOString(),
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Appointment booking failed.");
      }

      setBookingMessage(
        data.message || "Appointment request submitted successfully!",
      );

      setSelectedDoctor(null);
      setAppointmentDate("");
      setReason("");
    } catch (err) {
      setBookingError(err.message || "Appointment booking failed.");
    } finally {
      setBooking(false);
    }
  };

  // Use a registered doctor's photo when available.
  // Otherwise show the shared doctor profile placeholder.

  return (
    <section
      id="doctors"
      className="bg-gradient-to-br from-[#F8FAFE] via-[#F0F6FC] to-[#E5EFF8] py-12 transition-colors duration-300 dark:bg-gradient-to-br dark:from-[#171C1B] dark:via-[#20272A] dark:to-[#26353A] sm:py-16"
    >
      {/* Full-width healthcare banner */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative isolate min-h-[390px] overflow-hidden rounded-[2rem] bg-slate-800 sm:min-h-[450px]">
          {/* Image: wide photograph of an Indian doctor consulting a patient */}
          <img
            src="/images/doctors-hero.jpg"
            alt="Doctor providing healthcare consultation to a patient"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/90 via-slate-900/65 to-slate-900/15 dark:from-[#101B16]/95 dark:via-[#17251E]/75 dark:to-[#17251E]/25" />

          <div className="flex min-h-[390px] max-w-2xl flex-col justify-center px-6 py-12 sm:min-h-[450px] sm:px-12 lg:px-16">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold tracking-widest text-white backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[#55CD96]" />
              TRUSTED HEALTHCARE PROFESSIONALS
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Your Health Deserves
              <span className="block text-[#55CD96]">Expert Care.</span>
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-white/85 sm:text-base">
              Connect with registered doctors, find the right healthcare
              professional and request an appointment from the comfort of your
              home.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#doctor-list"
                className="rounded-xl bg-[#39B982] px-6 py-3.5 text-sm font-bold text-[#10251B] shadow-lg transition hover:bg-[#55CD96]"
              >
                Explore Doctors ↓
              </a>

              <span className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-sm">
                <span>🩺</span>
                Healthcare Closer to You
              </span>
            </div>
          </div>
        </div>

        {/* Search and doctor directory */}
        <div id="doctor-list" className="scroll-mt-24 pt-16">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-[#55CD96]">
                Meet Our Professionals
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-[#F5F7F5] sm:text-4xl">
                Find Your Doctor
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-[#A0AEA5]">
                Explore registered healthcare professionals and choose a doctor
                for your consultation.
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 px-5 py-3 dark:bg-[#242C29]">
              <p className="text-sm font-semibold text-blue-800 dark:text-[#55CD96]">
                🩺 Patient-focused healthcare
              </p>
            </div>
          </div>

          {/* Doctor search */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[#3C4942] dark:bg-[#242C29] sm:p-5">
            <label
              htmlFor="doctor-search"
              className="mb-3 block text-sm font-bold text-slate-800 dark:text-[#F5F7F5]"
            >
              Search Registered Doctors
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 dark:border-[#3C4942] dark:bg-[#1E2522]">
              <span className="text-xl">🔍</span>
              <input
                id="doctor-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Enter doctor's name..."
                aria-label="Search doctors"
                className="w-full bg-transparent py-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-[#F5F7F5] dark:placeholder:text-[#77877D]"
              />
            </div>
          </div>

          {/* Login or booking messages */}
          {bookingError && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/20 dark:bg-amber-500/10">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {bookingError}
              </p>

              {!localStorage.getItem("aayushman-token") && (
                <Link
                  to="/login"
                  className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 dark:bg-[#39B982] dark:text-[#10251B] dark:hover:bg-[#55CD96]"
                >
                  Login to Continue
                </Link>
              )}
            </div>
          )}

          {bookingMessage && !selectedDoctor && (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm font-semibold text-green-700 dark:border-[#39B982]/30 dark:bg-[#39B982]/10 dark:text-[#55CD96]">
              ✓ {bookingMessage}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="py-20 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600 dark:border-[#303C36] dark:border-t-[#39B982]" />
              <p className="mt-4 text-sm font-medium text-slate-500 dark:text-[#A0AEA5]">
                Loading registered doctors...
              </p>
            </div>
          )}

          {/* API error */}
          {!loading && error && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-7 text-center dark:border-red-400/20 dark:bg-red-400/10">
              <p className="font-semibold text-red-700 dark:text-red-300">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchDoctors}
                className="mt-5 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 dark:bg-[#39B982] dark:text-[#10251B]"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Doctor count */}
          {!loading && !error && (
            <div className="mt-8 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500 dark:text-[#A0AEA5]">
                <span className="font-bold text-slate-900 dark:text-[#F5F7F5]">
                  {filteredDoctors.length}
                </span>{" "}
                registered doctor(s) found
              </p>
            </div>
          )}

          {/* Doctor profile cards */}
          {!loading && !error && filteredDoctors.length > 0 && (
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDoctors.map((doctor) => (
                <article
                  key={doctor._id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-[#3C4942] dark:bg-[#242C29] dark:hover:border-[#39B982]/50"
                >
                  {/* Doctor profile photograph */}
                  <div className="relative h-64 overflow-hidden bg-blue-50 dark:bg-[#1E2522]">
                    <div className="absolute inset-0 flex items-center justify-center text-7xl">
                      🩺
                    </div>

                    <img
                      src={getDoctorImage(doctor)}
                      alt={`Dr. ${doctor.name}`}
                      loading="lazy"
                      className="relative z-10 h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />

                    <div className="absolute bottom-4 left-4 z-20 rounded-full border border-white/50 bg-white/95 px-3 py-2 text-xs font-bold text-slate-800 shadow-sm dark:border-[#3C4942] dark:bg-[#242C29]/95 dark:text-[#55CD96]">
                      ✓ Registered Professional
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-[#55CD96]">
                      Healthcare Professional
                    </p>

                    <h3 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-[#F5F7F5]">
                      Dr. {doctor.name}
                    </h3>

                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-[#A0AEA5]">
                      <span>📅</span>
                      <span>
                        Registered:{" "}
                        {doctor.createdAt
                          ? new Date(doctor.createdAt).toLocaleDateString(
                              "en-IN",
                            )
                          : "Date unavailable"}
                      </span>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-5 dark:border-[#3C4942]">
                      <button
                        type="button"
                        onClick={() => openBooking(doctor)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 dark:bg-[#39B982] dark:text-[#10251B] dark:hover:bg-[#55CD96]"
                      >
                        Book Appointment <span>→</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Empty result */}
          {!loading && !error && filteredDoctors.length === 0 && (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-5 py-14 text-center dark:border-[#3C4942] dark:bg-[#242C29]">
              <div className="text-5xl">🩺</div>

              <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-[#F5F7F5]">
                {doctors.length === 0
                  ? "No Registered Doctors Yet"
                  : "No Doctors Found"}
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-[#A0AEA5]">
                {doctors.length === 0
                  ? "Registered doctors will appear here when they become available."
                  : "Try searching with another doctor's name."}
              </p>
            </div>
          )}
        </div>

        {/* Appointment booking form */}
        {selectedDoctor && (
          <div className="mx-auto mt-12 max-w-3xl scroll-mt-24 rounded-3xl border border-blue-200 bg-blue-50 p-5 shadow-sm dark:border-[#3C4942] dark:bg-[#242C29] sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-[#55CD96]">
                  Appointment Request
                </p>

                <h3 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-[#F5F7F5]">
                  Book Your Consultation
                </h3>

                <p className="mt-2 text-sm text-slate-600 dark:text-[#A0AEA5]">
                  Doctor:{" "}
                  <span className="font-bold text-slate-900 dark:text-[#55CD96]">
                    Dr. {selectedDoctor.name}
                  </span>
                </p>
              </div>

              <span className="rounded-xl bg-white px-4 py-2 text-2xl dark:bg-[#303C36]">
                🩺
              </span>
            </div>

            <form onSubmit={handleBooking} className="mt-7 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-[#D0DAD3]">
                  Appointment Date and Time
                </label>

                <input
                  type="datetime-local"
                  required
                  min={getMinimumDateTime()}
                  value={appointmentDate}
                  onChange={(event) => setAppointmentDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-[#3C4942] dark:bg-[#1E2522] dark:text-[#F5F7F5] dark:focus:border-[#39B982]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-[#D0DAD3]">
                  Describe Your Health Problem
                </label>

                <textarea
                  required
                  rows="4"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Briefly describe why you need a consultation..."
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-[#3C4942] dark:bg-[#1E2522] dark:text-[#F5F7F5] dark:placeholder:text-[#77877D] dark:focus:border-[#39B982]"
                />
              </div>

              {bookingError && (
                <p className="text-sm text-red-600 dark:text-red-300">
                  {bookingError}
                </p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={booking}
                  className="flex-1 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60 dark:bg-[#39B982] dark:text-[#10251B] dark:hover:bg-[#55CD96]"
                >
                  {booking ? "Submitting..." : "Confirm Appointment"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedDoctor(null);
                    setBookingError("");
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 dark:border-[#3C4942] dark:bg-[#303C36] dark:text-[#F5F7F5] dark:hover:bg-[#3C4942]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Healthcare disclaimer */}
        <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-[#3C4942] dark:bg-[#242C29]">
          <p className="text-xs leading-6 text-slate-500 dark:text-[#A0AEA5]">
            <strong className="text-slate-700 dark:text-[#D0DAD3]">
              Important:
            </strong>{" "}
            AAYUSHMAN is a portfolio prototype. Doctor registration does not
            independently verify qualifications, current availability or
            consultation arrangements. Please confirm details before relying on
            a healthcare service.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Doctors;
