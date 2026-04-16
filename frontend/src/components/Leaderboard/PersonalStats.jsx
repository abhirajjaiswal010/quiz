import { Trophy, PartyPopper, BarChart3, Flame, Star, ThumbsUp, BookOpen as BookIcon, ChevronDown, BookOpenCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CountUp from '../CountUp';
import Counter from '../counter';

const PersonalStats = ({ result, myRank }) => {
  const navigate = useNavigate();
  if (!result) return null;

  const totalQuestions = result.totalQuestions || result.total || 0;
  
  return (
    <div className="bg-[#4FB3FF] border-b border-[#4FB3FF]/50">
      <div className="max-w-4xl mx-auto px-4 py-10 text-center animate-slide-up">
        {/* Main Status Logo */}
        <div className="flex justify-center mb-4">
          {result.score === totalQuestions ? (
            <Trophy className="text-white" size={64} />
          ) : result.score >= totalQuestions * 0.7 ? (
            <PartyPopper className="text-white" size={64} />
          ) : (
            <BarChart3 className="text-white" size={64} />
          )}
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
          Quiz Completed!
        </h1>
        <p className="text-white font-semibold mb-4 text-sm">
          Well done, <span className="text-white font-semibold">{result.name}</span>!
        </p>

        {myRank && (
          <div className="mb-8 animate-bounce-slow">
            <span className="text-white/50 text-[10px] font-bold uppercase tracking-[0.3em] block mb-1">Your Global Rank</span>
            <div className="flex items-center justify-center gap-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              <span className="text-5xl md:text-7xl font-black text-white">#</span>
              <Counter 
                value={myRank} 
                fontSize={64} 
                textColor="white" 
                gradientFrom="transparent" 
                fontWeight="900" 
              />
            </div>
          </div>
        )}

        {/* Results Info Card */}
        <div className="mb-5 animate-slide-up animation-delay-200">
           <div className="inline-block bg-[#0F0F0F]/60 backdrop-blur-md border border-white/20 rounded-3xl px-12 py-8 border-t-white/40">
              <span className="text-white/50 text-[10px] font-black uppercase tracking-[0.4em] block mb-2">Total Points Earned</span>
              <div className="text-6xl md:text-8xl font-black text-white flex items-center justify-center gap-2">
                <span className="gradient-text"><CountUp to={result.score || 0} duration={2} /></span>
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                  <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
                    <CountUp to={(result.correctAnswers || 0) * 1000} duration={1.5} /> Acc Points
                  </span>
                  <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20 font-bold">
                    +<CountUp to={result.remainingTime || 0} duration={1.5} /> Speed Bonus
                  </span>
              </div>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="inline-flex flex-wrap items-center justify-center gap-4 md:gap-8 bg-[#0F0F0F]/60 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-5">
          <div className="text-center px-1">
            <div className="font-display text-4xl font-black text-[#98E19A]">
              <CountUp to={result.correctAnswers || 0} duration={1.5} />
              <span className="text-white/20 text-xl font-normal ml-0.5">/{totalQuestions}</span>
            </div>
            <div className="text-[10px] md:text-xs text-white/50 uppercase tracking-widest mt-1">Correct</div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center px-1">
            <div className="font-display text-4xl font-black text-[#FF7575]">
              <CountUp to={result.wrongAnswers || 0} duration={1.5} />
            </div>
            <div className="text-[10px] md:text-xs text-white/50 uppercase tracking-widest mt-1">Wrong</div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center px-1">
            <div className="font-display text-4xl font-black text-[#4FB3FF]">
              <CountUp to={(result.correctAnswers || 0) + (result.wrongAnswers || 0)} duration={1.5} />
            </div>
            <div className="text-[10px] md:text-xs text-white/50 uppercase tracking-widest mt-1">Attempted</div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center px-1">
            <div className="font-display text-4xl font-black text-amber-400">
              { totalQuestions > 0 ? <CountUp to={Math.round(((result.correctAnswers || 0) / totalQuestions) * 100)} duration={1.5} /> : '—' }
              <span className="text-xl font-normal ml-0.5">%</span>
            </div>
            <div className="text-[10px] md:text-xs text-white/50 uppercase tracking-widest mt-1">Accuracy</div>
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-500 flex flex-col items-center gap-2">
          {result.correctAnswers === totalQuestions && totalQuestions > 0 && (
            <span className="flex items-center gap-2 text-amber-500 font-bold uppercase tracking-widest animate-pulse">
              <Flame size={16} /> Perfect Score! Outstanding!
            </span>
          )}
          {result.correctAnswers >= totalQuestions * 0.8 && result.correctAnswers < totalQuestions && (
            <span className="flex items-center gap-2 text-white font-semibold">
              <Star size={16} /> Excellent work!
            </span>
          )}
          {result.correctAnswers >= totalQuestions * 0.6 && result.correctAnswers < totalQuestions * 0.8 && (
            <span className="flex items-center gap-2 text-white font-semibold">
              <ThumbsUp size={16} /> Good job!
            </span>
          )}
          {result.correctAnswers > 0 && result.correctAnswers < totalQuestions * 0.6 && (
            <span className="flex items-center gap-2 text-white font-semibold text-xs">
              <BookIcon size={16} /> Keep practicing!
            </span>
          )}
          {result.correctAnswers === 0 && (
            <span className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest animate-pulse">
              <BookIcon size={16} /> Better luck next time! Attend more carefully.
            </span>
          )}
        </div>

        <div className="mt-8 mb-6 flex justify-center">
            <button
               onClick={() => navigate('/quiz')}
               className="flex items-center gap-3 px-8 py-3 bg-white text-[#4FB3FF] rounded-full font-bold uppercase tracking-[0.2em] text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
            >
               <BookOpenCheck size={16} strokeWidth={2.5} />
               Review My Answers
            </button>
        </div>
        
        <div className="mt-4 flex flex-col items-center opacity-40">
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-1">Scroll for Rankings</span>
           <ChevronDown size={15} className="text-white animate-bounce mb-[-10px]" />
           <ChevronDown size={20} className="text-white animate-bounce" />
        </div>
      </div>
    </div>
  );
};

export default PersonalStats;
