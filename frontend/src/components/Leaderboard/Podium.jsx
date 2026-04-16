import React from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';
import CountUp from '../CountUp';

const PodiumStep = ({ participant, rank, height, color, delay }) => {
  if (!participant) return null;

  const Icon = rank === 1 ? Crown : rank === 2 ? Trophy : Medal;
  
  return (
    <div 
      className={`relative flex flex-col items-center justify-end group animate-slide-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Participant Name & Score */}
      <div className="absolute -top-16 flex flex-col items-center w-full">
         <p className="text-white font-normal text-xs uppercase tracking-widest truncate max-w-[120px] mb-1">
           {participant.name}
         </p>
         <div className="text-[10px] text-white/40 font-mono font-normal">
           <CountUp to={participant.score} duration={2} /> pts
         </div>
      </div>

      {/* The Step */}
      <div 
        className="w-24 md:w-32 rounded-t-2xl border-x border-t transition-all duration-700 bg-white/5"
        style={{ 
          height: `${height}px`,
          borderColor: `${color}40`, // 40 is opacity in hex
          background: `linear-gradient(to top, ${color}10, transparent)`
        }}
      >
        <div className="h-full w-full flex flex-col items-center justify-start pt-6 gap-2">
            <div 
              className="p-3 rounded-full border shadow-2xl transition-transform duration-500 group-hover:scale-110"
              style={{ borderColor: color, backgroundColor: `${color}20` }}
            >
              <Icon size={24} style={{ color: color }} />
            </div>
            <span className="text-4xl font-normal  opacity-20" style={{ color: color }}>
              {rank}
            </span>
        </div>
      </div>
    </div>
  );
};

export default function Podium({ topThree }) {
  if (!topThree || topThree.length === 0) return null;

  // Reorder for visual podium: [2nd, 1st, 3rd]
  const displayOrder = [
    { p: topThree[1], rank: 2, height: 200, color: '#C0C0C0', delay: 200 }, // Silver
    { p: topThree[0], rank: 1, height: 300, color: '#FFD700', delay: 0 },   // Gold
    { p: topThree[2], rank: 3, height: 150, color: '#CD7F32', delay: 400 }, // Bronze
  ];

  return (
    <div className="w-full max-w-2xl mx-auto flex items-end justify-center gap-2 md:gap-4 mt-20 mb-12 h-[300px]">
      {displayOrder.map((item, idx) => (
        <PodiumStep 
          key={idx}
          participant={item.p}
          rank={item.rank}
          height={item.height}
          color={item.color}
          delay={item.delay}
        />
      ))}
    </div>
  );
}
