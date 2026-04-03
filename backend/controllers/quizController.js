const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Participant = require('../models/Participant');
const Result = require('../models/Result');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// 1. Admin creates a quiz and generates a unique quizId
// POST /api/create-quiz
exports.createQuiz = asyncHandler(async (req, res, next) => {
  const { quizId } = req.body;
  if (!quizId) return next(new ErrorResponse('quizId is required', 400));

  const existing = await Quiz.findOne({ quizId });
  if (existing) return next(new ErrorResponse('quizId already exists', 400));

  const quiz = await Quiz.create({ quizId, isActive: false });
  res.status(201).json({ success: true, quiz });
});

// 2. Admin starts quiz
// POST /api/start-quiz
exports.startQuiz = asyncHandler(async (req, res, next) => {
  const { quizId } = req.body;
  const quiz = await Quiz.findOneAndUpdate({ quizId }, { isActive: true }, { new: true });
  if (!quiz) return next(new ErrorResponse('Quiz not found', 404));
  res.status(200).json({ success: true, isActive: true });
});

// 3. Admin stops quiz
// POST /api/stop-quiz
exports.stopQuiz = asyncHandler(async (req, res, next) => {
  const { quizId } = req.body;
  const quiz = await Quiz.findOneAndUpdate({ quizId }, { isActive: false }, { new: true });
  if (!quiz) return next(new ErrorResponse('Quiz not found', 404));
  res.status(200).json({ success: true, isActive: false });
});

// 4. Students join the quiz
// POST /api/join-quiz
exports.joinQuiz = asyncHandler(async (req, res, next) => {
  const { name, roll, quizId } = req.body;

  // Validate quizId exists
  const quiz = await Quiz.findOne({ quizId });
  if (!quiz) return next(new ErrorResponse('Invalid quizId', 404));

  // Check duplicate using (roll + quizId)
  const existingResult = await Result.findOne({ roll: roll.toUpperCase(), quizId });
  if (existingResult) return next(new ErrorResponse('You have already submitted this quiz', 400));

  const existingParticipant = await Participant.findOne({ roll: roll.toUpperCase(), quizId });
  if (existingParticipant) {
     return res.status(200).json({ success: true, message: 'Already joined' });
  }

  await Participant.create({ name, roll: roll.toUpperCase(), quizId });
  res.status(200).json({ success: true, message: 'Joined successfully' });
});

// 5. Get quiz status (polling)
// GET /api/quiz-status?quizId=
exports.getQuizStatus = asyncHandler(async (req, res, next) => {
  const { quizId } = req.query;
  const quiz = await Quiz.findOne({ quizId });
  if (!quiz) return next(new ErrorResponse('Quiz not found', 404));

  const participantCount = await Participant.countDocuments({ quizId });
  res.status(200).json({ success: true, isActive: quiz.isActive, participantCount });
});

// 6. Fetch questions (Only when isActive = true)
// GET /api/questions?quizId=
exports.getQuestions = asyncHandler(async (req, res, next) => {
  const { quizId } = req.query;
  const quiz = await Quiz.findOne({ quizId });
  
  if (!quiz) return next(new ErrorResponse('Quiz not found', 404));
  if (!quiz.isActive) return next(new ErrorResponse('Quiz is not active yet', 403));

  const questions = await Question.find({}, { answer: 0 }); // Assuming global questions for now, or quiz.questions
  res.status(200).json({ success: true, questions });
});

// 7. Submit quiz
// POST /api/submit
exports.submitQuiz = asyncHandler(async (req, res, next) => {
  const { name, roll, quizId, answers, timeTaken } = req.body;

  const quiz = await Quiz.findOne({ quizId });
  if (!quiz || !quiz.isActive) return next(new ErrorResponse('Quiz is not active', 403));

  // Check duplicate
  const existing = await Result.findOne({ roll: roll.toUpperCase(), quizId });
  if (existing) return next(new ErrorResponse('One attempt per roll per quiz allowed', 400));

  // Calculate score on backend
  const questionsDB = await Question.find({});
  let score = 0;
  
  const questionMap = {};
  questionsDB.forEach(q => { questionMap[q._id.toString()] = q.answer; });

  if (Array.isArray(answers)) {
    answers.forEach(ans => {
      if (ans && ans.questionId && questionMap[ans.questionId]) {
        if (ans.selected === questionMap[ans.questionId]) {
          score += 1;
        }
      }
    });
  }

  const result = await Result.create({
    name,
    roll: roll.toUpperCase(),
    quizId,
    score,
    timeTaken
  });

  // Remove from participants
  await Participant.deleteOne({ roll: roll.toUpperCase(), quizId });

  res.status(201).json({ success: true, result, totalQuestions: questionsDB.length });
});

// 8. Leaderboard (only after quiz ends)
// GET /api/leaderboard?quizId=
exports.getLeaderboard = asyncHandler(async (req, res, next) => {
  const { quizId } = req.query;
  const quiz = await Quiz.findOne({ quizId });

  if (!quiz) return next(new ErrorResponse('Quiz not found', 404));
  if (quiz.isActive) return next(new ErrorResponse('Leaderboard only visible after quiz ends', 403));

  const [results, totalQuestions] = await Promise.all([
    Result.find({ quizId }).sort({ score: -1, timeTaken: 1 }),
    Question.countDocuments(),
  ]);
  res.status(200).json({ success: true, results, totalQuestions });
});

// 9. Admin question management
// GET /api/admin/questions
exports.getAdminQuestions = asyncHandler(async (req, res, next) => {
  const questions = await Question.find({});
  res.status(200).json({ success: true, count: questions.length, questions });
});

// POST /api/admin/questions
exports.addQuestion = asyncHandler(async (req, res, next) => {
  const { question, options, answer } = req.body;
  const newQuestion = await Question.create({ question, options, answer });
  res.status(201).json({ success: true, question: newQuestion });
});

// PUT /api/admin/questions/:id
exports.updateQuestion = asyncHandler(async (req, res, next) => {
  const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!question) return next(new ErrorResponse('Question not found', 404));
  res.status(200).json({ success: true, question });
});

// DELETE /api/admin/questions/:id
exports.deleteQuestion = asyncHandler(async (req, res, next) => {
  const question = await Question.findByIdAndDelete(req.params.id);
  if (!question) return next(new ErrorResponse('Question not found', 404));
  res.status(200).json({ success: true, message: 'Question deleted' });
});

// 10. Verify Admin Key
// GET /api/admin/verify
exports.verifyAdmin = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, message: 'Authorized' });
});
