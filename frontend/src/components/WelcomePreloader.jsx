import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Lottie from 'lottie-react';

export default function WelcomePreloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [emojiIndex, setEmojiIndex] = useState(0);
  const [animations, setAnimations] = useState({});

  // Noto Emoji Lottie Codes
  const emojiCodes = [
    '1f4da', // 📚
    '1f9e0', // 🧠
    '23f3',  // ⏳
    '1f4a1', // 💡
    '1f4dd', // 📝
    '1f3af', // 🎯
    '1f680', // 🚀
    '1f393', // 🎓
    '26a1',  // ⚡
    '1f525', // 🔥
    '1f9ea', // 🧪
    '1f47e'  // 👾
  ];

  const staticEmojis = ['📚', '🧠', '⏳', '💡', '📝', '🎯', '🚀', '🎓', '⚡', '🔥', '🧪', '👾'];

  // Preload Lottie animations
  useEffect(() => {
    const fetchAnimations = async () => {
      const fetched = {};
      await Promise.all(
        emojiCodes.map(async (code) => {
          try {
            const response = await fetch(`https://fonts.gstatic.com/s/e/notoemoji/latest/${code}/lottie.json`);
            if (response.ok) {
              fetched[code] = await response.json();
            }
          } catch (error) {
            console.error(`Failed to load Lottie for ${code}:`, error);
          }
        })
      );
      setAnimations(fetched);
    };
    fetchAnimations();
  }, []);

  // Cycle emojis rapidly for a live dynamic effect
  useEffect(() => {
    const emojiTimer = setInterval(() => {
      setEmojiIndex((prev) => (prev + 1) % emojiCodes.length);
    }, 1200); // Slower cycle for better animation visibility
    return () => clearInterval(emojiTimer);
  }, [emojiCodes.length]);

  // Animate the counter from 0 to 100 smoothly
  useEffect(() => {
    let current = 0;
    const duration = 6000; // Increased duration to 6 seconds
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
                className="absolute w-32 h-32 flex items-center justify-center"
              >
                {animations[emojiCodes[emojiIndex]] ? (
                  <Lottie 
                    animationData={animations[emojiCodes[emojiIndex]]} 
                    loop={true}
                    className="w-full h-full"
                  />
                ) : (
                  <span className="text-8xl">{staticEmojis[emojiIndex]}</span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Welcome Text */}
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight mb-2"
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
              className="text-white text-5xl font-bold font-mono tracking-tighter mb-4"
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
