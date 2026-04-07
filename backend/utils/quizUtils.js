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
 * Standardized score calculation for student submissions.
 * @param {Object} answersMap - { questionId: selectedOption }
 * @returns {Object} { correctCount, wrongCount, totalCount }
 */
const calculateScore = async (answersMap) => {
  const questionsDB = await Question.find({});
  let correctCount = 0;
  let wrongCount = 0;

  const questionMap = questionsDB.reduce((acc, q) => {
    acc[q._id.toString()] = q.answer;
    return acc;
  }, {});

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
};

module.exports = {
  isTimeExpired,
  calculateScore,
};
