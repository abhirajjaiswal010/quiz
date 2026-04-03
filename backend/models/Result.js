const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    roll: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
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
    timeTaken: {
      type: Number,
      required: true,
      min: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// One attempt per roll per quiz
resultSchema.index({ roll: 1, quizId: 1 }, { unique: true });

// Leaderboard index
resultSchema.index({ quizId: 1, score: -1, timeTaken: 1 });

module.exports = mongoose.model('Result', resultSchema);
