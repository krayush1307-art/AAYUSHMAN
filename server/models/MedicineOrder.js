import mongoose from "mongoose";

// Store each patient's medicine order.
const medicineOrderSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        medicine: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicine",
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "processing",
        "ready",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

const MedicineOrder = mongoose.model("MedicineOrder", medicineOrderSchema);

export default MedicineOrder;
