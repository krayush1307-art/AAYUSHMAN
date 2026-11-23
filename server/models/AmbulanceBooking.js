import mongoose from "mongoose";

const ambulanceBookingSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ambulanceOperator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    patientName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // Patient's pickup address.
    location: {
      type: String,
      required: true,
      trim: true,
    },

    // Patient's pickup coordinates.
    latitude: {
      type: Number,
      default: null,
      min: -90,
      max: 90,
    },

    longitude: {
      type: Number,
      default: null,
      min: -180,
      max: 180,
    },

    // Ambulance's latest GPS coordinates.
    ambulanceLatitude: {
      type: Number,
      default: null,
      min: -90,
      max: 90,
    },

    ambulanceLongitude: {
      type: Number,
      default: null,
      min: -180,
      max: 180,
    },

    // Time of the latest GPS update.
    lastLocationUpdate: {
      type: Date,
      default: null,
    },

    emergencyType: {
      type: String,
      required: true,
      enum: ["Medical Emergency", "Accident", "Pregnancy", "Other"],
    },

    status: {
      type: String,
      enum: [
        "requested",
        "accepted",
        "rejected",
        "on-the-way",
        "arrived",
        "completed",
        "cancelled",
      ],
      default: "requested",
    },

    vehicleNumber: {
      type: String,
      default: "",
      trim: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const AmbulanceBooking = mongoose.model(
  "AmbulanceBooking",
  ambulanceBookingSchema,
);

export default AmbulanceBooking;
