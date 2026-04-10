import React from 'react';
import CountUp from '../CountUp';

/**
 * Visual progress bar showing points and and correct/total ratio.
 */
const ScoreBar = ({ score, correct, total }) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-black text-[#4fb3ff] tabular-nums leading-none">
          <CountUp to={score} duration={1} />
        </span>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">pts</span>
      </div>
      <div className="flex items-center gap-1.5 mt-1">
         <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
              style={{ width: `${(correct/total) * 100}%` }}
            />
         </div>
         <span className="text-[10px] text-slate-500 font-medium">{correct}/{total}</span>
      </div>
    </div>
  );
};

export default ScoreBar;
