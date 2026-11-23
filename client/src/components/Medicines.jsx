import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
// Supports local development and live deployment.
const API_URL = `${API_BASE_URL}/pharmacy`;
import API_BASE_URL from "../config/api.js";
function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("aayushman-user") || "null");
  } catch {
    return null;
  }
}

function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");

  const [cart, setCart] = useState([]);
  const [phone, setPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const [token, setToken] = useState(() =>
    localStorage.getItem("aayushman-token"),
  );
  const [user, setUser] = useState(getStoredUser);

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  // Toast notification state.
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const role = user?.role;

  // Display a notification and automatically close it after 3 seconds.
  const showToast = (type, text) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    setToast({
      id: Date.now(),
      type,
      text,
    });

    toastTimer.current = setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 3000);
  };

  // Clear notification timer when the component unmounts.
  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  // Keep login information updated after login or logout.
  useEffect(() => {
    const syncAuth = () => {
      setToken(localStorage.getItem("aayushman-token"));
      setUser(getStoredUser);
    };

    window.addEventListener("aayushman-auth-changed", syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("aayushman-auth-changed", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  // Common function for pharmacy API requests.
  const request = useCallback(
    async (path, options = {}) => {
      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      return data;
    },
    [token],
  );

  // Load public catalogue or a pharmacy's own inventory.
  const loadMedicines = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const path =
        token && role === "pharmacy" ? "/medicines" : "/medicines/public";

      const data = await request(path);

      setMedicines(Array.isArray(data.medicines) ? data.medicines : []);
    } catch (err) {
      setError(err.message || "Unable to load medicines.");
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  }, [request, token, role]);

  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  const categories = useMemo(
    () => [
      "All Categories",
      ...new Set(medicines.map((item) => item.category).filter(Boolean)),
    ],
    [medicines],
  );

  const filteredMedicines = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return medicines.filter((medicine) => {
      const matchesSearch =
        medicine.name?.toLowerCase().includes(searchText) ||
        medicine.category?.toLowerCase().includes(searchText) ||
        medicine.description?.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All Categories" || medicine.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [medicines, search, category]);

  const money = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  // Add a medicine to the cart.
  const addToCart = (medicine) => {
    const stock = Number(medicine.stock) || 0;
    const medicineId = String(medicine._id);
    const pharmacyId = String(
      medicine.pharmacy?._id || medicine.pharmacy || "",
    );

    if (stock <= 0 || medicine.isAvailable === false) {
      showToast("error", "This medicine is currently unavailable.");
      return;
    }

    // One order can contain medicines from only one pharmacy.
    if (cart.length > 0) {
      const existingPharmacy = cart[0].pharmacyId;

      if (existingPharmacy && pharmacyId && existingPharmacy !== pharmacyId) {
        showToast(
          "warning",
          "Please place separate orders for medicines from different pharmacies.",
        );
        return;
      }
    }

    const existingItem = cart.find((item) => String(item._id) === medicineId);

    if (existingItem) {
      if (existingItem.quantity >= stock) {
        showToast("warning", "You cannot add more than the available stock.");
        return;
      }

      setCart((previous) =>
        previous.map((item) =>
          String(item._id) === medicineId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );

      showToast("success", `${medicine.name} quantity increased in your cart.`);
    } else {
      setCart((previous) => [
        ...previous,
        {
          _id: medicine._id,
          name: medicine.name,
          price: Number(medicine.price) || 0,
          stock,
          pharmacyId,
          quantity: 1,
        },
      ]);

      showToast("success", `${medicine.name} added to your cart!`);
    }
  };

  // Change quantity or remove an item.
  const updateQuantity = (medicineId, quantity) => {
    const item = cart.find((entry) => String(entry._id) === String(medicineId));

    if (!item) return;

    if (quantity <= 0) {
      setCart((previous) =>
        previous.filter((entry) => String(entry._id) !== String(medicineId)),
      );

      showToast("success", `${item.name} removed from your cart.`);
      return;
    }

    if (quantity > item.stock) {
      showToast("warning", "Requested quantity exceeds available stock.");
      return;
    }

    setCart((previous) =>
      previous.map((entry) =>
        String(entry._id) === String(medicineId)
          ? { ...entry, quantity }
          : entry,
      ),
    );

    showToast("success", `${item.name} quantity updated to ${quantity}.`);
  };

  // Place an order only when a patient is logged in.
  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (!cart.length) {
      showToast("warning", "Please add at least one medicine to your cart.");
      return;
    }

    if (!token || role !== "patient") {
      showToast(
        "warning",
        "Please log in with a patient account to place an order.",
      );
      return;
    }

    if (!phone.trim() || !deliveryAddress.trim()) {
      showToast(
        "warning",
        "Please enter your phone number and delivery address.",
      );
      return;
    }

    setPlacingOrder(true);

    try {
      const payload = {
        items: cart.map((item) => ({
          medicineId: item._id,
          quantity: item.quantity,
        })),
        deliveryAddress: deliveryAddress.trim(),
        phone: phone.trim(),
      };

      const data = await request("/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setCart([]);
      setPhone("");
      setDeliveryAddress("");

      showToast(
        "success",
        data.message ||
          "Your demonstration order has been placed successfully!",
      );

      await loadMedicines();
    } catch (err) {
      showToast("error", err.message || "Unable to place your order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("All Categories");

    showToast("success", "Search filters cleared.");
  };

  const handleRefresh = async () => {
    await loadMedicines();

    // Show a refresh notification only when the catalogue loaded.
    // Loading errors are displayed in the catalogue area.
    if (!error) {
      showToast("success", "Medicine catalogue refreshed.");
    }
  };

  const closeToast = () => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }

    setToast(null);
  };

  return (
    <section
      id="medicines"
      className="overflow-hidden bg-white py-14 transition-colors duration-300 dark:bg-[#171C1B] sm:py-20"
    >
      {/* Floating toast notification */}
      {toast && (
        <div
          key={toast.id}
          role={toast.type === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`fixed right-4 top-24 z-[100] flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-2xl sm:right-6 ${
            toast.type === "success"
              ? "border-green-200 bg-white text-green-800 dark:border-[#39B982]/40 dark:bg-[#242C29] dark:text-[#55CD96]"
              : toast.type === "warning"
                ? "border-amber-200 bg-white text-amber-800 dark:border-amber-400/40 dark:bg-[#242C29] dark:text-amber-200"
                : "border-red-200 bg-white text-red-700 dark:border-red-400/40 dark:bg-[#242C29] dark:text-red-200"
          }`}
        >
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
              toast.type === "success"
                ? "bg-green-100 dark:bg-[#39B982]/15"
                : toast.type === "warning"
                  ? "bg-amber-100 dark:bg-amber-400/15"
                  : "bg-red-100 dark:bg-red-400/15"
            }`}
          >
            {toast.type === "success"
              ? "✓"
              : toast.type === "warning"
                ? "!"
                : "×"}
          </span>

          <div className="min-w-0 flex-1">
            <p className="font-bold">
              {toast.type === "success"
                ? "Success!"
                : toast.type === "warning"
                  ? "Attention!"
                  : "Something went wrong"}
            </p>
            <p className="mt-1 text-sm leading-5">{toast.text}</p>
          </div>

          <button
            type="button"
            onClick={closeToast}
            aria-label="Close notification"
            className="text-xl opacity-60 transition hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Introduction: content on left, pharmacy image on right */}
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="py-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:bg-[#39B982]/10 dark:text-[#55CD96]">
              <span>💊</span> PHARMACY SUPPORT
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-[#183B56] dark:text-[#F5F7F5] sm:text-5xl">
              Medicines &
              <span className="block text-blue-600 dark:text-[#39B982]">
                Pharmacy Support
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-gray-600 dark:text-[#A0AEA5]">
              Explore medicines listed by registered pharmacy accounts. Browse
              available products, check prices and experience the demonstration
              ordering facility through AAYUSHMAN.
            </p>

            <div className="mt-7 flex flex-wrap gap-4">
              <a
                href="#medicine-catalogue"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 dark:bg-[#39B982] dark:text-[#10251B] dark:shadow-none dark:hover:bg-[#55CD96]"
              >
                Browse Medicines <span>↓</span>
              </a>

              <a
                href="#medicine-cart"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-6 py-3.5 font-bold text-[#183B56] transition hover:bg-blue-50 dark:border-[#3C4942] dark:text-[#F5F7F5] dark:hover:bg-[#242C29]"
              >
                <span>🛒</span> My Cart ({cartCount})
              </a>
            </div>

            <div className="mt-9 grid grid-cols-2 gap-4 sm:max-w-md">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[#3C4942] dark:bg-[#242C29]">
                <p className="text-2xl font-extrabold text-blue-700 dark:text-[#39B982]">
                  {medicines.length}
                </p>
                <p className="mt-1 text-xs font-medium text-gray-500 dark:text-[#A0AEA5]">
                  Listed Medicines
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-[#3C4942] dark:bg-[#242C29]">
                <p className="text-2xl font-extrabold text-blue-700 dark:text-[#39B982]">
                  {categories.length - 1}
                </p>
                <p className="mt-1 text-xs font-medium text-gray-500 dark:text-[#A0AEA5]">
                  Medicine Categories
                </p>
              </div>
            </div>
          </div>

          {/* Image: Indian pharmacist helping a customer at a local pharmacy */}
          <div className="relative">
            <div className="relative h-[310px] overflow-hidden rounded-[2rem] bg-blue-100 shadow-xl dark:bg-[#242C29] sm:h-[420px]">
              <div className="absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 text-7xl dark:from-[#303C36] dark:to-[#1E2522]">
                💊
              </div>

              <img
                src="/images/pharmacy-support.jpg"
                alt="Pharmacist assisting a customer at a local pharmacy"
                className="absolute inset-0 z-10 h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />

              <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 z-30 text-white sm:bottom-8 sm:left-8">
                <p className="text-xs font-bold uppercase tracking-widest text-white/80">
                  AAYUSHMAN PHARMACY
                </p>
                <h2 className="mt-2 max-w-sm text-2xl font-extrabold sm:text-3xl">
                  Medicine Support, Closer to You
                </h2>
              </div>
            </div>

            <div className="absolute -bottom-5 right-4 z-40 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-[#3C4942] dark:bg-[#242C29] sm:-right-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-2xl dark:bg-[#39B982]/15">
                  🏥
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-[#F5F7F5]">
                    Pharmacy Listings
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-[#A0AEA5]">
                    Browse available products
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio demonstration notice */}
        <div className="mt-16 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-400/30 dark:bg-amber-400/10">
          <span className="text-xl">ℹ️</span>
          <div>
            <h3 className="font-bold text-amber-900 dark:text-amber-200">
              Portfolio Demonstration
            </h3>
            <p className="mt-2 text-sm leading-6 text-amber-800 dark:text-amber-100/80">
              Orders are stored in the project database for demonstration. No
              payment is processed and no real medicine delivery is arranged.
              Verify medicines and prescriptions with a qualified healthcare
              professional.
            </p>
          </div>
        </div>

        {/* Search and category filters */}
        <div id="medicine-catalogue" className="mt-16 scroll-mt-24">
          <div className="mb-7">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-[#55CD96]">
              Medicine Catalogue
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-[#183B56] dark:text-[#F5F7F5] sm:text-4xl">
              Explore Available Medicines
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500 dark:text-[#A0AEA5]">
              Search by medicine name, category or description. Availability and
              prices are based on pharmacy listings.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-[#3C4942] dark:bg-[#242C29] sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="medicine-search"
                  className="mb-2 block text-sm font-semibold text-[#183B56] dark:text-[#F5F7F5]"
                >
                  Search Medicines
                </label>

                <input
                  id="medicine-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by medicine or category..."
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-[#3C4942] dark:bg-[#1E2522] dark:text-white dark:focus:border-[#39B982] dark:focus:ring-[#39B982]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="medicine-category"
                  className="mb-2 block text-sm font-semibold text-[#183B56] dark:text-[#F5F7F5]"
                >
                  Filter by Category
                </label>

                <select
                  id="medicine-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 dark:border-[#3C4942] dark:bg-[#1E2522] dark:text-white"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-600 dark:text-[#A0AEA5]">
                Showing{" "}
                <strong className="text-[#183B56] dark:text-[#39B982]">
                  {filteredMedicines.length}
                </strong>{" "}
                of {medicines.length} medicines
              </p>

              <div className="flex gap-4">
                {(search || category !== "All Categories") && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-semibold text-blue-700 hover:underline dark:text-[#55CD96]"
                  >
                    Clear Filters
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="text-sm font-semibold text-blue-700 hover:underline dark:text-[#55CD96]"
                >
                  ↻ Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Medicine catalogue */}
        <div className="mt-8">
          {loading ? (
            <div className="rounded-2xl bg-gray-50 p-10 text-center text-gray-600 dark:bg-[#242C29] dark:text-[#D0DAD3]">
              Loading available medicines...
            </div>
          ) : medicines.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-12 text-center dark:border-[#3C4942] dark:bg-[#242C29]">
              <div className="text-5xl">💊</div>
              <h3 className="mt-4 font-bold text-[#183B56] dark:text-[#F5F7F5]">
                No Medicines Available
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-[#A0AEA5]">
                {error ||
                  "Registered pharmacies have not added available medicines yet."}
              </p>
              <button
                type="button"
                onClick={handleRefresh}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white dark:bg-[#39B982] dark:text-[#10251B]"
              >
                Try Again
              </button>
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-12 text-center dark:border-[#3C4942] dark:bg-[#242C29]">
              <div className="text-5xl">🔎</div>
              <h3 className="mt-4 font-bold text-[#183B56] dark:text-[#F5F7F5]">
                No Medicines Found
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-[#A0AEA5]">
                Try another search or category.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white dark:bg-[#39B982] dark:text-[#10251B]"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMedicines.map((medicine) => {
                const stock = Number(medicine.stock) || 0;
                const unavailable =
                  stock <= 0 || medicine.isAvailable === false;

                return (
                  <article
                    key={medicine._id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-[#3C4942] dark:bg-[#242C29]"
                  >
                    <div className="relative h-48 overflow-hidden bg-blue-50 dark:bg-[#1E2522]">
                      <div className="absolute inset-0 flex items-center justify-center text-6xl">
                        💊
                      </div>

                      {medicine.image && (
                        <img
                          src={medicine.image}
                          alt={medicine.name}
                          loading="lazy"
                          className="absolute inset-0 z-10 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      )}

                      <span className="absolute right-3 top-3 z-20 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
                        {medicine.category}
                      </span>

                      {unavailable && (
                        <span className="absolute bottom-3 left-3 z-20 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-lg font-bold text-[#183B56] dark:text-[#F5F7F5]">
                        {medicine.name}
                      </h3>

                      <p className="mt-3 flex-1 text-sm leading-6 text-gray-600 dark:text-[#A0AEA5]">
                        {medicine.description || "No description provided."}
                      </p>

                      {medicine.pharmacy?.name && (
                        <p className="mt-3 text-xs text-gray-500 dark:text-[#A0AEA5]">
                          <span className="mr-1">🏪</span>
                          Listed by {medicine.pharmacy.name}
                        </p>
                      )}

                      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-[#3C4942]">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-[#A0AEA5]">
                            Price
                          </p>
                          <p className="mt-1 text-xl font-extrabold text-blue-700 dark:text-[#39B982]">
                            {money(medicine.price)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-[#A0AEA5]">
                            Available Stock
                          </p>
                          <p className="mt-1 text-sm font-bold text-slate-700 dark:text-[#D0DAD3]">
                            {stock} units
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={unavailable}
                        onClick={() => addToCart(medicine)}
                        className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#39B982] dark:text-[#10251B] dark:hover:bg-[#55CD96]"
                      >
                        {unavailable ? "Unavailable" : "＋ Add to Cart"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Shopping cart */}
        <section
          id="medicine-cart"
          className="mt-16 scroll-mt-24 rounded-3xl border border-blue-200 bg-gradient-to-br from-[#EAF4FF] via-[#DCEBFA] to-[#C9E0F5] p-5 shadow-lg shadow-blue-900/5 dark:border-[#456052] dark:bg-gradient-to-br dark:from-[#293D35] dark:via-[#30483D] dark:to-[#385645] dark:shadow-black/10 sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-600 dark:text-[#55CD96]">
                Your Selection
              </p>
              <h3 className="mt-2 text-2xl font-extrabold text-[#183B56] dark:text-[#F5F7F5]">
                Shopping Cart
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-[#A0AEA5]">
                {cartCount} item(s) selected
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl dark:bg-[#39B982]/10">
              🛒
            </div>
          </div>

          {cart.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500 dark:border-[#3C4942] dark:bg-[#1E2522] dark:text-[#A0AEA5]">
              Your cart is empty. Add medicines from the catalogue above.
            </p>
          ) : (
            <>
              <div className="mt-6 space-y-3">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 dark:border-[#3C4942] dark:bg-[#1E2522]"
                  >
                    <div className="min-w-[140px] flex-1">
                      <p className="font-bold text-[#183B56] dark:text-[#F5F7F5]">
                        {item.name}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-[#A0AEA5]">
                        {money(item.price)} each
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item._id, item.quantity - 1)
                        }
                        className="h-9 w-9 rounded-lg border border-gray-300 font-bold text-[#183B56] dark:border-[#3C4942] dark:text-white"
                      >
                        −
                      </button>

                      <span className="min-w-5 text-center font-bold text-[#183B56] dark:text-white">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item._id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.stock}
                        className="h-9 w-9 rounded-lg border border-gray-300 font-bold text-[#183B56] disabled:opacity-40 dark:border-[#3C4942] dark:text-white"
                      >
                        +
                      </button>

                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, 0)}
                        className="ml-2 text-sm font-semibold text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>

                    <p className="w-full text-right font-extrabold text-[#183B56] dark:text-[#39B982] sm:w-auto">
                      {money(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-5 dark:border-[#3C4942]">
                <p className="text-sm font-semibold text-gray-600 dark:text-[#A0AEA5]">
                  Order Total
                </p>
                <p className="text-2xl font-extrabold text-[#183B56] dark:text-[#39B982]">
                  {money(cartTotal)}
                </p>
              </div>

              {/* Login required notice */}
              {(!token || role !== "patient") && (
                <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-[#3C4942] dark:bg-[#1E2522]">
                  <p className="text-sm leading-6 text-[#183B56] dark:text-[#D0DAD3]">
                    {token
                      ? "Medicine ordering is available through a patient account."
                      : "You can browse and add medicines to your cart. Please log in as a patient to place your order."}
                  </p>
                  <Link
                    to="/login"
                    className="mt-3 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white dark:bg-[#39B982] dark:text-[#10251B]"
                  >
                    Login to Continue
                  </Link>
                </div>
              )}

              {/* Checkout */}
              <form onSubmit={handlePlaceOrder} className="mt-8">
                <h4 className="text-xl font-bold text-[#183B56] dark:text-[#F5F7F5]">
                  Delivery Details
                </h4>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="order-phone"
                      className="mb-2 block text-sm font-semibold text-[#183B56] dark:text-[#F5F7F5]"
                    >
                      Contact Phone Number
                    </label>
                    <input
                      id="order-phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="Enter your phone number"
                      required
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 dark:border-[#3C4942] dark:bg-[#1E2522] dark:text-white dark:focus:border-[#39B982]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="order-address"
                      className="mb-2 block text-sm font-semibold text-[#183B56] dark:text-[#F5F7F5]"
                    >
                      Delivery Address
                    </label>
                    <textarea
                      id="order-address"
                      rows="3"
                      value={deliveryAddress}
                      onChange={(event) =>
                        setDeliveryAddress(event.target.value)
                      }
                      placeholder="Enter your complete delivery address"
                      required
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 dark:border-[#3C4942] dark:bg-[#1E2522] dark:text-white dark:focus:border-[#39B982]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={placingOrder || !cart.length}
                  className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#39B982] dark:text-[#10251B] dark:hover:bg-[#55CD96]"
                >
                  {placingOrder ? "Placing Order..." : "Place Order"}
                </button>
              </form>
            </>
          )}
        </section>

        <p className="mt-10 border-t border-gray-200 pt-6 text-center text-xs leading-6 text-gray-500 dark:border-[#3C4942] dark:text-[#A0AEA5]">
          Portfolio demonstration only. Orders are recorded in the demo
          database. No payment, prescription verification or real-world medicine
          delivery is provided.
        </p>
      </div>
    </section>
  );
}

export default Medicines;
