// models/Assignment.js
const mongoose = require("mongoose");

/* ============================================================
   📄 File Schema — stores file details for materials/submissions
============================================================ */
const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  mimetype: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

/* ============================================================
   🧑‍🎓 Submission Schema — supports multiple files & grading
============================================================ */
const submissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  studentName: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  files: [fileSchema],
  notes: { type: String, default: "" },
  marks: { type: Number, min: 0 },
  feedback: { type: String, default: "" },
  gradedAt: { type: Date },
});

/* ============================================================
   📚 Assignment Schema — for managing uploaded materials
============================================================ */
const AssignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacherName: { type: String, required: false },
    subject: { type: String, required: true },
    dueDate: { type: Date, required: true },
    maxMarks: { type: Number, required: true },

    // Array of uploaded files and student submissions
    materials: [fileSchema],
    submissions: [submissionSchema],
  },
  {
    timestamps: true,
  }
);

/* ============================================================
   ⚙️ Indexing for query performance
============================================================ */
AssignmentSchema.index({ teacherId: 1, createdAt: -1 });
AssignmentSchema.index({ subject: 1, dueDate: 1 });

/* ============================================================
   🚀 Model Export
============================================================ */
module.exports = mongoose.model("Assignment", AssignmentSchema);
