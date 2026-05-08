const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: {
    type: [String],
    validate: [arr => arr.length === 4, 'Final exam questions must have exactly 4 options'],
  },
  correctAnswer: {
    type: Number, // Index of the correct option (0–3)
    required: true,
  },
});

// There will only ever be ONE document in this collection
const finalExamSchema = new mongoose.Schema(
  {
    passingScore: { type: Number, default: 70 },
    timeLimit: { type: Number, default: 60 }, // In minutes
    questions: {
      type: [questionSchema],
      validate: [arr => arr.length <= 20, 'Final exam cannot have more than 20 questions'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FinalExam', finalExamSchema);
