const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    options: {
      type: [String],
      validate: {
        validator: (arr) => arr.length === 4,
        message: 'Each question must have exactly 4 options',
      },
      required: true,
    },
    answer: {
      type: String,
      required: [true, 'Correct answer is required'],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
