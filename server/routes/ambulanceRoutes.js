import express from "express";
import mongoose from "mongoose";
import authMiddleware from "../middleware/authMiddleware.js";
import AmbulanceBooking from "../models/AmbulanceBooking.js";

const router = express.Router();

router.use(authMiddleware);

// Role protection.
const allowRole = (role) => (req, res, next) => {
  if (req.userRole !== role && req.userRole !== "admin") {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to perform this action.",
    });
  }
  next();
};

const validCoordinates = (latitude, longitude) =>
  Number.isFinite(latitude) &&
  Number.isFinite(longitude) &&
  latitude >= -90 &&
  latitude <= 90 &&
  longitude >= -180 &&
  longitude <= 180;

// PATIENT: Create ambulance booking.
router.post("/", allowRole("patient"), async (req, res) => {
  try {
    const {
      patientName,
      phone,
      location,
      latitude,
      longitude,
      emergencyType,
      notes,
    } = req.body;

    if (!patientName || !phone || !location || !emergencyType) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required booking details.",
      });
    }

    const hasLatitude =
      latitude !== undefined && latitude !== null && latitude !== "";
    const hasLongitude =
      longitude !== undefined && longitude !== null && longitude !== "";

    if (hasLatitude !== hasLongitude) {
      return res.status(400).json({
        success: false,
        message: "Please provide both map coordinates.",
      });
    }

    let validLatitude = null;
    let validLongitude = null;

    if (hasLatitude && hasLongitude) {
      validLatitude = Number(latitude);
      validLongitude = Number(longitude);

      if (!validCoordinates(validLatitude, validLongitude)) {
        return res.status(400).json({
          success: false,
          message: "Invalid map coordinates.",
        });
      }
    }

    const booking = await AmbulanceBooking.create({
      patient: req.userId,
      patientName,
      phone,
      location,
      latitude: validLatitude,
      longitude: validLongitude,
      emergencyType,
      notes: notes || "",
    });

    return res.status(201).json({
      success: true,
      message: "Demo ambulance request created successfully.",
      booking,
      disclaimer: "This is a demo request. No real ambulance was dispatched.",
    });
  } catch (error) {
    console.error("Ambulance booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create ambulance booking.",
    });
  }
});

// PATIENT: View personal ambulance bookings.
router.get("/patient", allowRole("patient"), async (req, res) => {
  try {
    const bookings = await AmbulanceBooking.find({
      patient: req.userId,
    })
      .populate("ambulanceOperator", "name phone")
      .sort({ createdAt: -1 });

    return res.json({ success: true, bookings });
  } catch (error) {
    console.error("Patient ambulance bookings error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load your ambulance bookings.",
    });
  }
});

// PATIENT: Get the latest location for one of their own bookings.
router.get("/:id/track", allowRole("patient"), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const booking = await AmbulanceBooking.findOne({
      _id: req.params.id,
      patient: req.userId,
    }).select(
      "status ambulanceLatitude ambulanceLongitude lastLocationUpdate vehicleNumber",
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Ambulance booking not found.",
      });
    }

    return res.json({
      success: true,
      tracking: {
        status: booking.status,
        latitude: booking.ambulanceLatitude,
        longitude: booking.ambulanceLongitude,
        lastLocationUpdate: booking.lastLocationUpdate,
        vehicleNumber: booking.vehicleNumber,
      },
    });
  } catch (error) {
    console.error("Ambulance tracking read error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load ambulance location.",
    });
  }
});

// AMBULANCE OPERATOR: View pending requests and assigned bookings.
router.get("/operator", allowRole("ambulance"), async (req, res) => {
  try {
    const bookings = await AmbulanceBooking.find({
      $or: [{ status: "requested" }, { ambulanceOperator: req.userId }],
    })
      .populate("patient", "name phone")
      .sort({ createdAt: -1 });

    return res.json({ success: true, bookings });
  } catch (error) {
    console.error("Operator ambulance bookings error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load ambulance requests.",
    });
  }
});

// AMBULANCE OPERATOR: Accept or reject a pending request.
router.patch("/:id/decision", allowRole("ambulance"), async (req, res) => {
  try {
    const { decision } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    if (!["accepted", "rejected"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Decision must be accepted or rejected.",
      });
    }

    const booking = await AmbulanceBooking.findOneAndUpdate(
      {
        _id: req.params.id,
        status: "requested",
        ambulanceOperator: null,
      },
      {
        status: decision,
        ...(decision === "accepted" ? { ambulanceOperator: req.userId } : {}),
      },
      { new: true, runValidators: true },
    );

    if (!booking) {
      return res.status(409).json({
        success: false,
        message: "This request is no longer available.",
      });
    }

    return res.json({
      success: true,
      message: `Ambulance request ${decision}.`,
      booking,
    });
  } catch (error) {
    console.error("Ambulance decision error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update ambulance request.",
    });
  }
});

// AMBULANCE OPERATOR: Send the latest GPS location.
router.patch("/:id/location", allowRole("ambulance"), async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    if (!validCoordinates(Number(latitude), Number(longitude))) {
      return res.status(400).json({
        success: false,
        message: "Valid GPS coordinates are required.",
      });
    }

    const booking = await AmbulanceBooking.findOneAndUpdate(
      {
        _id: req.params.id,
        ambulanceOperator: req.userId,
        status: "on-the-way",
      },
      {
        ambulanceLatitude: Number(latitude),
        ambulanceLongitude: Number(longitude),
        lastLocationUpdate: new Date(),
      },
      { new: true, runValidators: true },
    ).select("_id ambulanceLatitude ambulanceLongitude lastLocationUpdate");

    if (!booking) {
      return res.status(409).json({
        success: false,
        message:
          "Only an assigned ambulance on the way can share GPS location.",
      });
    }

    return res.json({
      success: true,
      message: "Ambulance location updated.",
      booking,
    });
  } catch (error) {
    console.error("Ambulance GPS update error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update ambulance location.",
    });
  }
});

// AMBULANCE OPERATOR: Update booking status.
router.patch("/:id/status", allowRole("ambulance"), async (req, res) => {
  try {
    const { status } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const allowedStatuses = ["on-the-way", "arrived", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status.",
      });
    }

    const booking = await AmbulanceBooking.findOneAndUpdate(
      {
        _id: req.params.id,
        ambulanceOperator: req.userId,
        status: { $in: ["accepted", "on-the-way", "arrived"] },
      },
      { status },
      { new: true, runValidators: true },
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Assigned ambulance booking not found.",
      });
    }

    return res.json({
      success: true,
      message: "Ambulance booking status updated.",
      booking,
    });
  } catch (error) {
    console.error("Ambulance status error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update booking status.",
    });
  }
});

export default router;
