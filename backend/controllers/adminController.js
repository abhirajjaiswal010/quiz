const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Participant = require('../models/Participant');
const Result = require('../models/Result');
const Attempt = require('../models/Attempt');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { getIO } = require('../socket');

/** ─── Lifecycle Control ────────────────────────────────────────────────────── */

// POST /api/create-quiz
exports.createQuiz = asyncHandler(async (req, res, next) => {
  const { duration, allowTabSwitching } = req.body;
  const quizId = req.body.quizId?.trim().toUpperCase();
  if (!quizId) return next(new ErrorResponse('quizId is required', 400));

  const existing = await Quiz.findOne({ quizId });
  if (existing) return next(new ErrorResponse('quizId already exists', 400));

  const quiz = await Quiz.create({
    quizId,
    isActive: false,
    duration: duration || 15,
    allowTabSwitching: !!allowTabSwitching,
  });

  getIO().to(`ADMIN_${quizId}`).emit('quizCreated', quiz);
  res.status(201).json({ success: true, quiz });
});

// POST /api/start-quiz
exports.startQuiz = asyncHandler(async (req, res, next) => {
  const quizId = req.body.quizId?.trim().toUpperCase();
  const { allowTabSwitching } = req.body;
  const startedAt = new Date();

  const quiz = await Quiz.findOneAndUpdate(
    { quizId },
    { isActive: true, startedAt, allowTabSwitching: !!allowTabSwitching },
    { new: true }
  );
  if (!quiz) return next(new ErrorResponse('Quiz not found', 404));

  const questions = await Question.find({}, { answer: 0 });
  
  getIO().to(quizId).emit('quizStarted', {
    quizId,
    questions,
    duration: quiz.duration,
    startTime: startedAt.getTime(),
    allowTabSwitching: quiz.allowTabSwitching,
  });

  res.status(200).json({ success: true, isActive: true });
});

// POST /api/stop-quiz
exports.stopQuiz = asyncHandler(async (req, res, next) => {
  const quizId = req.body.quizId?.trim().toUpperCase();
  const quiz = await Quiz.findOneAndUpdate(
    { quizId },
    { isActive: false, startedAt: null },
    { new: true }
  );
  if (!quiz) return next(new ErrorResponse('Quiz not found', 404));

  getIO().to(quizId).emit('quizStopped', { quizId });
  res.status(200).json({ success: true, isActive: false });
});

/** ─── Status & History ───────────────────────────────────────────────────────── */

// GET /api/quiz-status?quizId=
exports.getQuizStatus = asyncHandler(async (req, res, next) => {
  const quizId = req.query.quizId?.trim().toUpperCase();
  const quiz = await Quiz.findOne({ quizId });
  if (!quiz) return next(new ErrorResponse('Quiz not found', 404));

  const [activeParticipants, submittedResults, totalQuestions] = await Promise.all([
    Participant.find({ quizId }).select('name roll joinedAt').sort({ joinedAt: -1 }),
    Result.find({ quizId }).select('name roll createdAt').sort({ createdAt: -1 }),
    Question.countDocuments()
  ]);

  const submittedParticipants = submittedResults.map(r => ({
    name: r.name,
    roll: r.roll,
    joinedAt: r.createdAt,
    isSubmitted: true
  }));

  const allParticipants = [...activeParticipants, ...submittedParticipants].sort((a, b) => 
    new Date(b.joinedAt) - new Date(a.joinedAt)
  );

  res.status(200).json({
    success: true,
    isActive: quiz.isActive,
    participantCount: activeParticipants.length,
    participants: allParticipants,
    totalQuestions,
    createdAt: quiz.createdAt,
    startTime: quiz.startedAt ? quiz.startedAt.getTime() : null,
    quizDetails: quiz,
  });
});

// GET /api/admin/quizzes
exports.getAllQuizzes = asyncHandler(async (req, res, next) => {
  const quizzes = await Quiz.find({}).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: quizzes.length, quizzes });
});

// DELETE /api/admin/quizzes/:quizId
exports.deleteQuiz = asyncHandler(async (req, res, next) => {
  const { quizId } = req.params;
  const normalizedId = quizId.trim().toUpperCase();

  const quiz = await Quiz.findOne({ quizId: normalizedId });
  if (!quiz) return next(new ErrorResponse('Quiz not found', 404));

  await Promise.all([
    Quiz.deleteOne({ quizId: normalizedId }),
    Result.deleteMany({ quizId: normalizedId }),
    Participant.deleteMany({ quizId: normalizedId }),
    Attempt.deleteMany({ quizId: normalizedId }),
  ]);

  res.status(200).json({ success: true, message: `Session ${normalizedId} deleted.` });
});

// GET /api/admin/verify
exports.verifyAdmin = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, message: 'Authorized' });
});
