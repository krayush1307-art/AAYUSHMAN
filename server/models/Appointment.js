import mongoose from "mongoose";

// Appointment schema stores consultation bookings between patients and doctors.
const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    appointmentDate: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      trim: true,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
