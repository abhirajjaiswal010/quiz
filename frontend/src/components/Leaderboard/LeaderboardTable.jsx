import React from 'react';
import { Flag } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import LeaderboardRow from './LeaderboardRow';

/**
 * Main Rankings Table Component.
 * Supports loading shimmers, error recovery, and empty states.
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
        <p className="text-red-400 mb-6 font-normal">{error}</p>
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
        <h3 className="text-xl font-normal text-white mb-2">No Results Found</h3>
        <p className="text-slate-500">Wait for the quiz session to be stopped!</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto overflow-y-hidden custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-4 py-3 text-xs font-normal text-slate-500 uppercase tracking-wider w-16">Rank</th>
              <th className="text-left px-4 py-3 text-xs font-normal text-slate-500 uppercase tracking-wider">Student</th>
              <th className="text-left px-4 py-3 text-xs font-normal text-slate-500 uppercase tracking-wider">Score</th>
              <th className="text-left px-4 py-3 text-xs font-normal text-slate-500 uppercase tracking-wider hidden md:table-cell">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            <AnimatePresence initial={false}>
              {leaderboard.map((entry, idx) => (
                <LeaderboardRow 
                  key={entry.studentId || idx} 
                  entry={entry} 
                  student={student} 
                  rank={idx + 1} 
                  totalQuestions={totalQuestions} 
                />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTable;
