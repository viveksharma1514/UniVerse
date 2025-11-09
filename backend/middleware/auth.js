// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * 🔐 Authentication Middleware
 * Verifies JWT tokens and attaches the user to the request.
 */
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized — Missing Bearer token" });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);
    res.status(401).json({
      success: false,
      message: "Unauthorized — Invalid or expired token",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = auth;
