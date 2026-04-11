const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    studentId: {
      type: String,
      required: true,
      trim: true,
    },
    quizId: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    wrongAnswers: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: Number,
      required: true, // In seconds
      min: 0,
    },
    remainingTime: {
      type: Number,
      default: 0, // In seconds
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// One attempt per studentId per quiz
resultSchema.index({ studentId: 1, quizId: 1 }, { unique: true });

// Leaderboard index: Score DESC, Correct DESC, timeTaken ASC
resultSchema.index({ quizId: 1, score: -1, correctAnswers: -1, timeTaken: 1 });

module.exports = mongoose.model('Result', resultSchema);
