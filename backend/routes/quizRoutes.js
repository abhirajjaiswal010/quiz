const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const adminOnly = require('../middleware/adminOnly');

// ─── ADMIN APIs ─────────────────────────────────────────────────────────────
router.post('/create-quiz', adminOnly, quizController.createQuiz);
router.post('/start-quiz', adminOnly, quizController.startQuiz);
router.post('/stop-quiz', adminOnly, quizController.stopQuiz);

// Question Management (Admin)
router.get('/admin/verify', adminOnly, quizController.verifyAdmin);
router.get('/admin/questions', adminOnly, quizController.getAdminQuestions);
router.post('/admin/questions', adminOnly, quizController.addQuestion);
router.post('/admin/questions/upload', adminOnly, quizController.uploadQuestions);
router.put('/admin/questions/:id', adminOnly, quizController.updateQuestion);
router.delete('/admin/questions/:id', adminOnly, quizController.deleteQuestion);

// ─── STUDENT APIs ───────────────────────────────────────────────────────────
router.post('/join-quiz', quizController.joinQuiz);
router.post('/save-progress', quizController.saveProgress);
router.get('/quiz-status', quizController.getQuizStatus);
router.get('/questions', quizController.getQuestions);
router.post('/submit', quizController.submitQuiz);
router.get('/leaderboard', quizController.getLeaderboard);

module.exports = router;
