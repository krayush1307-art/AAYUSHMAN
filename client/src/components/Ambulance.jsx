import { useCallback, useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const API_URL = "http://localhost:5000/api/ambulance";
const DEFAULT_CENTER = [25.5941, 85.1376];

function getToken() {
  return localStorage.getItem("aayushman-token");
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("aayushman-user") || "null");
  } catch {
    return null;
  }
}

// Reusable notification component.
function ToastNotification({ toast, onClose }) {
  if (!toast) return null;

  const styles = {
    success:
      "border-green-200 bg-white text-green-800 dark:border-[#39B982]/40 dark:bg-[#242C29] dark:text-[#55CD96]",
    warning:
      "border-amber-200 bg-white text-amber-800 dark:border-amber-400/40 dark:bg-[#242C29] dark:text-amber-200",
    error:
      "border-red-200 bg-white text-red-700 dark:border-red-400/40 dark:bg-[#242C29] dark:text-red-200",
    info: "border-blue-200 bg-white text-blue-800 dark:border-[#3C4942] dark:bg-[#242C29] dark:text-[#D0DAD3]",
  };

  const icons = {
    success: "✓",
    warning: "!",
    error: "×",
    info: "i",
  };

  const titles = {
    success: "Success!",
    warning: "Attention!",
    error: "Something went wrong",
    info: "Information",
  };

  return (
    <div
      key={toast.id}
      role={toast.type === "error" ? "alert" : "status"}
      aria-live="polite"
      className={`fixed right-4 top-24 z-[1000] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-2xl sm:right-6 ${styles[toast.type] || styles.info}`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/5 text-lg font-bold dark:bg-white/5">
        {icons[toast.type] || icons.info}
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-bold">{titles[toast.type] || titles.info}</p>
        <p className="mt-1 text-sm leading-5">{toast.text}</p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="text-xl opacity-60 transition hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}

// Reverse geocoding: convert map coordinates into an address.
async function getAddressFromCoordinates(latitude, longitude) {
  try {
    const response = await fetch(
      `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`,
    );

    if (!response.ok) return "";

    const data = await response.json();
    const place = data.features?.[0]?.properties;

    if (!place) return "";

    const addressParts = [
      place.name,
      place.street,
      place.district,
      place.city,
      place.state,
      place.postcode,
    ].filter(Boolean);

    return [...new Set(addressParts)].join(", ");
  } catch (error) {
    console.error("Address lookup failed:", error);
    return "";
  }
}

function MapController({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 17, { duration: 0.7 });
    }
  }, [map, position]);

  return null;
}

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

function DraggableMarker({ position, onSelect }) {
  return (
    <Marker
      position={position}
      icon={markerIcon}
      draggable
      eventHandlers={{
        dragend(event) {
          const point = event.target.getLatLng();
          onSelect([point.lat, point.lng]);
        },
      }}
    />
  );
}

