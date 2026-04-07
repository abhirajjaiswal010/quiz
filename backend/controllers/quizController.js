const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Participant = require('../models/Participant');
const Result = require('../models/Result');
const Attempt = require('../models/Attempt');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { getIO } = require('../socket');

// ─── HELPER: Calculate if quiz time has expired ─────────────────────────────
function isTimeExpired(quiz) {
  if (!quiz.startedAt) return false;
  const durationMs = (quiz.duration || 15) * 60 * 1000;
  return Date.now() > quiz.startedAt.getTime() + durationMs;
}

// ─── HELPER: Score calculation (reusable) ───────────────────────────────────
async function calculateScore(answersMap) {
  const questionsDB = await Question.find({});
  let correctCount = 0;
  let wrongCount = 0;

  const questionMap = {};
  questionsDB.forEach(q => { questionMap[q._id.toString()] = q.answer; });

  for (const [questionId, selected] of Object.entries(answersMap)) {
    if (selected) {
      if (questionMap[questionId] && selected === questionMap[questionId]) {
        correctCount += 1;
      } else {
        wrongCount += 1;
      }
    }
  }

  return { correctCount, wrongCount, totalCount: questionsDB.length };
}

// 1. Admin creates a quiz
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

// 2. Admin starts quiz
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

  // Broadcast: include startTime (epoch ms) so clients can self-compute remaining
  getIO().to(quizId).emit('quizStarted', {
    quizId,
    questions,
    duration: quiz.duration,
    startTime: startedAt.getTime(),       // ← epoch ms, clients calculate countdown locally
    allowTabSwitching: quiz.allowTabSwitching,
  });

  res.status(200).json({ success: true, isActive: true });
});

// 3. Admin stops quiz
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

// 4. Students join the quiz
// POST /api/join-quiz
// Returns quiz state so frontend can decide: waiting → quiz → leaderboard
exports.joinQuiz = asyncHandler(async (req, res, next) => {
  const { name, roll } = req.body;
  const quizId = req.body.quizId?.trim().toUpperCase();
  const rollUpper = roll?.trim().toUpperCase();

  if (!quizId || !name || !rollUpper) {
    return next(new ErrorResponse('name, roll, and quizId are required', 400));
  }

  // Validate quiz exists
  const quiz = await Quiz.findOne({ quizId });
  if (!quiz) return next(new ErrorResponse('Invalid quizId', 404));

  // Already submitted? Block re-entry
  const existingResult = await Result.findOne({ roll: rollUpper, quizId });
  if (existingResult) {
    return next(new ErrorResponse('You have already submitted this quiz', 400));
  }

  // ── Determine quiz state for this student ───────────────────────────────
  const timeExpired = isTimeExpired(quiz);

  // If quiz time has expired AND quiz is still marked active, auto-stop it
  // (edge case where admin forgot to stop)
  if (quiz.isActive && timeExpired) {
    // Don't modify quiz state here – let admin control it – just report expired
    return res.status(200).json({
      success: true,
      quizState: 'expired',
      message: 'Quiz time has already ended.',
    });
  }

  // ── Register participant (idempotent) ────────────────────────────────────
  const existingParticipant = await Participant.findOne({ roll: rollUpper, quizId });
  if (!existingParticipant) {
    await Participant.create({ name, roll: rollUpper, quizId });
  }

  // ── Check for existing in-progress attempt (reconnection) ────────────────
  const existingAttempt = await Attempt.findOne({ roll: rollUpper, quizId });

  if (quiz.isActive && !timeExpired) {
    // Quiz is running — student is either late joiner or reconnecting
    const questions = await Question.find({}, { answer: 0 });

    // Create or retrieve attempt
    if (!existingAttempt) {
      await Attempt.create({ roll: rollUpper, quizId, name, answers: {} });
    }

    // Notify admin of count update
    const participantCount = await Participant.countDocuments({ quizId });
    getIO().to(`ADMIN_${quizId}`).emit('participantJoined', {
      participantCount,
      name,
      roll: rollUpper,
    });

    // Return full quiz info so client can self-start immediately
    return res.status(200).json({
      success: true,
      quizState: 'active',
      startTime: quiz.startedAt.getTime(),  // epoch ms
      duration: quiz.duration,              // minutes
      questions,
      allowTabSwitching: quiz.allowTabSwitching,
      // Restore previous answers if reconnecting
      savedAnswers: existingAttempt ? Object.fromEntries(existingAttempt.answers) : {},
    });
  }

  // Quiz not yet started (waiting room)
  const participantCount = await Participant.countDocuments({ quizId });
  if (!existingParticipant) {
    getIO().to(`ADMIN_${quizId}`).emit('participantJoined', {
      participantCount,
      name,
      roll: rollUpper,
    });
  }

  return res.status(200).json({
    success: true,
    quizState: 'waiting',
    message: 'Joined successfully. Waiting for quiz to start.',
  });
});

