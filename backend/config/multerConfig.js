// utils/multerConfig.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Define base upload paths
const baseDir = path.join(__dirname, "..", "uploads");
const assignmentsDir = path.join(baseDir, "assignments");
const submissionsDir = path.join(assignmentsDir, "submissions");
const materialsDir = path.join(assignmentsDir, "materials");

// ✅ Ensure directories exist (safe for Render & local)
[assignmentsDir, submissionsDir, materialsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📂 Created directory: ${dir}`);
  }
});

// ✅ Storage configuration for submissions
const submissionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("📁 Multer saving to:", submissionsDir);
    cb(null, submissionsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/\s+/g, "_"); // avoid spaces
    const filename = `submission-${uniqueSuffix}-${safeName}`;
    console.log("📄 Saving file as:", filename);
    cb(null, filename);
  },
});

// ✅ File filter (safe + dev mode lenient)
const fileFilter = (req, file, cb) => {
  console.log("🔍 Checking file:", file.originalname, "Type:", file.mimetype);

  // Accept common types or allow all if needed
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "image/jpeg",
    "image/png",
    "text/plain",
  ];

  if (process.env.NODE_ENV === "development") {
    cb(null, true);
  } else {
    allowedTypes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("❌ Invalid file type"), false);
  }
};

// ✅ Multer upload configs
const uploadSubmission = multer({
  storage: submissionStorage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024, files: 10 }, // 50MB, 10 files
});

const uploadMaterial = multer({
  storage: submissionStorage, // You can customize later if needed
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024, files: 10 },
});

module.exports = { uploadSubmission, uploadMaterial };
