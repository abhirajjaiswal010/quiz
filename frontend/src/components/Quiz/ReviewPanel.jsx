import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Trophy, ArrowRight, Loader2, Timer } from 'lucide-react';

const renderQuestionContent = (text) => {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('```')) {
      const inner = part.slice(3, -3);
      const newlineIdx = inner.indexOf('\n');
      const lang = newlineIdx > 0 ? inner.slice(0, newlineIdx).trim() : '';
      const code = newlineIdx > 0 ? inner.slice(newlineIdx + 1) : inner;
      return (
        <div key={idx} className="my-2 rounded-lg overflow-hidden border border-white/5 bg-black/40">
          {lang && (
            <div className="px-3 py-1 bg-white/5 border-b border-white/5 text-[7px] uppercase tracking-wider text-white/30 font-mono">
              {lang}
            </div>
          )}
          <pre className="p-3 overflow-x-auto text-[11px] leading-relaxed m-0 custom-scrollbar">
            <code className="font-mono text-emerald-400/80 whitespace-pre">{code}</code>
          </pre>
        </div>
      );
    }
    return part ? <span key={idx} className="whitespace-pre-wrap">{part}</span> : null;
  });
};

const ReviewPanel = ({ questions, answers, result, onFinish }) => {
  const [showTopBtn, setShowTopBtn] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!result) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="animate-spin text-white/20" size={32} />
      <p className="text-white/40 text-sm uppercase tracking-widest">Generative Analysis...</p>
    </div>
  );

  const { score, correctAnswers, timeTaken } = result;

  // Sorting Logic: Reorder list based on status
  const [sortBy, setSortBy] = React.useState('default'); 

  const sortedQuestions = React.useMemo(() => {
    const list = [...questions];
    if (sortBy === 'default') return list;
    
    return list.sort((a, b) => {
      const qIdA = String(a._id);
      const qIdB = String(b._id);
      
      const getStatusRank = (id) => {
        const uA = answers[id];
        const cA = result.correctAnswersMap?.[id] || result.correctAnswers?.[id];
        if (!uA) return 3; 
        return (String(uA).trim() === String(cA).trim()) ? 1 : 2; 
      };

      const rankA = getStatusRank(qIdA);
      const rankB = getStatusRank(qIdB);
      
      const targetRank = sortBy === 'correct' ? 1 : sortBy === 'incorrect' ? 2 : 3;
      
      if (rankA === targetRank && rankB !== targetRank) return -1;
      if (rankA !== targetRank && rankB === targetRank) return 1;
      return rankA - rankB;
    });
  }, [questions, answers, result, sortBy]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-24"
    >
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-start gap-4 mb-4">
        <button
          onClick={onFinish}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all border border-white/5 font-bold"
        >
          <Trophy size={14} /> Back to Leaderboard
        </button>
      </div>

      {/* Compact Performance Metric Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/5 p-6 shadow-2xl">
       
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-left">
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-white mb-2 font-bold">Session Outcome</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">{result.correctAnswers}</span>
              <span className="text-sm text-white font-medium">/ {result.total} Solutions</span>
            </div>
            <p className="text-emerald-400 text-[9px] uppercase tracking-[0.2em] font-bold mt-1">Score: {score.toLocaleString()} PTS</p>
          </div>

          <div className="h-px md:h-12 w-full md:w-px bg-white/5" />

          <div className="grid grid-cols-3 gap-6 flex-1 w-full max-w-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{result.correctAnswers}</p>
              <p className="text-[8px] uppercase tracking-widest text-white">Correct</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{result.wrongAnswers}</p>
              <p className="text-[8px] uppercase tracking-widest text-white">Wrong</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">
                {result.total - (result.correctAnswers + result.wrongAnswers)}
              </p>
              <p className="text-[8px] uppercase tracking-widest text-white">Skipped</p>
            </div>
          </div>

          <div className="h-px md:h-12 w-full md:w-px bg-white/5" />

          <div className="text-right hidden md:block">
            <p className="text-3xl font-light text-white font-mono">
              {result.total > 0 ? Math.round((result.correctAnswers / result.total) * 100) : 0}%
            </p>
            <p className="text-[8px] uppercase tracking-widest text-white mt-1">Total Accuracy</p>
          </div>
        </div>
      </div>

      {/* Schematic Review Matrix (Grid) - Compact */}
      <div className="bg-[#0F0F0F] rounded-2xl p-4">
        <h3 className="text-[9px] uppercase tracking-[0.4em] text-white mb-4 text-center">Schematic Review Matrix</h3>
        <div className="flex flex-wrap justify-center gap-1.5 max-w-xl mx-auto">
          {questions.map((q, idx) => {
            const qId = String(q._id);
            const uAns = answers[qId];
            const cAns = result.correctAnswersMap?.[qId] || result.correctAnswers?.[qId];
            const isCor = uAns && uAns === cAns;
            
            let colorClass = "bg-white/5 text-white/20";
            if (isCor) colorClass = "bg-green-500/10 text-green-400";
            else if (!uAns) colorClass = "bg-yellow-500/10 text-yellow-500";
            else colorClass = "bg-red-500/10 text-red-400";

            return (
              <button
                key={qId}
                onClick={() => document.getElementById(`q-${qId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold transition-all hover:scale-110 active:scale-95 ${colorClass}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Review List & Sorting Controls */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 mb-4">
          <h3 className="text-[10px] uppercase tracking-[0.5em] text-white">Detailed Schematic Review</h3>
          
          {/* Sorting Chips */}
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
            {[
              { id: 'default', label: 'Default', count: questions.length },
              { id: 'correct', label: 'Correct', count: result.correctAnswers },
              { id: 'incorrect', label: 'Incorrect', count: result.wrongAnswers },
              { id: 'skipped', label: 'Skipped', count: result.total - (result.correctAnswers + result.wrongAnswers) }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setSortBy(pill.id)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-[9px] uppercase tracking-widest font-semibold transition-all flex items-center gap-2 ${
                  sortBy === pill.id 
                    ? 'bg-white text-[#0F0F0F] shadow-lg shadow-white/5' 
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                {pill.label}
                <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-[#0F0F0F] ${
                  sortBy === pill.id ? 'text-white' : 'text-white/30'
                }`}>
                  {pill.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {sortedQuestions.map((q, idx) => {
          const qId = String(q._id);
          const originalIndex = questions.findIndex(origQ => String(origQ._id) === qId);
          const userAnswer = answers[qId];
          const correctAnswer = result.correctAnswersMap?.[qId] || result.correctAnswers?.[qId];
          const isCorrect = userAnswer && userAnswer === correctAnswer;

          return (
            <motion.div 
              id={`q-${qId}`}
              key={qId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-5 rounded-xl border transition-all bg-[#0F0F0F] ${
                isCorrect ? 'border-green-500/10' : !userAnswer ? 'border-yellow-500/10' : 'border-red-500/10'
              }`}
            >
              <div className="flex flex-col md:flex-row gap-6 relative z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[9px] text-white uppercase tracking-widest">
                      Question {originalIndex + 1 < 10 ? `0${originalIndex + 1}` : originalIndex + 1}
                    </span>
                    {!userAnswer ? (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[7px] uppercase tracking-wider font-bold">
                        Skipped
                      </span>
                    ) : isCorrect ? (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[7px] uppercase tracking-wider font-bold">
                        <CheckCircle2 size={10} /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[7px] uppercase tracking-wider font-bold">
                        <XCircle size={10} /> Incorrect
                      </span>
                    )}
                  </div>
                  <h4 className="text-white text-base font-medium leading-relaxed italic opacity-90 mb-4">
                    {renderQuestionContent(q.question)}
                  </h4>
                </div>

                {/* Options Grid - Now more compact */}
                <div className="grid grid-cols-1 gap-2 md:w-80 shrink-0">
                  {q.options.map((opt, i) => {
                    const isThisCorrect = correctAnswer && String(opt).trim() === String(correctAnswer).trim();
                    const isThisUserChoice = userAnswer && String(opt).trim() === String(userAnswer).trim();

                    let styleClass = "border-white/5 text-white/30";
                    if (isThisCorrect) styleClass = "border-green-500/40 bg-green-500/5 text-green-400 font-bold";
                    else if (isThisUserChoice) styleClass = "border-red-500/40 bg-red-500/5 text-red-400";

                    return (
                      <div key={i} className={`px-3 py-2 rounded-lg border transition-all flex items-center gap-3 text-[12px] ${styleClass}`}>
                        <span className="text-[9px] w-5 h-5 rounded border border-current flex items-center justify-center opacity-30 font-mono">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <div className="flex-1 flex flex-col min-w-0">
                          <span className="truncate leading-tight">{opt}</span>
                          {isThisUserChoice && (
                            <span className="text-[7px] uppercase tracking-widest font-black mt-0.5 opacity-50">Your Selection</span>
                          )}
                          {isThisCorrect && !isThisUserChoice && (
                            <span className="text-[7px] uppercase tracking-widest font-black mt-0.5 text-green-500">Correct Answer</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="flex flex-col items-center gap-4 pt-8"
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors mb-4 flex items-center gap-2"
        >
          Back to Top 
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">↑</div>
        </button>
        <button
          onClick={onFinish}
          className="group flex items-center gap-4 px-10 py-5 bg-white text-black rounded-full font-bold uppercase tracking-[0.2em] text-[11px] hover:scale-105 transition-all active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
        >
          View Leaderboard
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      <AnimatePresence>
        {showTopBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            whileHover={{ scale: 1.1, rotate: 5, boxShadow: "0 0 20px rgba(255,255,255,0.3)" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-[60] w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-2xl transition-all text-xl font-bold border border-black/10"
            title="Go to Top"
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ReviewPanel;
