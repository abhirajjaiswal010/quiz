import React, { useState, useEffect } from 'react';
import Beams from '../beams';

const StatusMessages = [
  "Calibrating secure environment...",
  "Synchronizing session tokens...",
  "Injecting randomized vault...",
  "Hardening anti-cheat layers...",
  "Preparing neuro-sync...",
];

export default function QuizIntro({ onComplete }) {
  const [count, setCount] = useState(3);
  const [isExiting, setIsExiting] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    // 💡 Dev Mode: Prevents vanishing while you are editing the UI
    if (localStorage.getItem('debug_intro') === 'true') {
      setCount(3);
      return;
    }

    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
        setMsgIndex(prev => (prev + 1) % StatusMessages.length);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 800);
      }, 1000);
      return () => clearTimeout(exitTimer);
    }
  }, [count, onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] overflow-hidden transition-all duration-1000 ease-in-out ${isExiting ? 'opacity-0 scale-110' : 'opacity-100'}`}>
      
      {/* Dynamic Grid Background */}
      
     <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
        <Beams
          beamWidth={3}
          beamHeight={30}
          beamNumber={20}
          lightColor="#55b4dd"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={30}
        />
      </div>
      
      {/* Floating Orbs */}
    

      <div className="relative z-10 flex flex-col items-center">
        
        {/* Animated Countdown Container */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          
          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="128" cy="128" r="100" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" />
            <circle
              cx="128"
              cy="128"
              r="100"
              stroke="url(#quiz-grad)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="628"
              strokeDashoffset={628 - (628 * (count / 3))}
              className="transition-all duration-1000 ease-linear"
              style={{ filter: 'drop-shadow(0 0 15px rgba(79, 179, 255, 0.5))' }}
            />
            <defs>
              <linearGradient id="quiz-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4FB3FF" />
                <stop offset="100%" stopColor="#818CF8" />
              </linearGradient>
            </defs>
          </svg>

          {/* Central Number */}
          <div key={count} className="animate-reveal-text flex flex-col items-center">
             <span className={`text-[120px]  tracking-tighter leading-none transition-colors duration-500 ${count === 0 ? 'text-emerald-400' : 'text-white'}`}>
                {count > 0 ? count : 'GO'}
             </span>
             {count === 0 && (
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-emerald-400/20 blur-3xl animate-ping" />
               </div>
             )}
          </div>
        </div>

        {/* Status Line */}
        <div className="mt-16 flex flex-col items-center gap-10">
          <div className="flex gap-2">
            {[3, 2, 1, 0].map(i => (
              <div key={i} className={`h-1 rounded-full transition-all duration-500 ${count <= i ? 'w-8 bg-[#4FB3FF] shadow-[0_0_10px_#4FB3FF44]' : 'w-4 bg-white/5'}`} />
            ))}
          </div>
          <p className="text-md font-bold  uppercase tracking-[0.5em] text-[#4FB3FF] animate-pulse">
            {StatusMessages[msgIndex]}
          </p>
        </div>
      </div>

     
      

     
    </div>
  );
}