// 5. Save partial answers (called on each answer selection for reconnect support)
// POST /api/save-progress
exports.saveProgress = asyncHandler(async (req, res, next) => {
  const { roll, answers } = req.body;
  const quizId = req.body.quizId?.trim().toUpperCase();
  const rollUpper = roll?.trim().toUpperCase();

  if (!quizId || !rollUpper || !answers) {
    return next(new ErrorResponse('roll, quizId, and answers are required', 400));
  }

  // Verify quiz is still active
  const quiz = await Quiz.findOne({ quizId });
  if (!quiz || !quiz.isActive) {
    return res.status(200).json({ success: true, message: 'Quiz not active, progress not saved' });
  }

  // Don't save if already submitted
  const alreadySubmitted = await Result.findOne({ roll: rollUpper, quizId });
  if (alreadySubmitted) {
    return res.status(200).json({ success: true, message: 'Already submitted' });
  }

  // Upsert answers
  await Attempt.findOneAndUpdate(
    { roll: rollUpper, quizId },
    { $set: { answers } },
    { new: true, upsert: true }
  );

  res.status(200).json({ success: true });
});

// 6. Get quiz status (admin + polling fallback)
// GET /api/quiz-status?quizId=
exports.getQuizStatus = asyncHandler(async (req, res, next) => {
  const quizId = req.query.quizId?.trim().toUpperCase();
  const quiz = await Quiz.findOne({ quizId });
  if (!quiz) return next(new ErrorResponse('Quiz not found', 404));

  // Active participants (currently in waiting or quiz)
  const activeParticipants = await Participant.find({ quizId }).select('name roll joinedAt').sort({ joinedAt: -1 });
  const participantCount = activeParticipants.length;

  // Submitted participants (results)
  const submittedResults = await Result.find({ quizId }).select('name roll createdAt').sort({ createdAt: -1 });

  // Combine for the "Total ever joined" list to show in Admin Panel
  // We map results to look like participants
  const submittedParticipants = submittedResults.map(r => ({
    name: r.name,
    roll: r.roll,
    joinedAt: r.createdAt,
    isSubmitted: true
  }));

  // Merge and sort by time
  const allParticipants = [...activeParticipants, ...submittedParticipants].sort((a, b) => 
    new Date(b.joinedAt) - new Date(a.joinedAt)
  );

  const totalQuestions = await Question.countDocuments();

  res.status(200).json({
    success: true,
    isActive: quiz.isActive,
    participantCount,
    participants: allParticipants,
    totalQuestions,
    createdAt: quiz.createdAt,
    startTime: quiz.startedAt ? quiz.startedAt.getTime() : null,
    quizDetails: quiz,
  });
});

// 7. Fetch questions (Only when isActive = true)
// GET /api/questions?quizId=
exports.getQuestions = asyncHandler(async (req, res, next) => {
  const quizId = req.query.quizId?.trim().toUpperCase();
  const quiz = await Quiz.findOne({ quizId });

  if (!quiz) return next(new ErrorResponse('Quiz not found', 404));
  if (!quiz.isActive) return next(new ErrorResponse('Quiz is not active yet', 403));

  const questions = await Question.find({}, { answer: 0 });
  res.status(200).json({
    success: true,
    questions,
    startTime: quiz.startedAt ? quiz.startedAt.getTime() : null,
    duration: quiz.duration,
    allowTabSwitching: quiz.allowTabSwitching,
  });
});

// 8. Submit quiz
// POST /api/submit
exports.submitQuiz = asyncHandler(async (req, res, next) => {
  const { name, roll, answers, timeTaken } = req.body;
  const quizId = req.body.quizId?.trim().toUpperCase();
  const rollUpper = roll?.trim().toUpperCase();

  const quiz = await Quiz.findOne({ quizId });
  if (!quiz) return next(new ErrorResponse('Quiz not found', 404));

  // Allow submission even if quiz.isActive is false (time expired edge case)
  // But validate quiz actually existed / started
  if (!quiz.startedAt) {
    return next(new ErrorResponse('Quiz has not been started', 403));
  }

  // Prevent double submission (idempotent)
  const existing = await Result.findOne({ roll: rollUpper, quizId });
  if (existing) {
    console.log('IDEMPOTENCY: Student already submitted:', rollUpper);
    return res.status(200).json({
      success: true,
      result: existing,
      totalQuestions: (existing.totalQuestions || 0),
      message: 'Already submitted',
    });
  }

  // Calculate score on backend from answers provided
  const answersMap = {};
  if (Array.isArray(answers)) {
    answers.forEach(a => { if (a?.questionId) answersMap[a.questionId] = a.selected || null; });
  } else if (answers && typeof answers === 'object') {
    Object.assign(answersMap, answers);
  }

  // ── SERVER-SIDE TIMING CALCULATIONS ──
  const submissionTime = Date.now();
  const startTimeMs = quiz.startedAt.getTime();
  const durationMs = (quiz.duration || 15) * 60 * 1000;
  const endTimeMs = startTimeMs + durationMs;

  const remainingTimeMs = Math.max(0, endTimeMs - submissionTime);
  const remainingTimeSeconds = Math.floor(remainingTimeMs / 1000);
  const timeTakenSeconds = Math.round((submissionTime - startTimeMs) / 1000);

  // Calculate Accuracy
  const { correctCount, wrongCount, totalCount } = await calculateScore(answersMap);
  console.log('Backend Trace - After Score Calc:', { correctCount, totalCount });

  // FINAL SCORE FORMULA: (Correct * 100) + Speed Bonus (remaining seconds)
  // If time's up, speed bonus is 0.
  const finalScore = (correctCount * 100) + remainingTimeSeconds;

  const result = await Result.create({
    name,
    roll: rollUpper,
    quizId,
    score: finalScore,
    correctAnswers: correctCount,
    wrongAnswers: wrongCount,
    totalQuestions: totalCount,
    timeTaken: Math.min(timeTakenSeconds, (quiz.duration * 60)),
    remainingTime: remainingTimeSeconds,
    submittedAt: new Date(submissionTime),
  });

  // Clean up attempt and participant
  await Attempt.deleteOne({ roll: rollUpper, quizId });
  await Participant.deleteOne({ roll: rollUpper, quizId });

  // Live leaderboard + admin update
  // Sorting: Score DESC, Correct DESC, TimeTaken ASC
  const results = await Result.find({ quizId }).sort({ score: -1, correctAnswers: -1, timeTaken: 1 });
  const participantCount = await Participant.countDocuments({ quizId });

  const io = getIO();
  io.to(`ADMIN_${quizId}`).emit('resultSubmitted', { results, participantCount });
  io.to(quizId).emit('leaderboardUpdate', { results });

  console.log('Backend Trace - Success Result:', result.roll);
  res.status(201).json({ success: true, result, totalQuestions: totalCount });
});

