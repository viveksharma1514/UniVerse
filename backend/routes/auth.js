// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/* ============================================================
   📝 REGISTER (Student or Teacher)
============================================================ */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, enrollmentId, subject, department } =
      req.body;

    console.log("🆕 Registration attempt:", email);

    // Validate input
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ success: false, message: "All required fields must be provided" });
    }

    // Check for existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists with this email" });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role,
      enrollmentId: role === "student" ? enrollmentId : undefined,
      subject: role === "teacher" ? subject : undefined,
      department: department || undefined,
    });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        enrollmentId: user.enrollmentId,
        subject: user.subject,
        department: user.department,
      },
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/* ============================================================
   🔐 LOGIN (JWT-based)
============================================================ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        enrollmentId: user.enrollmentId,
        subject: user.subject,
        department: user.department,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
