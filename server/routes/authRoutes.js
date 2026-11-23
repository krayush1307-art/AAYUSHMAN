import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Generate JWT containing both user ID and role
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ==============================
// USER REGISTRATION
// ==============================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Public registration cannot create admin accounts
    const allowedRoles = ["patient", "doctor", "pharmacy", "ambulance"];
    const selectedRole = role || "patient";

    if (!allowedRoles.includes(selectedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account role.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash password before saving it
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      role: selectedRole,
    });

    // Include the user's role in the authentication token
    const token = generateToken(newUser._id, newUser.role);

    return res.status(201).json({
      success: true,
      message: "Registration successful!",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to register user. Please try again.",
    });
  }
});

// ==============================
// USER LOGIN
// ==============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Verify entered password against stored hash
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Include the user's role in the authentication token
    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to login. Please try again.",
    });
  }
});

export default router;