// Patient-side live ambulance tracking.
function LiveAmbulanceTracking({ booking }) {
  const [tracking, setTracking] = useState(null);
  const [trackingError, setTrackingError] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(true);
  const [trackingActive, setTrackingActive] = useState(true);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const previousStatus = useRef(null);

  const showTrackingToast = (type, text) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    setToast({ id: Date.now(), type, text });

    toastTimer.current = setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    let active = true;
    let intervalId;

    const fetchTracking = async () => {
      try {
        const response = await fetch(`${API_URL}/${booking._id}/track`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to get ambulance location.");
        }

        if (!active) return;

        const nextTracking = data.tracking;

        // Notify only when the booking status actually changes.
        if (
          previousStatus.current &&
          previousStatus.current !== nextTracking.status
        ) {
          const statusMessages = {
            accepted: "Your ambulance request has been accepted.",
            "on-the-way": "Your ambulance is now on the way!",
            arrived: "Your ambulance has arrived at the pickup location.",
            completed: "Your ambulance booking has been completed.",
            cancelled: "Your ambulance booking has been cancelled.",
            rejected: "Your ambulance request has been rejected.",
          };

          showTrackingToast(
            nextTracking.status === "rejected" ||
              nextTracking.status === "cancelled"
              ? "warning"
              : "success",
            statusMessages[nextTracking.status] ||
              `Ambulance status updated: ${nextTracking.status}.`,
          );
        }

        previousStatus.current = nextTracking.status;

        setTracking(nextTracking);
        setTrackingError("");
        setTrackingLoading(false);

        // Stop polling after arrival, completion or cancellation.
        if (
          ["arrived", "completed", "cancelled", "rejected"].includes(
            nextTracking.status,
          )
        ) {
          setTrackingActive(false);
        }
      } catch (error) {
        if (active) {
          setTrackingError(error.message);
          setTrackingLoading(false);
        }
      }
    };

    fetchTracking();

    if (trackingActive) {
      intervalId = window.setInterval(fetchTracking, 5000);
    }

    return () => {
      active = false;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [booking._id, trackingActive]);

  const hasCoordinates =
    typeof tracking?.latitude === "number" &&
    typeof tracking?.longitude === "number";

  const ambulancePosition = hasCoordinates
    ? [tracking.latitude, tracking.longitude]
    : null;

  return (
    <div className="relative mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-[#3C4942] dark:bg-[#1E2522]">
      <ToastNotification
        toast={toast}
        onClose={() => {
          if (toastTimer.current) {
            clearTimeout(toastTimer.current);
            toastTimer.current = null;
          }
          setToast(null);
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-bold text-[#183B56] dark:text-[#F5F7F5]">
          🚑 Live Ambulance Tracking
        </h4>

        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-[#39B982]/15 dark:text-[#55CD96]">
          {trackingActive ? "Live • 5-second updates" : "Tracking stopped"}
        </span>
      </div>

      {trackingLoading ? (
        <p className="mt-3 text-sm text-gray-600 dark:text-[#A0AEA5]">
          Getting ambulance location...
        </p>
      ) : trackingError ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-300">
          {trackingError}
        </p>
      ) : !hasCoordinates ? (
        <p className="mt-3 text-sm text-gray-600 dark:text-[#A0AEA5]">
          Waiting for the ambulance operator's first GPS location. Keep this
          page open.
        </p>
      ) : (
        <>
          <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 dark:border-[#3C4942]">
            <MapContainer
              center={ambulancePosition}
              zoom={16}
              scrollWheelZoom
              className="h-[300px] w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapController position={ambulancePosition} />
              <Marker position={ambulancePosition} icon={markerIcon} />
            </MapContainer>
          </div>

          <p className="mt-3 text-sm text-gray-700 dark:text-[#D0DAD3]">
            Ambulance coordinates: {tracking.latitude.toFixed(6)},{" "}
            {tracking.longitude.toFixed(6)}
          </p>

          {tracking.vehicleNumber && (
            <p className="mt-1 text-sm text-gray-700 dark:text-[#D0DAD3]">
              Vehicle: {tracking.vehicleNumber}
            </p>
          )}

          {tracking.lastLocationUpdate && (
            <p className="mt-1 text-xs text-gray-500 dark:text-[#A0AEA5]">
              Last GPS update:{" "}
              {new Date(tracking.lastLocationUpdate).toLocaleTimeString()}
            </p>
          )}

          <a
            href={`https://www.google.com/maps?q=${tracking.latitude},${tracking.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm font-semibold text-blue-700 hover:underline dark:text-[#55CD96]"
          >
            Open ambulance location in Google Maps ↗
          </a>
        </>
      )}

      {tracking?.status === "arrived" && (
        <p className="mt-3 text-sm font-semibold text-green-700 dark:text-[#55CD96]">
          Ambulance has marked itself as arrived.
        </p>
      )}

      {tracking?.status === "completed" && (
        <p className="mt-3 text-sm font-semibold text-gray-600 dark:text-[#A0AEA5]">
          This ambulance booking has been completed.
        </p>
      )}
    </div>
  );
}

function Ambulance() {
  const user = getStoredUser();

  const [patientName, setPatientName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState("");
  const [emergencyType, setEmergencyType] = useState("Medical Emergency");
  const [notes, setNotes] = useState("");

  const [position, setPosition] = useState(null);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const isPatient = user?.role === "patient";

  // Shared notification function for this page.
  const showToast = (type, text) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    setToast({ id: Date.now(), type, text });

    toastTimer.current = setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 3500);
  };

  const closeToast = () => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
    setToast(null);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  // Load patient booking history.
  const loadBookings = useCallback(async () => {
    const token = getToken();

    if (!token || !isPatient) {
      setHistoryLoading(false);
      return false;
    }

    try {
      setHistoryLoading(true);

      const response = await fetch(`${API_URL}/patient`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load booking history.");
      }

      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
      return true;
    } catch (error) {
      showToast("error", error.message || "Could not load booking history.");
      return false;
    } finally {
      setHistoryLoading(false);
    }
  }, [isPatient]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Select a pickup point and try to find its address.
  const updateSelectedPosition = async (coords) => {
    setPosition(coords);

    const address = await getAddressFromCoordinates(coords[0], coords[1]);

    if (address) {
      setLocation(address);
      showToast("success", "Pickup location selected and address updated.");
    } else {
      showToast(
        "warning",
        "Pickup pin selected. Please enter or verify the address manually.",
      );
    }
  };

  // Use the device's GPS location.
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast("error", "Your browser does not support location access.");
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (result) => {
        const coords = [result.coords.latitude, result.coords.longitude];

        await updateSelectedPosition(coords);
        setGettingLocation(false);
      },
      (error) => {
        setGettingLocation(false);

        if (error.code === error.PERMISSION_DENIED) {
          showToast(
            "error",
            "Location permission denied. Allow location in your browser or select it manually on the map.",
          );
        } else {
          showToast(
            "error",
            "Could not get your current location. Please select it manually on the map.",
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  // Submit a demo ambulance request.
  const submitBooking = async (event) => {
    event.preventDefault();

    if (!getToken()) {
      showToast("warning", "Please login before requesting an ambulance.");
      return;
    }

    if (!isPatient) {
      showToast("warning", "Only patient accounts can request an ambulance.");
      return;
    }

    if (!position) {
      showToast("warning", "Please select your pickup location on the map.");
      return;
    }

    if (!patientName.trim() || !phone.trim() || !location.trim()) {
      showToast("warning", "Please enter your name, phone number and address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          patientName: patientName.trim(),
          phone: phone.trim(),
          location: location.trim(),
          emergencyType,
          notes: notes.trim(),
          latitude: position[0],
          longitude: position[1],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ambulance request failed.");
      }

      setNotes("");

      showToast(
        "success",
        "Demo request submitted. No real ambulance has been contacted or dispatched.",
      );

      await loadBookings();
    } catch (error) {
      showToast(
        "error",
        error.message || "Could not submit ambulance request.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshBookings = async () => {
    const success = await loadBookings();

    if (success) {
      showToast("success", "Ambulance booking history refreshed.");
    }
  };

  const statusClass = (status) => {
    const styles = {
      requested:
        "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200",
      accepted:
        "bg-blue-100 text-blue-800 dark:bg-blue-400/15 dark:text-blue-200",
      rejected: "bg-red-100 text-red-800 dark:bg-red-400/15 dark:text-red-200",
      "on-the-way":
        "bg-cyan-100 text-cyan-800 dark:bg-cyan-400/15 dark:text-cyan-200",
      arrived:
        "bg-green-100 text-green-800 dark:bg-green-400/15 dark:text-green-200",
      completed:
        "bg-gray-100 text-gray-700 dark:bg-[#303C36] dark:text-[#D0DAD3]",
      cancelled:
        "bg-gray-100 text-gray-700 dark:bg-[#303C36] dark:text-[#D0DAD3]",
    };

    return styles[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <section
      id="ambulance"
      className="overflow-hidden bg-gradient-to-br from-[#F5F9FE] via-[#EAF2FA] to-[#D9E8F5] px-4 py-14 transition-colors duration-300 dark:bg-gradient-to-br dark:from-[#171C1B] dark:via-[#20272A] dark:to-[#29383D] sm:px-6 sm:py-20 lg:px-8"
    >
      <ToastNotification toast={toast} onClose={closeToast} />

      <div className="mx-auto max-w-7xl">
        {/* Introduction: text on left, ambulance image on right */}
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:bg-[#39B982]/10 dark:text-[#55CD96]">
              🚑 Emergency Support
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-[#f35151] dark:text-[#f37575] sm:text-5xl">
              Ambulance{" "}
              <span className="text-blue-600 dark:text-[#39B982]">
                Services
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-gray-600 dark:text-[#A0AEA5]">
              Select your pickup location, submit a demonstration request and
              follow the operator's location when live tracking is available.
            </p>

            <div className="mt-7 flex flex-wrap gap-4">
              {isPatient ? (
                <a
                  href="#ambulance-request"
                  className="rounded-xl bg-blue-600 px-7 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 dark:bg-[#39B982] dark:text-[#10251B] dark:shadow-none dark:hover:bg-[#55CD96]"
                >
                  Request Ambulance ↓
                </a>
              ) : (
                <p className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 dark:border-[#3C4942] dark:text-[#D0DAD3]">
                  Patient login required to request an ambulance.
                </p>
              )}

              <a
                href="#ambulance-history"
                className="rounded-xl border border-slate-300 px-6 py-3.5 font-bold text-[#183B56] transition hover:bg-blue-50 dark:border-[#3C4942] dark:text-[#F5F7F5] dark:hover:bg-[#242C29]"
              >
                My Requests
              </a>
            </div>

            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-400/30 dark:bg-red-400/10">
              <p className="font-bold text-red-800 dark:text-red-200">
                <span className="mr-2">☎</span>
                Real emergency in India? Call 112.
              </p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-200/80">
                This AAYUSHMAN ambulance feature is a portfolio demonstration
                and does not dispatch a real vehicle.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="relative h-[300px] overflow-hidden rounded-[2rem] bg-blue-100 shadow-xl dark:bg-[#242C29] sm:h-[400px]">
              {/* Image: Indian ambulance on a rural road, showing emergency healthcare access */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 text-7xl dark:from-[#303C36] dark:to-[#1E2522]">
                🚑
              </div>

              <img
                src="/images/ambulance-emergency.jpg"
                alt="Ambulance providing emergency healthcare support on a rural road"
                className="absolute inset-0 h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />

              <div className="absolute bottom-7 left-7 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-white/80">
                  AAYUSHMAN EMERGENCY SUPPORT
                </p>
                <h2 className="mt-2 max-w-sm text-2xl font-extrabold sm:text-3xl">
                  Helping connect patients with emergency support
                </h2>
              </div>
            </div>

            <div className="absolute -bottom-5 right-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-[#3C4942] dark:bg-[#242C29] sm:-right-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-2xl dark:bg-[#39B982]/15">
                  <span>📍</span>
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-[#F5F7F5]">
                    Location-based Request
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-[#A0AEA5]">
                    Select your pickup point
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking form */}
        {!isPatient ? (
          <div className="mt-16 rounded-2xl border border-blue-200 bg-blue-50 p-6 text-center text-blue-900 dark:border-[#3C4942] dark:bg-[#242C29] dark:text-[#D0DAD3]">
            Please login with a patient account to request an ambulance.
          </div>
        ) : (
          <form
            id="ambulance-request"
            onSubmit={submitBooking}
            className="mt-20 scroll-mt-24 rounded-3xl border border-gray-200 bg-gray-50 p-5 dark:border-[#3C4942] dark:bg-[#242C29] sm:p-8 lg:p-10"
          >
            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-[#55CD96]">
                Emergency Request
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-[#183B56] dark:text-[#F5F7F5] sm:text-3xl">
                Request Demo Ambulance
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-[#A0AEA5]">
                Enter patient details and carefully select the pickup point on
                the map. You can drag the pin or click directly on the map.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-[#D0DAD3]">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(event) => setPatientName(event.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-[#3C4942] dark:bg-[#1E2522] dark:text-white dark:focus:border-[#39B982] dark:focus:ring-[#39B982]/10"
                  placeholder="Enter patient name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-[#D0DAD3]">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-[#3C4942] dark:bg-[#1E2522] dark:text-white dark:focus:border-[#39B982] dark:focus:ring-[#39B982]/10"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-[#D0DAD3]">
                  Emergency Type
                </label>
                <select
                  value={emergencyType}
                  onChange={(event) => setEmergencyType(event.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 dark:border-[#3C4942] dark:bg-[#1E2522] dark:text-white dark:focus:border-[#39B982]"
                >
                  <option>Medical Emergency</option>
                  <option>Accident</option>
                  <option>Pregnancy</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-[#D0DAD3]">
                  Address / Landmark
                </label>
                <textarea
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  required
                  rows={2}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 dark:border-[#3C4942] dark:bg-[#1E2522] dark:text-white dark:focus:border-[#39B982]"
                  placeholder="House number, road, locality, nearby landmark..."
                />
              </div>
            </div>

            {/* Map and pickup location */}
            <div className="mt-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-[#183B56] dark:text-[#F5F7F5]">
                    Select Pickup Location
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-[#A0AEA5]">
                    {position
                      ? `Selected: ${position[0].toFixed(6)}, ${position[1].toFixed(6)}`
                      : "No pickup point selected yet."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={gettingLocation}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#39B982] dark:text-[#10251B] dark:hover:bg-[#55CD96]"
                >
                  {gettingLocation
                    ? "Finding Location..."
                    : "◎ Use My Current Location"}
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-300 dark:border-[#3C4942]">
                <MapContainer
                  center={position || DEFAULT_CENTER}
                  zoom={position ? 17 : 12}
                  scrollWheelZoom
                  className="h-[350px] w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapController position={position} />
                  <MapClickHandler onSelect={updateSelectedPosition} />

                  {position && (
                    <DraggableMarker
                      position={position}
                      onSelect={updateSelectedPosition}
                    />
                  )}
                </MapContainer>
              </div>

              <p className="mt-3 text-xs leading-6 text-gray-500 dark:text-[#A0AEA5]">
                Tip: Zoom in, then click your house or entrance. Drag the pin to
                adjust it. GPS may be approximate, so check the location before
                submitting.
              </p>
            </div>

            <div className="mt-7">
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-[#D0DAD3]">
                Additional Details (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 dark:border-[#3C4942] dark:bg-[#1E2522] dark:text-white dark:focus:border-[#39B982]"
                placeholder="Patient condition or other useful details..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-7 w-full rounded-xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#39B982] dark:text-[#10251B] dark:shadow-none dark:hover:bg-[#55CD96]"
            >
              {loading ? "Submitting Request..." : "Submit Demo Request"}
            </button>

            <p className="mt-4 text-center text-xs leading-6 text-gray-500 dark:text-[#A0AEA5]">
              Demo only. This does not contact or dispatch a real ambulance. For
              a real emergency in India, call 112.
            </p>
          </form>
        )}

        {/* Patient booking history */}
        {isPatient && (
          <div id="ambulance-history" className="mt-20 scroll-mt-24">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-[#55CD96]">
                  Your Activity
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-[#183B56] dark:text-[#F5F7F5]">
                  My Ambulance Requests
                </h2>
              </div>

              <button
                type="button"
                onClick={handleRefreshBookings}
                disabled={historyLoading}
                className="rounded-xl border border-blue-600 px-5 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50 disabled:opacity-60 dark:border-[#39B982] dark:text-[#55CD96] dark:hover:bg-[#242C29]"
              >
                {historyLoading ? "Refreshing..." : "↻ Refresh"}
              </button>
            </div>

            {historyLoading ? (
              <div className="rounded-2xl bg-gray-50 p-8 text-center text-sm text-gray-500 dark:bg-[#242C29] dark:text-[#A0AEA5]">
                Loading booking history...
              </div>
            ) : bookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-[#3C4942] dark:bg-[#242C29]">
                <div className="text-4xl">🚑</div>
                <h3 className="mt-3 font-bold text-[#183B56] dark:text-[#F5F7F5]">
                  No Ambulance Requests Yet
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-[#A0AEA5]">
                  Your submitted ambulance requests will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {bookings.map((booking) => (
                  <article
                    key={booking._id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[#3C4942] dark:bg-[#242C29] sm:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-[#183B56] dark:text-[#F5F7F5]">
                          {booking.emergencyType}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600 dark:text-[#A0AEA5]">
                          📍 {booking.location}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusClass(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    {booking.latitude != null && booking.longitude != null && (
                      <p className="mt-3 text-xs text-gray-500 dark:text-[#A0AEA5]">
                        Pickup coordinates: {booking.latitude},{" "}
                        {booking.longitude}
                      </p>
                    )}

                    {booking.ambulanceOperator && (
                      <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600 dark:bg-[#1E2522] dark:text-[#D0DAD3]">
                        <p>
                          <strong>Operator:</strong>{" "}
                          {booking.ambulanceOperator.name || "Assigned"}
                        </p>

                        {booking.ambulanceOperator.phone && (
                          <p className="mt-1">
                            <strong>Operator phone:</strong>{" "}
                            {booking.ambulanceOperator.phone}
                          </p>
                        )}
                      </div>
                    )}

                    <p className="mt-4 text-xs text-gray-500 dark:text-[#A0AEA5]">
                      Requested:{" "}
                      {booking.createdAt
                        ? new Date(booking.createdAt).toLocaleString()
                        : "Date unavailable"}
                    </p>

                    {["on-the-way", "arrived"].includes(booking.status) && (
                      <LiveAmbulanceTracking booking={booking} />
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default Ambulance;
