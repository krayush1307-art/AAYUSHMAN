import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/pharmacy";

const emptyForm = {
  name: "",
  category: "",
  description: "",
  price: "",
  stock: "",
  image: "",
};

// Reusable API request helper.
const request = async (path, options = {}) => {
  const token = localStorage.getItem("aayushman-token");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
};

function PharmacyDashboard() {
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Load this pharmacy's medicines and incoming orders.
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [medicineData, orderData] = await Promise.all([
        request("/medicines"),
        request("/orders/pharmacy"),
      ]);

      setMedicines(medicineData.medicines || []);
      setOrders(orderData.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  // Add a medicine or update an existing one.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      };

      const data = await request(
        editingId ? `/medicines/${editingId}` : "/medicines",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );

      setMessage(data.message || "Medicine saved successfully.");
      setForm(emptyForm);
      setEditingId(null);
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Load an existing medicine into the form.
  const handleEdit = (medicine) => {
    setEditingId(medicine._id);

    setForm({
      name: medicine.name || "",
      category: medicine.category || "",
      description: medicine.description || "",
      price: String(medicine.price ?? ""),
      stock: String(medicine.stock ?? ""),
      image: medicine.image || "",
    });

    setMessage("");
    setError("");

    document.getElementById("pharmacy-medicine-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  };

  // Delete a medicine after confirmation.
  const handleDelete = async (medicine) => {
    if (!window.confirm(`Delete ${medicine.name} from your catalogue?`)) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const data = await request(`/medicines/${medicine._id}`, {
        method: "DELETE",
      });

      setMessage(data.message || "Medicine deleted successfully.");
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  // Update the progress of a patient order.
  const handleOrderStatus = async (orderId, status) => {
    setError("");
    setMessage("");

    try {
      const data = await request(`/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setMessage(data.message || "Order status updated successfully.");
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const money = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);

  // Status colors for the light and dark themes.
  const statusStyle = {
    pending:
      "bg-amber-100 text-amber-700 dark:!bg-amber-500/10 dark:!text-amber-300",
    accepted:
      "bg-green-100 text-green-700 dark:!bg-[#39B982]/10 dark:!text-[#55CD96]",
    rejected: "bg-red-100 text-red-700 dark:!bg-red-500/10 dark:!text-red-300",
    processing:
      "bg-blue-100 text-blue-700 dark:!bg-blue-500/10 dark:!text-blue-300",
    ready: "bg-cyan-100 text-cyan-700 dark:!bg-cyan-500/10 dark:!text-cyan-300",
    completed:
      "bg-emerald-100 text-emerald-700 dark:!bg-emerald-500/10 dark:!text-emerald-300",
    cancelled:
      "bg-slate-200 text-slate-700 dark:!bg-white/5 dark:!text-slate-300",
  };

  const pendingOrders = orders.filter(
    (order) => order.status === "pending",
  ).length;

  const lowStockMedicines = medicines.filter(
    (medicine) => Number(medicine.stock) <= 5,
  ).length;

  // Initial loading state.
  if (loading) {
    return (
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center dark:!border-[#3C4942] dark:!bg-[#242C29]">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600 dark:!border-[#3C4942] dark:!border-t-[#39B982]" />
        <p className="font-semibold text-slate-800 dark:!text-[#F5F7F5]">
          Loading pharmacy workspace...
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:!text-[#A0AEA5]">
          Preparing your medicines and orders.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Pharmacy workspace heading */}
      <section className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-[#EAF4FF] via-[#F5F9FE] to-[#DCEEFF] p-6 shadow-sm transition-colors duration-300 sm:p-8 dark:!border-[#456052] dark:!bg-gradient-to-br dark:!from-[#263B32] dark:!via-[#293F35] dark:!to-[#30483A]">
        {" "}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold tracking-wider text-blue-700 dark:!bg-[#39B982]/10 dark:!text-[#39B982]">
              <span>✚</span>
              PHARMACY MANAGEMENT
            </div>

            <h3 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:!text-[#F5F7F5]">
              Pharmacy Workspace
            </h3>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:!text-[#A0AEA5]">
              Manage your medicine catalogue, monitor inventory and handle
              patient orders from one place.
            </p>
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-4xl dark:!bg-[#39B982]/10">
            💊
          </div>
        </div>
      </section>

      {/* Success message */}
      {message && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800 dark:!border-[#39B982]/30 dark:!bg-[#39B982]/10 dark:!text-[#55CD96]"
        >
          <span>✓</span>
          <p>{message}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:!border-red-500/25 dark:!bg-red-500/10 dark:!text-red-300"
        >
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* Pharmacy summary cards */}
      <section>
        <div className="mb-4">
          <h4 className="text-lg font-bold text-slate-800 dark:!text-[#F5F7F5]">
            Overview
          </h4>
          <p className="mt-1 text-sm text-slate-500 dark:!text-[#A0AEA5]">
            A quick look at your pharmacy activity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: "💊",
              label: "Total Medicines",
              value: medicines.length,
              note: "Catalogue items",
              color: "blue",
            },
            {
              icon: "📦",
              label: "Incoming Orders",
              value: orders.length,
              note: "All received orders",
              color: "purple",
            },
            {
              icon: "⏳",
              label: "Pending Orders",
              value: pendingOrders,
              note: "Need your attention",
              color: "amber",
            },
            {
              icon: "⚠️",
              label: "Low Stock",
              value: lowStockMedicines,
              note: "5 or fewer units",
              color: "red",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:!border-[#3C4942] dark:!bg-[#242C29]"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:!text-[#A0AEA5]">
                  {item.label}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl dark:!bg-[#39B982]/10">
                  {item.icon}
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold text-slate-900 dark:!text-[#F5F7F5]">
                {item.value}
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:!text-[#A0AEA5]">
                {item.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Add or edit medicine form */}
      <section
        id="pharmacy-medicine-form"
        className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:!border-[#3C4942] dark:!bg-[#242C29]"
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl dark:!bg-[#39B982]/10">
              {editingId ? "✏️" : "＋"}
            </div>

            <div>
              <h4 className="text-xl font-bold text-slate-800 dark:!text-[#F5F7F5]">
                {editingId ? "Edit Medicine" : "Add New Medicine"}
              </h4>
              <p className="mt-1 text-sm text-slate-500 dark:!text-[#A0AEA5]">
                {editingId
                  ? "Update your medicine information."
                  : "Add a medicine to your pharmacy catalogue."}
              </p>
            </div>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:!border-[#3C4942] dark:!text-[#D0DAD3] dark:hover:!bg-[#303C36]"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="medicine-name"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:!text-[#D0DAD3]"
            >
              Medicine Name *
            </label>
            <input
              id="medicine-name"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              placeholder="Enter medicine name"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:!border-[#3C4942] dark:!bg-[#1E2522] dark:!text-[#F5F7F5] dark:focus:!border-[#39B982] dark:focus:!ring-[#39B982]/10"
            />
          </div>

          <div>
            <label
              htmlFor="medicine-category"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:!text-[#D0DAD3]"
            >
              Category *
            </label>
            <input
              id="medicine-category"
              name="category"
              value={form.category}
              onChange={handleFormChange}
              placeholder="e.g. First Aid"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:!border-[#3C4942] dark:!bg-[#1E2522] dark:!text-[#F5F7F5] dark:focus:!border-[#39B982] dark:focus:!ring-[#39B982]/10"
            />
          </div>

          <div>
            <label
              htmlFor="medicine-price"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:!text-[#D0DAD3]"
            >
              Price (₹) *
            </label>
            <input
              id="medicine-price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleFormChange}
              placeholder="Enter price"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:!border-[#3C4942] dark:!bg-[#1E2522] dark:!text-[#F5F7F5] dark:focus:!border-[#39B982] dark:focus:!ring-[#39B982]/10"
            />
          </div>

          <div>
            <label
              htmlFor="medicine-stock"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:!text-[#D0DAD3]"
            >
              Available Stock *
            </label>
            <input
              id="medicine-stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={handleFormChange}
              placeholder="Enter stock quantity"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:!border-[#3C4942] dark:!bg-[#1E2522] dark:!text-[#F5F7F5] dark:focus:!border-[#39B982] dark:focus:!ring-[#39B982]/10"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="medicine-description"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:!text-[#D0DAD3]"
            >
              Description
            </label>
            <textarea
              id="medicine-description"
              name="description"
              rows="3"
              value={form.description}
              onChange={handleFormChange}
              placeholder="Short product description"
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:!border-[#3C4942] dark:!bg-[#1E2522] dark:!text-[#F5F7F5] dark:focus:!border-[#39B982] dark:focus:!ring-[#39B982]/10"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="medicine-image"
              className="mb-2 block text-sm font-semibold text-slate-700 dark:!text-[#D0DAD3]"
            >
              Medicine Image URL (optional)
            </label>
            <input
              id="medicine-image"
              name="image"
              type="url"
              value={form.image}
              onChange={handleFormChange}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:!border-[#3C4942] dark:!bg-[#1E2522] dark:!text-[#F5F7F5] dark:focus:!border-[#39B982] dark:focus:!ring-[#39B982]/10"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:!bg-[#39B982] dark:!text-[#10251B] dark:hover:!bg-[#55CD96] sm:col-span-2"
          >
            {saving
              ? "Saving..."
              : editingId
                ? "✓ Save Medicine Changes"
                : "＋ Add Medicine"}
          </button>
        </form>
      </section>

      {/* Medicine catalogue */}
      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-xl font-bold text-slate-800 dark:!text-[#F5F7F5]">
              My Medicine Catalogue
            </h4>
            <p className="mt-1 text-sm text-slate-500 dark:!text-[#A0AEA5]">
              Manage the medicines available in your pharmacy.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:!border-[#3C4942] dark:!bg-[#242C29] dark:!text-[#39B982] dark:hover:!bg-[#303C36]"
          >
            ↻ Refresh
          </button>
        </div>

        {medicines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:!border-[#3C4942] dark:!bg-[#242C29]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl dark:!bg-[#39B982]/10">
              💊
            </div>
            <p className="mt-4 font-bold text-slate-800 dark:!text-[#F5F7F5]">
              No medicines added yet
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:!text-[#A0AEA5]">
              Use the form above to add your first catalogue item.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {medicines.map((medicine) => (
              <article
                key={medicine._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:!border-[#3C4942] dark:!bg-[#242C29]"
              >
                {medicine.image ? (
                  <img
                    src={medicine.image}
                    alt={medicine.name}
                    loading="lazy"
                    className="h-44 w-full bg-slate-100 object-cover dark:bg-[#1E2522]"
                  />
                ) : (
                  <div className="flex h-36 items-center justify-center bg-slate-100 text-5xl dark:!bg-[#303C36]">
                    💊
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h5 className="font-bold text-slate-800 dark:!text-[#F5F7F5]">
                      {medicine.name}
                    </h5>

                    <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:!bg-[#39B982]/10 dark:!text-[#55CD96]">
                      {medicine.category}
                    </span>
                  </div>

                  <p className="mt-3 min-h-10 text-sm leading-5 text-slate-500 dark:!text-[#A0AEA5]">
                    {medicine.description || "No description provided."}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:!border-[#3C4942]">
                    <div>
                      <p className="text-xs text-slate-500 dark:!text-[#A0AEA5]">
                        Selling price
                      </p>
                      <p className="mt-1 text-lg font-bold text-blue-700 dark:!text-[#39B982]">
                        {money(medicine.price)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500 dark:!text-[#A0AEA5]">
                        Available stock
                      </p>
                      <p
                        className={`mt-1 text-sm font-bold ${
                          Number(medicine.stock) <= 5
                            ? "text-red-600 dark:!text-red-300"
                            : "text-slate-700 dark:!text-[#D0DAD3]"
                        }`}
                      >
                        {medicine.stock} units
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(medicine)}
                      className="flex-1 rounded-xl bg-amber-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(medicine)}
                      className="flex-1 rounded-xl bg-red-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Incoming patient orders */}
      <section>
        <div className="mb-5">
          <h4 className="text-xl font-bold text-slate-800 dark:!text-[#F5F7F5]">
            Patient Orders
          </h4>
          <p className="mt-1 text-sm text-slate-500 dark:!text-[#A0AEA5]">
            Review incoming orders and update their progress.
          </p>
        </div>

        <div className="space-y-5">
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:!border-[#3C4942] dark:!bg-[#242C29]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl dark:!bg-[#39B982]/10">
                📦
              </div>
              <p className="mt-4 font-bold text-slate-800 dark:!text-[#F5F7F5]">
                No orders received yet
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:!text-[#A0AEA5]">
                Patient orders will appear here.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <article
                key={order._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:!border-[#3C4942] dark:!bg-[#242C29]"
              >
                {/* Order heading and status */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:!text-[#A0AEA5]">
                      Order reference
                    </p>
                    <h5 className="mt-1 text-lg font-bold text-slate-800 dark:!text-[#F5F7F5]">
                      #{order._id.slice(-8).toUpperCase()}
                    </h5>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${
                      statusStyle[order.status] || statusStyle.pending
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Patient details */}
                <div className="mt-5 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2 dark:!bg-[#303C36]">
                  <div>
                    <p className="text-xs text-slate-500 dark:!text-[#A0AEA5]">
                      Patient
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800 dark:!text-[#F5F7F5]">
                      {order.patient?.name || "Patient"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 dark:!text-[#A0AEA5]">
                      Contact number
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800 dark:!text-[#F5F7F5]">
                      {order.phone || "Not available"}
                    </p>
                  </div>
                </div>

                {/* Ordered medicines */}
                <div className="mt-5">
                  <h6 className="mb-3 text-sm font-bold text-slate-800 dark:!text-[#F5F7F5]">
                    Ordered Medicines
                  </h6>

                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={`${item.medicine}-${index}`}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-slate-700 dark:!text-[#D0DAD3]">
                            {item.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:!text-[#A0AEA5]">
                            Quantity: {item.quantity}
                          </p>
                        </div>

                        <p className="shrink-0 font-semibold text-slate-800 dark:!text-[#F5F7F5]">
                          {money(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery address and total */}
                <div className="mt-5 border-t border-slate-100 pt-5 dark:!border-[#3C4942]">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:!text-[#A0AEA5]">
                    Delivery Address
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700 dark:!text-[#D0DAD3]">
                    {order.deliveryAddress || "Not provided"}
                  </p>

                  <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 dark:!bg-[#39B982]/10">
                    <span className="text-sm font-semibold text-slate-700 dark:!text-[#D0DAD3]">
                      Order Total
                    </span>
                    <span className="text-lg font-bold text-blue-700 dark:!text-[#39B982]">
                      {money(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Order status actions */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {order.status === "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOrderStatus(order._id, "accepted")}
                        className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                      >
                        ✓ Accept Order
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOrderStatus(order._id, "rejected")}
                        className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                      >
                        ✕ Reject Order
                      </button>
                    </>
                  )}

                  {order.status === "accepted" && (
                    <button
                      type="button"
                      onClick={() => handleOrderStatus(order._id, "processing")}
                      className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Start Processing →
                    </button>
                  )}

                  {order.status === "processing" && (
                    <button
                      type="button"
                      onClick={() => handleOrderStatus(order._id, "ready")}
                      className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
                    >
                      Mark Ready ✓
                    </button>
                  )}

                  {order.status === "ready" && (
                    <button
                      type="button"
                      onClick={() => handleOrderStatus(order._id, "completed")}
                      className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                      Mark Completed ✓
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Demo disclaimer */}
      <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-500 dark:!border-[#3C4942] dark:!bg-[#242C29] dark:!text-[#A0AEA5]">
        <strong className="text-slate-700 dark:!text-[#D0DAD3]">
          Portfolio demonstration:
        </strong>{" "}
        Catalogue items and orders are sample platform data. This feature does
        not verify prescriptions, process payments or arrange real medicine
        delivery.
      </p>
    </div>
  );
}

export default PharmacyDashboard;
