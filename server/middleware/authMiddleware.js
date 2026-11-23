import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Verify the user's token and account status
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check for a Bearer token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please login to access this resource.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token using the private secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate the token payload
    if (!decoded.id || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    // Check the latest account status directly from MongoDB
    const user = await User.findById(decoded.id).select("role isActive");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated. Please contact the administrator.",
      });
    }

    req.userId = user._id.toString();
    req.userRole = user.role;

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

export default authMiddleware;
