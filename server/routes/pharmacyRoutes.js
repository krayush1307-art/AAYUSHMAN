import express from "express";
import mongoose from "mongoose";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import Medicine from "../models/Medicine.js";
import MedicineOrder from "../models/MedicineOrder.js";

const router = express.Router();

// PUBLIC API: Anyone can browse available medicines without logging in.
router.get("/medicines/public", async (req, res) => {
  try {
    const medicines = await Medicine.find({
      isAvailable: true,
      stock: { $gt: 0 },
    })
      .populate("pharmacy", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalMedicines: medicines.length,
      medicines,
    });
  } catch (error) {
    console.error("Public medicines error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch medicines.",
    });
  }
});

// All remaining pharmacy APIs require login.
router.use(authMiddleware);

// Get medicines for logged-in users.
router.get(
  "/medicines",
  authorizeRoles("patient", "pharmacy", "admin"),
  async (req, res) => {
    try {
      const filter =
        req.userRole === "pharmacy"
          ? { pharmacy: req.userId }
          : { isAvailable: true, stock: { $gt: 0 } };

      const medicines = await Medicine.find(filter)
        .populate("pharmacy", "name")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        totalMedicines: medicines.length,
        medicines,
      });
    } catch (error) {
      console.error("Fetch medicines error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to fetch medicines.",
      });
    }
  },
);

// Add a new medicine.
router.post("/medicines", authorizeRoles("pharmacy"), async (req, res) => {
  try {
    const { name, category, description, price, stock, image } = req.body;

    if (
      !name?.trim() ||
      !category?.trim() ||
      price === undefined ||
      stock === undefined ||
      !Number.isFinite(Number(price)) ||
      !Number.isInteger(Number(stock)) ||
      Number(price) < 0 ||
      Number(stock) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid medicine details.",
      });
    }

    const medicine = await Medicine.create({
      pharmacy: req.userId,
      name: name.trim(),
      category: category.trim(),
      description: description || "",
      price: Number(price),
      stock: Number(stock),
      image: image || "",
      isAvailable: Number(stock) > 0,
    });

    return res.status(201).json({
      success: true,
      message: "Medicine added successfully!",
      medicine,
    });
  } catch (error) {
    console.error("Add medicine error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to add medicine.",
    });
  }
});

// Edit a pharmacy's own medicine.
router.put("/medicines/:id", authorizeRoles("pharmacy"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid medicine ID.",
      });
    }

    const medicine = await Medicine.findOne({
      _id: id,
      pharmacy: req.userId,
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found in your pharmacy.",
      });
    }

    const { name, category, description, price, stock, image } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid medicine name.",
        });
      }
      medicine.name = name.trim();
    }

    if (category !== undefined) {
      if (typeof category !== "string" || !category.trim()) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid category.",
        });
      }
      medicine.category = category.trim();
    }

    if (description !== undefined) {
      medicine.description = description;
    }

    if (image !== undefined) {
      medicine.image = image;
    }

    if (price !== undefined) {
      if (!Number.isFinite(Number(price)) || Number(price) < 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid price.",
        });
      }
      medicine.price = Number(price);
    }

    if (stock !== undefined) {
      if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide valid stock.",
        });
      }
      medicine.stock = Number(stock);
      medicine.isAvailable = Number(stock) > 0;
    }

    await medicine.save();

    return res.status(200).json({
      success: true,
      message: "Medicine updated successfully!",
      medicine,
    });
  } catch (error) {
    console.error("Update medicine error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to update medicine.",
    });
  }
});

// Delete a pharmacy's own medicine.
router.delete(
  "/medicines/:id",
  authorizeRoles("pharmacy"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid medicine ID.",
        });
      }

      const medicine = await Medicine.findOneAndDelete({
        _id: id,
        pharmacy: req.userId,
      });

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: "Medicine not found in your pharmacy.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Medicine deleted successfully!",
      });
    } catch (error) {
      console.error("Delete medicine error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to delete medicine.",
      });
    }
  },
);

