const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Module title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    coverImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // References the admin who created it
    },
    // Add course-level quiz
    quiz: {
      id: String,
      courseId: String,
      questions: [{
        id: String,
        text: String,
        options: [String],
        correctAnswer: { type: Number, default: 0 }
      }],
      passingScore: { type: Number, default: 60 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Module', moduleSchema);
