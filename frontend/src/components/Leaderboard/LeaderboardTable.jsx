import React from 'react';
import { Flag } from 'lucide-react';
import RankBadge from './RankBadge';
import ScoreBar from './ScoreBar';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

/**
 * Main Rankings Table Component.
 * Supports loading shimmers, error recovery, and empty states.
 * Highlights the current student with a custom layout and unique brand colors.
 */
const LeaderboardTable = ({ leaderboard, student, loading, error, totalQuestions, onRefresh }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card p-5 flex items-center gap-5 border-slate-800/50">
            <div className="w-10 h-10 rounded-full shimmer bg-slate-800/20" />
            <div className="flex-1 space-y-3">
              <div className="h-4 rounded-lg shimmer w-1/3 opacity-30 bg-slate-800/20" />
              <div className="h-3 rounded-lg shimmer w-1/5 opacity-10 bg-slate-800/20" />
            </div>
            <div className="h-6 rounded-lg shimmer w-20 opacity-20 bg-slate-800/20" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-10 text-center border-red-500/20">
        <p className="text-red-400 mb-6 font-medium">{error}</p>
        <button onClick={onRefresh} className="btn-primary mx-auto">Try Again</button>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="card p-20 text-center border-slate-800/50">
        <div className="flex justify-center mb-6 opacity-50">
          <Flag className="text-white" size={64} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Results Found</h3>
        <p className="text-slate-500">Wait for the quiz session to be stopped!</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">Rank</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {leaderboard.map((entry, idx) => {
              const isCurrentUser = entry.roll === student?.roll;
              const rank = idx + 1;
              return (
                <tr
                  key={entry.roll}
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
                        <p className="text-xs text-white font-medium truncate">{entry.roll}</p>
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTable;
