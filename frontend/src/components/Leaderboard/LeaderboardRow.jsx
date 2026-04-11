import React from 'react';
import { motion } from 'motion/react';
import RankBadge from './RankBadge';
import ScoreBar from './ScoreBar';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

/**
 * Individual Leaderboard Row component.
 * Memoized to prevent unnecessary re-renders in large participant pools (70+).
 */
const LeaderboardRow = React.memo(({ entry, student, rank, totalQuestions }) => {
  const isCurrentUser = entry.studentId === student?.studentId;
  
  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        opacity: { duration: 0.2 }
      }}
      className={`transition-colors duration-150 ${isCurrentUser
        ? 'bg-[#4FB3FF]/10 border-l-2 border-l-[#4FB3FF]'
        : 'hover:bg-slate-800/30'
        }`}
    >
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-center w-8">
          <RankBadge rank={rank} />
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
        ${isCurrentUser ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
            {entry.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-medium truncate ${isCurrentUser ? 'text-brand-300' : 'text-slate-200'}`}>
              {entry.name}
              {isCurrentUser && <span className="ml-1.5 text-xs text-brand-500">(You)</span>}
            </p>
            <p className="text-xs text-white font-medium truncate">{entry.studentId}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <ScoreBar 
          score={entry.score} 
          correct={entry.correctAnswers || 0} 
          total={entry.totalQuestions || totalQuestions || 0} 
        />
      </td>
      <td className="px-4 py-3.5 hidden md:table-cell text-slate-400 text-sm tabular-nums">
        {formatTime(entry.timeTaken)}
      </td>
    </motion.tr>
  );
});

LeaderboardRow.displayName = 'LeaderboardRow';

export default LeaderboardRow;
