const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Result = require('../models/Result');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Fetch leaderboard for a specific quizId.
 * Sorting: Score (DESC), CorrectAnswers (DESC), TimeTaken (ASC)
 */
exports.getLeaderboard = asyncHandler(async (req, res, next) => {
  const quizId = req.query.quizId?.trim().toUpperCase();
  const quiz = await Quiz.findOne({ quizId });

  if (!quiz) return next(new ErrorResponse('Quiz not found', 404));

  const [results, totalQuestions] = await Promise.all([
    Result.find({ quizId }).sort({ score: -1, correctAnswers: -1, timeTaken: 1 }),
    Question.countDocuments(),
  ]);

  res.status(200).json({ 
    success: true, 
    results, 
    totalQuestions,
    participantCount: results.length
  });
});
