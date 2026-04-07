import React from 'react';
import { Trophy } from 'lucide-react';

/**
 * Visual badge for participant ranking.
 * Uses consistent Trophy icons for Top 3 and numeric badges for lower ranks.
 */
const RankBadge = ({ rank }) => {
  if (rank === 1) return <Trophy className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" size={24} />;
  if (rank === 2) return <Trophy className="text-slate-200 drop-shadow-[0_0_8px_rgba(226,232,240,0.4)]" size={22} />;
  if (rank === 3) return <Trophy className="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]" size={20} />;
  
  return (
    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 text-sm font-bold">
      {rank}
    </span>
  );
};

export default RankBadge;
