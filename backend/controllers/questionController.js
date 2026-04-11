const Question = require('../models/Question');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { clearQuestionCache } = require('../utils/quizUtils');

// Fetch all questions for admin management
exports.getAdminQuestions = asyncHandler(async (req, res, next) => {
  const questions = await Question.find({});
  res.status(200).json({ success: true, count: questions.length, questions });
});

// Single question management
exports.addQuestion = asyncHandler(async (req, res, next) => {
  const { question, options, answer } = req.body;
  const newQuestion = await Question.create({ question, options, answer });
  clearQuestionCache();
  res.status(201).json({ success: true, question: newQuestion });
});

exports.updateQuestion = asyncHandler(async (req, res, next) => {
  const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!question) return next(new ErrorResponse('Question not found', 404));
  clearQuestionCache();
  res.status(200).json({ success: true, question });
});

exports.deleteQuestion = asyncHandler(async (req, res, next) => {
  const question = await Question.findByIdAndDelete(req.params.id);
  if (!question) return next(new ErrorResponse('Question not found', 404));
  clearQuestionCache();
  res.status(200).json({ success: true, message: 'Deleted' });
});

// Bulk upload questions via JSON
exports.uploadQuestions = asyncHandler(async (req, res, next) => {
  const { questions } = req.body;

  if (!Array.isArray(questions)) {
    return next(new ErrorResponse('Please provide an array of questions', 400));
  }

  // Basic validation - 4 options and answer must exist among those options
  for (const q of questions) {
    if (!q.question || !q.options || q.options.length !== 4 || !q.answer) {
       return next(new ErrorResponse(`Invalid format for question: ${q.question || 'unknown'}`, 400));
    }
    if (!q.options.includes(q.answer)) {
       return next(new ErrorResponse(`Answer must be one of the four options: ${q.question}`, 400));
    }
  }

  // Atomically swap questions
  await Question.deleteMany({});
  const newQuestions = await Question.insertMany(questions);
  clearQuestionCache();

  res.status(200).json({ 
    success: true, 
    count: newQuestions.length,
    message: `${newQuestions.length} questions uploaded successfully!` 
  });
});
