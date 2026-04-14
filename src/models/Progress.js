const mongoose = require('mongoose');

// Tracks a student's progress on a single lesson inside a module
const lessonProgressSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started',
  },
  quizScore: { type: Number, default: null },   // % score on the quiz
  attempts: { type: Number, default: 0 },        // How many times quiz was attempted
  completedAt: { type: Date, default: null },
});

// One Progress document = one student enrolled in one module
const progressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    lessonProgress: [lessonProgressSchema],
    finalExamScore: { type: Number, default: null },
    quizScore: { type: Number, default: null }, // Course-level quiz score
    certificateIssued: { type: Boolean, default: false },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// A student can only be enrolled in the same module once
progressSchema.index({ studentId: 1, moduleId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
