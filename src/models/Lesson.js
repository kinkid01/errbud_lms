const mongoose = require('mongoose');

// Each quiz question inside a lesson
const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: {
    type: [String],
    validate: [arr => arr.length === 4, 'Each question must have exactly 4 options'],
  },
  correctAnswer: {
    type: Number, // Index of the correct option (0–4)
    default: 0,
  },
});

const lessonSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: [true, 'Module reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    content: {
      type: String,
      required: [true, 'Learning content is required'],
    },
    visualContent: {
      type: String, // Image URL shown below lesson content
      default: '',
    },
    order: {
      type: Number, // Controls the display order within a module
      required: true,
      default: 1,
    },
    quiz: {
      passingScore: { type: Number, default: 60 },
      questions: [questionSchema],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lesson', lessonSchema);
