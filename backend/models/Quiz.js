const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    quizId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    // We can store question IDs here if each quiz has its own set
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    duration: {
      type: Number,
      default: 15, // Default 15 minutes
    },
    startedAt: {
      type: Date,
      default: null,
    },
    allowTabSwitching: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
