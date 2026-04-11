const Question = require('../models/Question');

/**
 * Checks if the quiz session has exceeded its allotted time.
 * @param {Object} quiz - The Quiz document.
 * @returns {Boolean}
 */
const isTimeExpired = (quiz) => {
  if (!quiz.startedAt) return false;
  const durationMs = (quiz.duration || 15) * 60 * 1000;
  return Date.now() > quiz.startedAt.getTime() + durationMs;
};

/**
 * Server-side Cache for Questions
 * Avoids hitting the DB for every single student submission.
 */
let cachedQuestions = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 Hour

const getCachedQuestions = async () => {
  const now = Date.now();
  if (!cachedQuestions || (now - lastCacheUpdate) > CACHE_TTL) {
    console.log('📦 Refreshing Questions Cache...');
    const questions = await Question.find({});
    cachedQuestions = questions.reduce((acc, q) => {
      acc[q._id.toString()] = q.answer;
      return acc;
    }, {});
    cachedQuestions._totalCount = questions.length;
    lastCacheUpdate = now;
  }
  return cachedQuestions;
};

/**
 * Standardized score calculation for student submissions.
 */
const calculateScore = async (answersMap) => {
  const questionMap = await getCachedQuestions();
  let correctCount = 0;
  let wrongCount = 0;

  for (const [questionId, selected] of Object.entries(answersMap)) {
    if (selected) {
      if (questionMap[questionId] && selected === questionMap[questionId]) {
        correctCount += 1;
      } else {
        wrongCount += 1;
      }
    }
  }

  return { 
    correctCount, 
    wrongCount, 
    totalCount: questionMap._totalCount 
  };
};

/**
 * Manual cache clearing (call when questions are edited)
 */
const clearQuestionCache = () => {
  cachedQuestions = null;
  lastCacheUpdate = 0;
};

module.exports = {
  isTimeExpired,
  calculateScore,
  clearQuestionCache
};
