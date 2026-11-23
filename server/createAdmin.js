import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI } = process.env;

    // Check required credentials
    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || !MONGO_URI) {
      throw new Error("Admin credentials or MONGO_URI are missing.");
    }

    if (ADMIN_PASSWORD.length < 12) {
      throw new Error("Admin password must be at least 12 characters.");
    }

    await mongoose.connect(MONGO_URI);

    const email = ADMIN_EMAIL.trim().toLowerCase();

    // Prevent duplicate Admin accounts
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error("An account with this email already exists.");
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await User.create({
      name: ADMIN_NAME,
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin account created successfully!");
  } catch (error) {
    console.error("Admin creation failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
