import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function WelcomePreloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [emojiIndex, setEmojiIndex] = useState(0);
  const emojis = ['📚', '🧠', '⏳', '💡', '📝', '🎯', '🚀', '🎓'];

  // Cycle emojis rapidly for a live dynamic effect
  useEffect(() => {
    const emojiTimer = setInterval(() => {
      setEmojiIndex((prev) => (prev + 1) % emojis.length);
    }, 450); // Fast cycle
    return () => clearInterval(emojiTimer);
  }, [emojis.length]);

  // Animate the counter from 0 to 100 smoothly
  useEffect(() => {
    let current = 0;
    const duration = 4500; 
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
        }, 1200); 
      } else {
        setProgress(Math.floor(current));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0F0F0F]"
      >
        <div className="relative flex flex-col items-center">
          
          {/* Live Changing Emoji Effect */}
          <div className="w-48 h-48 mb-4 relative flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={emojiIndex}
                initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
                transition={{ duration: 0.3, type: 'spring' }}
                className="absolute text-8xl"
              >
                {emojis[emojiIndex]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Welcome Text */}
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-display font-black text-white tracking-tight mb-2"
          >
            Welcome to Innovixus Quiz
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400 text-sm md:text-base font-medium mb-8"
          >
            Preparing your secure assessment environment...
          </motion.p>

          {/* Progress Counter & Bar */}
          <div className="flex flex-col items-center w-64">
            <motion.span 
              className="text-white text-5xl font-black font-mono tracking-tighter mb-4"
            >
              {progress}<span className="text-2xl opacity-50">%</span>
            </motion.span>
            
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
