const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const studentController = require('../controllers/studentController');
const questionController = require('../controllers/questionController');
const leaderboardController = require('../controllers/leaderboardController');
const adminOnly = require('../middleware/adminOnly');

// ─── ADMIN APIs (Quiz Lifecycle & History) ──────────────────────────────────
router.post('/create-quiz', adminOnly, adminController.createQuiz);
router.post('/start-quiz', adminOnly, adminController.startQuiz);
router.post('/stop-quiz', adminOnly, adminController.stopQuiz);
router.get('/admin/verify', adminOnly, adminController.verifyAdmin);
router.get('/admin/quizzes', adminOnly, adminController.getAllQuizzes);
router.delete('/admin/quizzes/:quizId', adminOnly, adminController.deleteQuiz);

// ─── ADMIN APIs (Question Master) ───────────────────────────────────────────
router.get('/admin/questions', adminOnly, questionController.getAdminQuestions);
router.post('/admin/questions', adminOnly, questionController.addQuestion);
router.post('/admin/questions/upload', adminOnly, questionController.uploadQuestions);
router.put('/admin/questions/:id', adminOnly, questionController.updateQuestion);
router.delete('/admin/questions/:id', adminOnly, questionController.deleteQuestion);

// ─── STUDENT APIs ───────────────────────────────────────────────────────────
router.post('/join-quiz', studentController.joinQuiz);
router.post('/save-progress', studentController.saveProgress);
router.get('/quiz-status', adminController.getQuizStatus); // Shared status polling
router.get('/questions', studentController.getQuestions);
router.post('/submit', studentController.submitQuiz);
router.get('/leaderboard', leaderboardController.getLeaderboard);

module.exports = router;
