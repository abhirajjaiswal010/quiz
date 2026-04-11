const { getIO } = require('../socket');
const Result = require('../models/Result');

let debounceTimer = null;

/**
 * Throttled Leaderboard Broadcast.
 * Prevents the 'Broadcast Storm' when multiple students submit simultaneously.
 * Gathers submissions over a window and sends one bulk update.
 */
const throttledBroadcastLeaderboard = (quizId) => {
  if (debounceTimer) return; // Wait for the current window to close

  debounceTimer = setTimeout(async () => {
    try {
      const results = await Result.find({ quizId })
        .sort({ score: -1, correctAnswers: -1, timeTaken: 1 })
        .select('name studentId score correctAnswers totalQuestions timeTaken')
        .lean();
      
      const io = getIO();
      // Broadcast to all students in this quiz room
      io.to(quizId).emit('leaderboardUpdate', { results });
      // Also update the admin room
      io.to(`ADMIN_${quizId}`).emit('leaderboardUpdateAdmin', { results });
      
    } catch (err) {
      console.error('Leaderboard broadcast failed:', err);
    } finally {
      debounceTimer = null;
    }
  }, 2500); // 2.5 second aggregation window for 70+ students
};

module.exports = { throttledBroadcastLeaderboard };
