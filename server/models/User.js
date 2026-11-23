import mongoose from "mongoose";

// Define the structure of every AAYUSHMAN user
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    role: {
      type: String,
      enum: ["patient", "doctor", "pharmacy", "ambulance", "admin"],
      default: "patient",
    },

    // Admin can activate or deactivate a user account
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    // Automatically maintain createdAt and updatedAt
    timestamps: true,
  },
);

// Create and export the User model
const User = mongoose.model("User", userSchema);

export default User;