// 10. Update Questions (Batch via JSON)
// POST /api/upload-questions
exports.uploadQuestions = asyncHandler(async (req, res, next) => {
  const { questions } = req.body;

  if (!Array.isArray(questions)) {
    return next(new ErrorResponse('Please provide an array of questions', 400));
  }

  // Basic validation
  for (const q of questions) {
    if (!q.question || !q.options || q.options.length !== 4 || !q.answer) {
       return next(new ErrorResponse(`Invalid question format: ${q.question || 'unknown'}`, 400));
    }
    if (!q.options.includes(q.answer)) {
       return next(new ErrorResponse(`Answer must be one of the 4 options: ${q.question}`, 400));
    }
  }

  // Bulk operation: CLEAR and INSERT
  await Question.deleteMany({});
  const newQuestions = await Question.insertMany(questions);

  res.status(200).json({ 
    success: true, 
    count: newQuestions.length,
    message: `${newQuestions.length} questions uploaded successfully!` 
  });
});


// 9. Leaderboard
// GET /api/leaderboard?quizId=
exports.getLeaderboard = asyncHandler(async (req, res, next) => {
  const quizId = req.query.quizId?.trim().toUpperCase();
  const quiz = await Quiz.findOne({ quizId });

  if (!quiz) return next(new ErrorResponse('Quiz not found', 404));

  const [results, totalQuestions] = await Promise.all([
    Result.find({ quizId }).sort({ score: -1, correctAnswers: -1, timeTaken: 1 }),
    Question.countDocuments(),
  ]);
  res.status(200).json({ success: true, results, totalQuestions });
});

// 10. Admin question management
exports.getAdminQuestions = asyncHandler(async (req, res, next) => {
  const questions = await Question.find({});
  res.status(200).json({ success: true, count: questions.length, questions });
});

exports.addQuestion = asyncHandler(async (req, res, next) => {
  const { question, options, answer } = req.body;
  const newQuestion = await Question.create({ question, options, answer });
  res.status(201).json({ success: true, question: newQuestion });
});

exports.updateQuestion = asyncHandler(async (req, res, next) => {
  const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!question) return next(new ErrorResponse('Question not found', 404));
  res.status(200).json({ success: true, question });
});

exports.deleteQuestion = asyncHandler(async (req, res, next) => {
  const question = await Question.findByIdAndDelete(req.params.id);
  if (!question) return next(new ErrorResponse('Question not found', 404));
  res.status(200).json({ success: true, message: 'Question deleted' });
});

exports.verifyAdmin = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, message: 'Authorized' });
});

exports.getAllQuizzes = asyncHandler(async (req, res, next) => {
  const quizzes = await Quiz.find({}).sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: quizzes.length, quizzes });
});

exports.deleteQuiz = asyncHandler(async (req, res, next) => {
  const { quizId } = req.params;
  const normalizedId = quizId.trim().toUpperCase();

  const quiz = await Quiz.findOne({ quizId: normalizedId });
  if (!quiz) return next(new ErrorResponse('Quiz not found', 404));

  // 1. Delete associated data
  await Promise.all([
    Quiz.deleteOne({ quizId: normalizedId }),
    Result.deleteMany({ quizId: normalizedId }),
    Participant.deleteMany({ quizId: normalizedId }),
    Attempt.deleteMany({ quizId: normalizedId }),
  ]);

  res.status(200).json({ success: true, message: `Quiz session ${normalizedId} and all associated results deleted.` });
});
