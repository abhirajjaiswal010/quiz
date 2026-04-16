import { useState, useEffect, React } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Brain, Timer, Lightbulb, 
  PenSquare, Target, Rocket, GraduationCap, 
  Zap, Flame, FlaskConical, Gamepad2 
} from 'lucide-react';
import * as ReactModule from 'react';

export default function WelcomePreloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [iconIndex, setIconIndex] = useState(0);

  const icons = [
    { Icon: BookOpen, color: 'text-blue-400' },
    { Icon: Brain, color: 'text-purple-400' },
    { Icon: Timer, color: 'text-yellow-400' },
    { Icon: Lightbulb, color: 'text-amber-300' },
    { Icon: PenSquare, color: 'text-emerald-400' },
    { Icon: Target, color: 'text-red-400' },
    { Icon: Rocket, color: 'text-orange-400' },
    { Icon: GraduationCap, color: 'text-indigo-400' },
    { Icon: Zap, color: 'text-yellow-300' },
    { Icon: Flame, color: 'text-orange-500' },
    { Icon: FlaskConical, color: 'text-pink-400' },
    { Icon: Gamepad2, color: 'text-cyan-400' }
  ];

  // Cycle icons rapidly for a techy dynamic effect
  useEffect(() => {
    const iconTimer = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % icons.length);
    }, 1000); 
    return () => clearInterval(iconTimer);
  }, [icons.length]);

  // Animate the counter from 0 to 100 smoothly
  useEffect(() => {
    let current = 0;
    const duration = 5000; // 5 seconds loading
    const intervalTime = 30;
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= 100) {
        clearInterval(timer);
        setProgress(100);
        setTimeout(() => {
          onComplete(); 
        }, 800); 
      } else {
        setProgress(Math.floor(current));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  const CurrentIcon = icons[iconIndex].Icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0F0F0F]"
      >
        <div className="relative flex flex-col items-center">
          
          {/* Animated Icon Container */}
          <div className="w-48 h-48 mb-6 relative flex items-center justify-center">
            {/* Subtle rotating glow ring */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-white/5 border-t-white/20"
            />
            
            <AnimatePresence mode="popLayout">
              <motion.div
                key={iconIndex}
                initial={{ opacity: 0, scale: 0.2, rotate: -45, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.8, rotate: 45, filter: 'blur(10px)' }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="absolute"
              >
                <CurrentIcon size={84} strokeWidth={1.5} className={icons[iconIndex].color} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Welcome Text */}
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl md:text-3xl font-bold text-white tracking-widest uppercase mb-1"
            >
              Innovixus <span className="text-white/40">Quiz</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[10px] text-white/20 uppercase tracking-[0.6em] font-medium mb-12"
            >
              Initializing Secure Environment
            </motion.p>
          </div>

          {/* Progress Counter & Modern Bar */}
          <div className="flex flex-col items-center w-72">
            <div className="flex justify-between items-end w-full mb-3 px-1">
               <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Process State</span>
               <motion.span 
                 className="text-white text-3xl font-light font-mono"
               >
                 {progress}%
               </motion.span>
            </div>
            
            <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden relative border-none outline-none">
              <motion.div 
                className="h-full bg-white relative z-10 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="mt-4 flex gap-1">
               {[...Array(5)].map((_, i) => (
                 <motion.div 
                   key={i}
                   animate={{ opacity: [0.2, 1, 0.2] }}
                   transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                   className="w-1 h-1 rounded-full bg-white/20"
                 />
               ))}
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
