import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import CountUp from '../CountUp';

const StatusMessages = [
  { text: "Manifesting 100% accuracy...", code: "1f619" },
  { text: "Cooking the leaderboard...", code: "1f525" },
  { text: "Vibing with the quiz vault...", code: "1f60e" },
  { text: "Deleting all the brain rot...", code: "1f9d8" },
  { text: "Energy loading...", code: "1f680" },
];

const LottieEmoji = ({ code }) => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch(`https://fonts.gstatic.com/s/e/notoemoji/latest/${code}/lottie.json`)
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error("Lottie Load Error:", err));
  }, [code]);

  if (!animationData) return <div className="w-16 h-16" />;
  return (
    <div className="w-16 h-16 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
      <Lottie animationData={animationData} loop={true} />
    </div>
  );
};

const interpolateHex = (color1, color2, factor) => {
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);

  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);

  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));

  return `rgb(${r}, ${g}, ${b})`;
};

export default function QuizIntro({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const duration = 3000; // 3 seconds total
    const intervalTime = 50; 
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    const msgInterval = duration / StatusMessages.length;
    const msgTimer = setInterval(() => {
        setMsgIndex(prev => (prev + 1) % StatusMessages.length);
    }, msgInterval);

    return () => {
      clearInterval(timer);
      clearInterval(msgTimer);
    };
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 600);
      }, 600);
      return () => clearTimeout(exitTimer);
    }
  }, [progress, onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] overflow-hidden transition-all duration-700 ease-in-out ${isExiting ? 'opacity-0 scale-105' : 'opacity-100'}`}>
      
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Animated Countdown Container */}
        <div className="relative w-56 h-56 flex items-center justify-center">
          
          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="112" cy="112" r="90" stroke="rgba(255,255,255,0.05)" strokeWidth="2" fill="none" />
            <circle
              cx="112"
              cy="112"
              r="90"
              stroke="url(#quiz-grad)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="565"
              strokeDashoffset={565 - (565 * (progress / 100))}
              className="transition-all duration-75 ease-linear"
              style={{ filter: 'drop-shadow(0 0-15px rgba(79, 179, 255, 0.4))' }}
            />
            <defs>
              <linearGradient id="quiz-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={interpolateHex('#4FB3FF', '#10B981', progress / 100)} />
                <stop offset="100%" stopColor={interpolateHex('#818CF8', '#34D399', progress / 100)} />
              </linearGradient>
            </defs>
          </svg>

          {/* Central Number */}
          <div 
            className="flex flex-col items-center transition-colors duration-150"
            style={{ color: interpolateHex('#FFFFFF', '#10B981', progress / 100) }}
          >
             <div className="flex items-baseline ">
                <CountUp from={0} to={100} duration={3} className="text-[70px] font-bold tracking-tighter leading-none" />
                <span className="text-3xl font-medium opacity-60 ml-1"> %</span>
             </div>
             {progress >= 100 && (
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-emerald-400/15 blur-3xl animate-ping" />
               </div>
             )}
          </div>
        </div>

        {/* Status Line */}
        <div className="mt-12 flex flex-col items-center gap-8">
          <div className="flex gap-2">
            {[20, 40, 60, 80, 100].map(p => (
              <div key={p} className={`h-1 rounded-full transition-all duration-300 ${progress >= p ? 'w-8 bg-white shadow-[0_0_10px_white]' : 'w-4 bg-white/5'}`} />
            ))}
          </div>
          <div className="flex flex-col items-center gap-4">
             <LottieEmoji code={StatusMessages[msgIndex].code} />
             <p className="text-xs font-poppins uppercase tracking-[0.4em] text-white/80">
               {StatusMessages[msgIndex].text}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
