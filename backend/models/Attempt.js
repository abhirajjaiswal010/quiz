const mongoose = require('mongoose');

/**
 * Attempt: tracks an in-progress quiz session for a student.
 * Created when a student joins an active quiz (or when a quiz starts).
 * Deleted on submission.
 * Enables answer restoration on reconnect and prevents double submission.
 */
const attemptSchema = new mongoose.Schema(
  {
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
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Partial answers saved progressively: { questionId: selectedOption }
    answers: {
      type: Map,
      of: String,
      default: {},
    },
    // ISO timestamp (ms) when student was admitted into the quiz
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    submitted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// One in-progress attempt per (roll + quizId)
attemptSchema.index({ roll: 1, quizId: 1 }, { unique: true });

// Auto-cleanup after 4 hours (safety net for abandoned sessions)
attemptSchema.index({ joinedAt: 1 }, { expireAfterSeconds: 14400 });

module.exports = mongoose.model('Attempt', attemptSchema);
