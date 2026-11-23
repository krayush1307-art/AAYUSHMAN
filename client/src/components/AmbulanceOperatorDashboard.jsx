import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_URL = "http://localhost:5000/api/ambulance";

// Leaflet map marker.
const markerIcon = new L.Icon({
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  iconRetinaUrl: new URL(
    "leaflet/dist/images/marker-icon-2x.png",
    import.meta.url,
  ).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url)
    .href,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapFocus({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 17, { duration: 0.7 });
    }
  }, [map, position]);

  return null;
}

// Patient pickup location map.
function PickupMap({ booking }) {
  if (
    typeof booking.latitude !== "number" ||
    typeof booking.longitude !== "number"
  ) {
    return (
      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
        <p className="font-semibold">📍 Pickup location unavailable</p>
        <p className="mt-1">Patient ne map location provide nahi ki hai.</p>
      </div>
    );
  }

  const position = [booking.latitude, booking.longitude];

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 dark:border-[#3C4942]">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-[#3C4942] dark:bg-[#303C36]">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-lg dark:bg-[#39B982]/15">
          📍
        </span>
        <div>
          <p className="font-semibold text-slate-800 dark:text-[#F5F7F5]">
            Patient Pickup Location
          </p>
          <p className="text-xs text-slate-500 dark:text-[#A0AEA5]">
            Exact location shared by patient
          </p>
        </div>
      </div>

      <MapContainer
        center={position}
        zoom={17}
        scrollWheelZoom
        className="h-[280px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFocus position={position} />
        <Marker position={position} icon={markerIcon} />
      </MapContainer>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 dark:bg-[#242C29]">
        <span className="text-xs text-slate-500 dark:text-[#A0AEA5]">
          {booking.latitude.toFixed(6)}, {booking.longitude.toFixed(6)}
        </span>

        <a
          href={`https://www.google.com/maps?q=${booking.latitude},${booking.longitude}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold text-blue-600 hover:underline dark:text-[#39B982]"
        >
          Open in Google Maps ↗
        </a>
      </div>
    </div>
  );
}

// Share the operator's live GPS location while the ambulance is on the way.
function LiveGpsSharing({ bookingId }) {
  const [gpsStatus, setGpsStatus] = useState("Starting GPS...");
  const lastSentRef = useRef(0);

  useEffect(() => {
    const token = localStorage.getItem("aayushman-token");

    if (!token) {
      setGpsStatus("Please login again.");
      return;
    }

    if (!navigator.geolocation) {
      setGpsStatus("GPS is not supported by this browser.");
      return;
    }

    let active = true;

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        if (!active) return;

        // Avoid sending GPS updates too frequently.
        const now = Date.now();

        if (now - lastSentRef.current < 5000) return;
        lastSentRef.current = now;

        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(`${API_URL}/${bookingId}/location`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ latitude, longitude }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "GPS update failed.");
          }

          if (active) {
            setGpsStatus(
              `GPS sharing active • Updated ${new Date().toLocaleTimeString()}`,
            );
          }
        } catch (error) {
          if (active) setGpsStatus(error.message);
        }
      },
      (error) => {
        if (!active) return;

        const messages = {
          1: "Location permission denied. Please allow location access.",
          2: "GPS location is currently unavailable.",
          3: "GPS request timed out. Please try again.",
        };

        setGpsStatus(messages[error.code] || "Unable to access GPS.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      },
    );

    return () => {
      active = false;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [bookingId]);

  return (
    <div className="mt-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 dark:border-[#39B982]/30 dark:bg-[#39B982]/10">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-xl dark:bg-[#39B982]/15">
          📡
        </span>
        <div>
          <p className="font-semibold text-cyan-900 dark:text-[#55CD96]">
            Live GPS Sharing
          </p>
          <p className="mt-1 text-xs text-cyan-800 dark:text-[#D0DAD3]">
            {gpsStatus}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-cyan-800 dark:text-[#A0AEA5]">
        Keep this dashboard open and location access enabled while travelling.
      </p>
    </div>
  );
}

// Booking status indicator.
function StatusBadge({ status }) {
  const styles = {
    requested:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    accepted:
      "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
    "on-the-way":
      "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-300",
    arrived:
      "bg-green-100 text-green-800 dark:bg-[#39B982]/15 dark:text-[#55CD96]",
    completed:
      "bg-slate-200 text-slate-700 dark:bg-[#3C4942] dark:text-[#D0DAD3]",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${
        styles[status] || styles.requested
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

// Reusable dashboard statistic.
function StatCard({ title, value, icon, description, color }) {
  const colors = {
    amber:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    green:
      "bg-green-100 text-green-700 dark:bg-[#39B982]/15 dark:text-[#55CD96]",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-[#3C4942] dark:bg-[#242C29]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-[#A0AEA5]">
            {title}
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-800 dark:text-[#F5F7F5]">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-[#A0AEA5]">
            {description}
          </p>
        </div>

        <span
          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
            colors[color]
          }`}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}

function AmbulanceOperatorDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const fetchBookings = useCallback(async () => {
    const token = localStorage.getItem("aayushman-token");

    if (!token) {
      setError("Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/operator`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load requests.");
      }

      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateBooking = async (bookingId, url, body) => {
    const token = localStorage.getItem("aayushman-token");

    try {
      setUpdatingId(bookingId);
      setMessage("");
      setError("");

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update booking.");
      }

      setMessage(data.message || "Booking updated successfully.");
      await fetchBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId("");
    }
  };

  const updateDecision = async (bookingId, decision) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${decision} this ambulance request?`,
    );

    if (!confirmed) return;

    await updateBooking(bookingId, `${API_URL}/${bookingId}/decision`, {
      decision,
    });
  };

  const updateStatus = async (bookingId, status) => {
    await updateBooking(bookingId, `${API_URL}/${bookingId}/status`, {
      status,
    });
  };

  const pendingCount = bookings.filter(
    (booking) => booking.status === "requested",
  ).length;

  const activeCount = bookings.filter((booking) =>
    ["accepted", "on-the-way", "arrived"].includes(booking.status),
  ).length;

  return (
    <section id="ambulance-operator" className="mt-10 scroll-mt-24">
      {/* Dashboard heading */}
      <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold tracking-wide text-blue-700 dark:bg-[#39B982]/10 dark:text-[#55CD96]">
            <span className="h-2 w-2 rounded-full bg-current" />
            EMERGENCY OPERATIONS
          </div>

          <h3 className="mt-3 text-2xl font-bold text-slate-800 dark:text-[#F5F7F5] sm:text-3xl">
            Ambulance Operator Dashboard
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-[#A0AEA5]">
            Review patient requests, view pickup locations and manage ambulance
            booking status from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBookings}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#39B982] dark:text-[#10251B] dark:hover:bg-[#55CD96]"
        >
          <span className="text-lg">↻</span>
          {loading ? "Refreshing..." : "Refresh Requests"}
        </button>
      </div>

      {/* Success and error messages */}
      {message && (
        <div
          role="status"
          className="mb-5 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-[#39B982]/30 dark:bg-[#39B982]/10 dark:text-[#55CD96]"
        >
          <span className="text-lg">✓</span>
          <p>{message}</p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-5 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={fetchBookings}
            className="shrink-0 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Booking statistics */}
      <div className="mb-7 grid gap-4 sm:grid-cols-2">
        <StatCard
          title="Pending Requests"
          value={pendingCount}
          icon="⏳"
          description="Waiting for your response"
          color="amber"
        />

        <StatCard
          title="Active Bookings"
          value={activeCount}
          icon="🚑"
          description="Accepted or in progress"
          color="green"
        />
      </div>

      {/* Booking list */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-[#F5F7F5]">
            Ambulance Requests
          </h4>
          <p className="mt-1 text-sm text-slate-500 dark:text-[#A0AEA5]">
            Manage incoming patient bookings
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-[#303C36] dark:text-[#D0DAD3]">
          {bookings.length} Total
        </span>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-[#3C4942] dark:bg-[#242C29]">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-[#3C4942] dark:border-t-[#39B982]" />
          <p className="text-sm text-slate-600 dark:text-[#D0DAD3]">
            Loading ambulance requests...
          </p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center dark:border-[#3C4942] dark:bg-[#242C29]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-4xl dark:bg-[#39B982]/10">
            🚑
          </div>

          <h4 className="mt-5 text-xl font-bold text-slate-800 dark:text-[#F5F7F5]">
            No Ambulance Requests
          </h4>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-[#A0AEA5]">
            New patient ambulance requests will appear here when someone books
            an ambulance.
          </p>

          <button
            type="button"
            onClick={fetchBookings}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-[#39B982] dark:text-[#10251B] dark:hover:bg-[#55CD96]"
          >
            Refresh Requests
          </button>
        </div>
      ) : (
        <div className="grid gap-5">
          {bookings.map((booking) => {
            const isBusy = updatingId === booking._id;
            const patient = booking.patient || {};

            return (
              <article
                key={booking._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-[#3C4942] dark:bg-[#242C29]"
              >
                {/* Booking card header */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-[#3C4942] sm:p-6">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-2xl dark:bg-red-500/10">
                      🚨
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-[#39B982]">
                        {booking.emergencyType || "Emergency Request"}
                      </p>

                      <h4 className="mt-1 break-words text-lg font-bold text-slate-800 dark:text-[#F5F7F5]">
                        {booking.patientName || patient.name || "Patient"}
                      </h4>

                      <p className="mt-1 text-sm text-slate-500 dark:text-[#A0AEA5]">
                        Phone:{" "}
                        {booking.phone || patient.phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={booking.status} />
                </div>

                {/* Patient information */}
                <div className="p-5 sm:p-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-[#A0AEA5]">
                        <span>📍</span> Pickup Address
                      </p>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-800 dark:text-[#F5F7F5]">
                        {booking.location || "Address unavailable"}
                      </p>
                    </div>

                    {booking.notes && (
                      <div className="sm:col-span-2">
                        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-[#A0AEA5]">
                          <span>📝</span> Additional Details
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-[#D0DAD3]">
                          {booking.notes}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-[#A0AEA5]">
                        <span>🕒</span> Request Time
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-800 dark:text-[#F5F7F5]">
                        {booking.createdAt
                          ? new Date(booking.createdAt).toLocaleString()
                          : "Not available"}
                      </p>
                    </div>
                  </div>

                  <PickupMap booking={booking} />

                  {/* Booking actions */}
                  {booking.status === "requested" && (
                    <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 dark:border-[#3C4942] sm:grid-cols-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => updateDecision(booking._id, "accepted")}
                        className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#39B982] dark:text-[#10251B] dark:hover:bg-[#55CD96]"
                      >
                        {isBusy ? "Please wait..." : "✓ Accept Request"}
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => updateDecision(booking._id, "rejected")}
                        className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isBusy ? "Please wait..." : "✕ Reject Request"}
                      </button>
                    </div>
                  )}

                  {booking.status === "accepted" && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => updateStatus(booking._id, "on-the-way")}
                      className="mt-5 w-full rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#39B982] dark:text-[#10251B] dark:hover:bg-[#55CD96]"
                    >
                      {isBusy
                        ? "Please wait..."
                        : "🚑 Mark Ambulance On the Way"}
                    </button>
                  )}

                  {booking.status === "on-the-way" && (
                    <>
                      <LiveGpsSharing bookingId={booking._id} />

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => updateStatus(booking._id, "arrived")}
                        className="mt-5 w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#39B982] dark:text-[#10251B] dark:hover:bg-[#55CD96]"
                      >
                        {isBusy ? "Please wait..." : "📍 Mark as Arrived"}
                      </button>
                    </>
                  )}

                  {booking.status === "arrived" && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => updateStatus(booking._id, "completed")}
                      className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#39B982] dark:text-[#10251B] dark:hover:bg-[#55CD96]"
                    >
                      {isBusy ? "Please wait..." : "✓ Complete Booking"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Demo disclaimer */}
      <div className="mt-7 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/25 dark:bg-amber-500/10">
        <span className="text-xl">⚠️</span>
        <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
          <strong>Demo feature:</strong> GPS updates are shared only while this
          operator dashboard is open and the booking is On the Way. This does
          not dispatch a real ambulance. For a real emergency in India, call
          112.
        </p>
      </div>
    </section>
  );
}

export default AmbulanceOperatorDashboard;
