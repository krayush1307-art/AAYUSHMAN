import express from "express";
import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// Patient creates a new appointment with a doctor.
router.post(
  "/",
  authMiddleware,
  authorizeRoles("patient"),
  async (req, res) => {
    try {
      const { doctorId, appointmentDate, reason } = req.body;

      if (
        !doctorId ||
        !mongoose.Types.ObjectId.isValid(doctorId) ||
        !appointmentDate ||
        typeof reason !== "string" ||
        !reason.trim()
      ) {
        return res.status(400).json({
          message: "Please provide valid appointment details.",
        });
      }

      const date = new Date(appointmentDate);

      if (Number.isNaN(date.getTime()) || date <= new Date()) {
        return res.status(400).json({
          message: "Please select a valid future appointment date.",
        });
      }

      // Verify that the selected account is an active doctor.
      const doctor = await User.findOne({
        _id: doctorId,
        role: "doctor",
        isActive: true,
      });

      if (!doctor) {
        return res.status(404).json({
          message: "Doctor not found or inactive.",
        });
      }

      const appointment = await Appointment.create({
        patient: req.userId,
        doctor: doctorId,
        appointmentDate: date,
        reason: reason.trim(),
      });

      // Return the newly created appointment with doctor details.
      await appointment.populate("doctor", "name email phone");

      return res.status(201).json({
        message: "Appointment request submitted successfully.",
        appointment,
      });
    } catch (error) {
      console.error("Create appointment error:", error.message);

      return res.status(500).json({
        message: "Failed to create appointment.",
      });
    }
  },
);

// Doctor views appointments assigned to them.
router.get(
  "/doctor",
  authMiddleware,
  authorizeRoles("doctor"),
  async (req, res) => {
    try {
      const appointments = await Appointment.find({
        doctor: req.userId,
      })
        .populate("patient", "name email phone")
        .sort({ appointmentDate: 1 });

      return res.status(200).json({
        appointments,
      });
    } catch (error) {
      console.error("Doctor appointments error:", error.message);

      return res.status(500).json({
        message: "Failed to fetch doctor appointments.",
      });
    }
  },
);

// Patient views their own appointments.
router.get(
  "/patient",
  authMiddleware,
  authorizeRoles("patient"),
  async (req, res) => {
    try {
      const appointments = await Appointment.find({
        patient: req.userId,
      })
        .populate("doctor", "name email phone")
        .sort({ appointmentDate: 1 });

      return res.status(200).json({
        appointments,
      });
    } catch (error) {
      console.error("Patient appointments error:", error.message);

      return res.status(500).json({
        message: "Failed to fetch patient appointments.",
      });
    }
  },
);

// Doctor updates the status of their own appointment.
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("doctor"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid appointment ID.",
        });
      }

      const allowedStatuses = ["accepted", "rejected", "completed"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid appointment status.",
        });
      }

      // Ensure the doctor can update only their own appointments.
      const appointment = await Appointment.findOne({
        _id: id,
        doctor: req.userId,
      });

      if (!appointment) {
        return res.status(404).json({
          message: "Appointment not found.",
        });
      }

      if (appointment.status !== "pending" && status !== "completed") {
        return res.status(400).json({
          message: "This appointment can no longer be accepted or rejected.",
        });
      }

      appointment.status = status;
      await appointment.save();

      // IMPORTANT: Populate patient details before sending the updated appointment.
      await appointment.populate("patient", "name email phone");

      return res.status(200).json({
        message: "Appointment status updated successfully.",
        appointment,
      });
    } catch (error) {
      console.error("Update appointment error:", error.message);

      return res.status(500).json({
        message: "Failed to update appointment status.",
      });
    }
  },
);

export default router;
