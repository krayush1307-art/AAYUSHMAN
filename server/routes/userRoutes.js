import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// Get the profile of the currently authenticated user.
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully!",
      user,
    });
  } catch (error) {
    console.error("Profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch profile.",
    });
  }
});

// Public API: Visitors can view active registered doctors.
// Only public profile information is returned.
router.get("/doctors/public", async (req, res) => {
  try {
    const doctors = await User.find({
      role: "doctor",
      isActive: true,
    })
      .select("name createdAt")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      message: "Public doctors fetched successfully!",
      totalDoctors: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Public doctors error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch doctors.",
    });
  }
});

// Patient-only API: Get registered and active doctors.
router.get(
  "/doctors",
  authMiddleware,
  authorizeRoles("patient"),
  async (req, res) => {
    try {
      const doctors = await User.find({
        role: "doctor",
        isActive: true,
      })
        .select("name email phone createdAt")
        .sort({ name: 1 });

      return res.status(200).json({
        success: true,
        message: "Doctors fetched successfully!",
        totalDoctors: doctors.length,
        doctors,
      });
    } catch (error) {
      console.error("Fetch doctors error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch doctors.",
      });
    }
  },
);

// Doctor-only API.
router.get(
  "/doctor-only",
  authMiddleware,
  authorizeRoles("doctor"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Doctor authorization successful!",
    });
  },
);

// Pharmacy-only API.
router.get(
  "/pharmacy-only",
  authMiddleware,
  authorizeRoles("pharmacy"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Pharmacy authorization successful!",
    });
  },
);

// Ambulance Operator-only API.
router.get(
  "/ambulance-only",
  authMiddleware,
  authorizeRoles("ambulance"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Ambulance authorization successful!",
    });
  },
);

// Admin-only API: Get registered user statistics.
router.get(
  "/admin/stats",
  authMiddleware,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const [total, patients, doctors, pharmacies, ambulances, admins] =
        await Promise.all([
          User.countDocuments(),
          User.countDocuments({ role: "patient" }),
          User.countDocuments({ role: "doctor" }),
          User.countDocuments({ role: "pharmacy" }),
          User.countDocuments({ role: "ambulance" }),
          User.countDocuments({ role: "admin" }),
        ]);

      return res.status(200).json({
        success: true,
        message: "Admin statistics fetched successfully!",
        statistics: {
          total,
          patients,
          doctors,
          pharmacies,
          ambulances,
          admins,
        },
      });
    } catch (error) {
      console.error("Admin statistics error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch admin statistics.",
      });
    }
  },
);

// Admin-only API: Get all registered users.
router.get(
  "/admin/users",
  authMiddleware,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        message: "Users fetched successfully!",
        totalUsers: users.length,
        users,
      });
    } catch (error) {
      console.error("Admin users error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch users.",
      });
    }
  },
);

// Admin-only API: Update a registered user's details.
router.put(
  "/admin/users/:id",
  authMiddleware,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, phone, role } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID.",
        });
      }

      const updates = {};

      if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) {
          return res.status(400).json({
            success: false,
            message: "Please provide a valid name.",
          });
        }
        updates.name = name.trim();
      }

      if (email !== undefined) {
        if (
          typeof email !== "string" ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ) {
          return res.status(400).json({
            success: false,
            message: "Please provide a valid email address.",
          });
        }
        updates.email = email.trim().toLowerCase();
      }

      if (phone !== undefined) {
        if (typeof phone !== "string") {
          return res.status(400).json({
            success: false,
            message: "Please provide a valid phone number.",
          });
        }
        updates.phone = phone.trim();
      }

      if (role !== undefined) {
        const allowedRoles = [
          "patient",
          "doctor",
          "pharmacy",
          "ambulance",
          "admin",
        ];

        if (!allowedRoles.includes(role)) {
          return res.status(400).json({
            success: false,
            message: "Invalid user role.",
          });
        }

        if (id === req.userId && role !== "admin") {
          return res.status(400).json({
            success: false,
            message: "You cannot change your own admin role.",
          });
        }

        updates.role = role;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide at least one field to update.",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User updated successfully!",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update user error:", error.message);

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "This email address is already registered.",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Unable to update user.",
      });
    }
  },
);

// Admin-only API: Activate or deactivate a user account.
router.patch(
  "/admin/users/:id/status",
  authMiddleware,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID.",
        });
      }

      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "Please provide isActive as true or false.",
        });
      }

      if (id === req.userId && isActive === false) {
        return res.status(400).json({
          success: false,
          message: "You cannot deactivate your own admin account.",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,
        { isActive },
        { new: true, runValidators: true },
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: isActive
          ? "User account activated successfully!"
          : "User account deactivated successfully!",
        user: updatedUser,
      });
    } catch (error) {
      console.error("User status update error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to update user account status.",
      });
    }
  },
);

export default router;