// Patient places an order.
router.post("/orders", authorizeRoles("patient"), async (req, res) => {
  try {
    const { items, deliveryAddress, phone } = req.body;

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      !deliveryAddress?.trim() ||
      !phone?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide medicines, address and phone number.",
      });
    }

    const quantities = new Map();

    for (const item of items) {
      if (
        !mongoose.Types.ObjectId.isValid(item.medicineId) ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide valid medicine IDs and quantities.",
        });
      }

      const id = item.medicineId.toString();
      quantities.set(id, (quantities.get(id) || 0) + Number(item.quantity));
    }

    const medicineIds = [...quantities.keys()];

    const medicines = await Medicine.find({
      _id: { $in: medicineIds },
      isAvailable: true,
    });

    if (medicines.length !== medicineIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more medicines are unavailable.",
      });
    }

    const pharmacyId = medicines[0].pharmacy.toString();

    if (
      medicines.some((medicine) => medicine.pharmacy.toString() !== pharmacyId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please place separate orders for different pharmacies.",
      });
    }

    const orderItems = medicines.map((medicine) => {
      const quantity = quantities.get(medicine._id.toString());

      if (medicine.stock < quantity) {
        throw new Error(`Insufficient stock for ${medicine.name}.`);
      }

      return {
        medicine: medicine._id,
        name: medicine.name,
        quantity,
        price: medicine.price,
      };
    });

    const totalAmount = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    const order = await MedicineOrder.create({
      patient: req.userId,
      pharmacy: pharmacyId,
      items: orderItems,
      totalAmount,
      deliveryAddress: deliveryAddress.trim(),
      phone: phone.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Medicine order placed successfully!",
      order,
    });
  } catch (error) {
    console.error("Place order error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to place order.",
    });
  }
});

// Pharmacy views its incoming orders.
router.get("/orders/pharmacy", authorizeRoles("pharmacy"), async (req, res) => {
  try {
    const orders = await MedicineOrder.find({
      pharmacy: req.userId,
    })
      .populate("patient", "name phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Pharmacy orders error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch pharmacy orders.",
    });
  }
});

// Patient views their own orders.
router.get("/orders/patient", authorizeRoles("patient"), async (req, res) => {
  try {
    const orders = await MedicineOrder.find({
      patient: req.userId,
    })
      .populate("pharmacy", "name phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Patient orders error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch patient orders.",
    });
  }
});

// Pharmacy updates the status of its own order.
router.patch(
  "/orders/:id/status",
  authorizeRoles("pharmacy"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "accepted",
        "rejected",
        "processing",
        "ready",
        "completed",
      ];

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID.",
        });
      }

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status.",
        });
      }

      const order = await MedicineOrder.findOne({
        _id: id,
        pharmacy: req.userId,
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found in your pharmacy.",
        });
      }

      const transitions = {
        pending: ["accepted", "rejected"],
        accepted: ["processing"],
        processing: ["ready"],
        ready: ["completed"],
      };

      if (!transitions[order.status]?.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot change order from ${order.status} to ${status}.`,
        });
      }

      // Deduct stock only when the pharmacy accepts the order.
      if (status === "accepted") {
        const reserved = [];

        for (const item of order.items) {
          const updatedMedicine = await Medicine.findOneAndUpdate(
            {
              _id: item.medicine,
              pharmacy: req.userId,
              stock: { $gte: item.quantity },
            },
            {
              $inc: { stock: -item.quantity },
            },
            { returnDocument: "after" },
          );

          if (!updatedMedicine) {
            // Restore stock if another item could not be reserved.
            for (const previous of reserved) {
              await Medicine.updateOne(
                { _id: previous.medicine },
                { $inc: { stock: previous.quantity } },
              );
            }

            return res.status(409).json({
              success: false,
              message: `Insufficient stock for ${item.name}.`,
            });
          }

          reserved.push(item);
          updatedMedicine.isAvailable = updatedMedicine.stock > 0;
          await updatedMedicine.save();
        }
      }

      order.status = status;
      await order.save();

      return res.status(200).json({
        success: true,
        message: `Order ${status} successfully!`,
        order,
      });
    } catch (error) {
      console.error("Update order status error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Unable to update order status.",
      });
    }
  },
);

export default router;
