const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Participant = require('../models/Participant');
const Result = require('../models/Result');
const Attempt = require('../models/Attempt');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { getIO } = require('../socket');
const { isTimeExpired, calculateScore } = require('../utils/quizUtils');

// Join a quiz session
exports.joinQuiz = asyncHandler(async (req, res, next) => {
  const { name, roll } = req.body;
  const quizId = req.body.quizId?.trim().toUpperCase();
  const rollUpper = roll?.trim().toUpperCase();

  if (!quizId || !name || !rollUpper) {
    return next(new ErrorResponse('name, roll, and quizId are required', 400));
  }

  const quiz = await Quiz.findOne({ quizId });
  if (!quiz) return next(new ErrorResponse('Invalid quizId', 404));

  // Already submitted?
  const existingResult = await Result.findOne({ roll: rollUpper, quizId });
  if (existingResult) {
    return next(new ErrorResponse('You have already submitted this quiz', 400));
  }

  const timeExpired = isTimeExpired(quiz);
  if (quiz.isActive && timeExpired) {
    return res.status(200).json({ success: true, quizState: 'expired', message: 'Quiz elapsed.' });
  }

  // Register participant (idempotent)
  const existingParticipant = await Participant.findOne({ roll: rollUpper, quizId });
  if (!existingParticipant) {
    await Participant.create({ name, roll: rollUpper, quizId });
  }

  const existingAttempt = await Attempt.findOne({ roll: rollUpper, quizId });

  if (quiz.isActive && !timeExpired) {
    const questions = await Question.find({}, { answer: 0 }).lean();

    if (!existingAttempt) {
      await Attempt.create({ roll: rollUpper, quizId, name, answers: {} });
    }

    const participantCount = await Participant.countDocuments({ quizId });
    const joinPayload = { participantCount, name, roll: rollUpper };
    
    const { emitToQuiz, emitToAdmin } = require('../socket');
    emitToQuiz(quizId, 'participantJoined', joinPayload);
    emitToAdmin(quizId, 'participantJoined', joinPayload);

    return res.status(200).json({
      success: true,
      quizState: 'active',
      startTime: quiz.startedAt.getTime(),
      duration: quiz.duration,
      questions,
      allowTabSwitching: quiz.allowTabSwitching,
      savedAnswers: existingAttempt ? Object.fromEntries(existingAttempt.answers) : {},
    });
  }

  const participantCount = await Participant.countDocuments({ quizId });
  if (!existingParticipant) {
    const joinPayload = { participantCount, name, roll: rollUpper };
    const { emitToQuiz, emitToAdmin } = require('../socket');
    emitToQuiz(quizId, 'participantJoined', joinPayload);
    emitToAdmin(quizId, 'participantJoined', joinPayload);
  }

  return res.status(200).json({ success: true, quizState: 'waiting', message: 'Ready.' });
});

// Partial answer saving for reconnection support
exports.saveProgress = asyncHandler(async (req, res, next) => {
  const { roll, answers } = req.body;
  const quizId = req.body.quizId?.trim().toUpperCase();
  const rollUpper = roll?.trim().toUpperCase();

  const quiz = await Quiz.findOne({ quizId });
  if (!quiz || !quiz.isActive) {
    return res.status(200).json({ success: true, message: 'Quiz not active.' });
  }

  await Attempt.findOneAndUpdate(
    { roll: rollUpper, quizId },
    { $set: { answers } },
    { new: true, upsert: true }
  );

  res.status(200).json({ success: true });
});

// Student fetches question list
exports.getQuestions = asyncHandler(async (req, res, next) => {
  const quizId = req.query.quizId?.trim().toUpperCase();
  const quiz = await Quiz.findOne({ quizId });

  if (!quiz) return next(new ErrorResponse('Quiz not found', 404));
  if (!quiz.isActive) return next(new ErrorResponse('Quiz not active', 403));

  const questions = await Question.find({}, { answer: 0 }).lean();
  res.status(200).json({
    success: true,
    questions,
    startTime: quiz.startedAt ? quiz.startedAt.getTime() : null,
    duration: quiz.duration,
  });
});

// Final submission and scoring logic
exports.submitQuiz = asyncHandler(async (req, res, next) => {
  const { name, roll, answers } = req.body;
  const quizId = req.body.quizId?.trim().toUpperCase();
  const rollUpper = roll?.trim().toUpperCase();

  const quiz = await Quiz.findOne({ quizId });
  if (!quiz) return next(new ErrorResponse('Quiz not found', 404));
  if (!quiz.startedAt) return next(new ErrorResponse('Quiz not started', 403));

  const existing = await Result.findOne({ roll: rollUpper, quizId });
  if (existing) {
    return res.status(200).json({ success: true, result: existing, totalQuestions: (existing.totalQuestions || 0), message: 'Already submitted' });
  }

  const answersMap = Array.isArray(answers) 
    ? answers.reduce((acc, a) => { if (a?.questionId) acc[a.questionId] = a.selected || null; return acc; }, {}) 
    : (answers || {});

  const submissionTime = Date.now();
  const startTimeMs = quiz.startedAt.getTime();
  const durationMs = (quiz.duration || 15) * 60 * 1000;
  const endTimeMs = startTimeMs + durationMs;

  const remainingSeconds = Math.max(0, Math.floor((endTimeMs - submissionTime) / 1000));
  const timeTakenSeconds = Math.round((submissionTime - startTimeMs) / 1000);

  const { correctCount, wrongCount, totalCount } = await calculateScore(answersMap);
  // Fairness Guard: If no correct answers, total score is 0 regardless of speed.
  // We use a 1000x multiplier so that even 1 correct answer (1000 pts) 
  // beats 0 correct answers with max speed bonus (~900 pts).
  const finalScore = correctCount > 0 ? (correctCount * 1000) + remainingSeconds : 0;

  const result = await Result.create({
    name,
    roll: rollUpper,
    quizId,
    score: finalScore,
    correctAnswers: correctCount,
    wrongAnswers: wrongCount,
    totalQuestions: totalCount,
    timeTaken: Math.min(timeTakenSeconds, (quiz.duration * 60)),
    remainingTime: remainingSeconds,
    submittedAt: new Date(submissionTime),
  });

  await Promise.all([
    Attempt.deleteOne({ roll: rollUpper, quizId }),
    Participant.deleteOne({ roll: rollUpper, quizId })
  ]);

  // Notify admin room of a submission (for real-time checkmarks)
  getIO().to(`ADMIN_${quizId}`).emit('participantSubmitted', { roll: rollUpper });

  const { throttledBroadcastLeaderboard } = require('../utils/broadcastUtils');
  throttledBroadcastLeaderboard(quizId);

  res.status(201).json({ success: true, result, totalQuestions: totalCount });
});
