const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ msg: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ msg: "Invalid token" });

    req.admin = admin;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Unauthorized" });
  }
};

module.exports = adminAuth; // ✅ Important: export directly
