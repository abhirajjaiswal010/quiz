import React from 'react';
import {
  ShieldAlert,
  Timer,
  Star,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function QuizRules({ onStart, buttonText = "I'VE READ THE RULES - START QUIZ" }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-transparent backdrop-blur-md animate-fade-in">
      <div className="card max-w-2xl w-full bg-[#0F0F0F] border border-white/10  relative overflow-hidden">

        {/* Header Decor */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-600 via-[#4fb3ff] to-emerald-500" />

        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-600/20 flex items-center justify-center">
              <ShieldCheck className="text-brand-400" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-display">Quiz Guidelines</h2>
              <p className="text-slate-500 text-sm">Please read carefully before proceeding</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Rule 1: Anti-Cheat */}
            <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
              <ShieldAlert className="text-red-400 shrink-0" size={24} />
              <div>
                <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-wider">Anti-Cheat Mode</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Switching tabs or minimizing the browser will trigger a strike.<br />
                  <span className="text-red-400 font-bold ml-1">3 Strikes = Auto-Submission.</span>
                </p>
              </div>
            </div>

            {/* Rule 2: Scoring */}
            <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
              <Zap className="text-amber-400 shrink-0" size={24} />
              <div>
                <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-wider">Dynamic Scoring</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Earn <span className="text-emerald-400">100 points</span> per correct answer.
                  Get <span className="text-[#4fb3ff]">Bonus points</span> for answering quickly.
                </p>
              </div>
            </div>

            {/* Rule 3: Time Limit */}
            <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
              <Timer className="text-brand-400 shrink-0" size={24} />
              <div>
                <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-wider">Session Timer</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  The quiz will end automatically when the timer reaches zero. Partial answers will be saved.
                </p>
              </div>
            </div>

            {/* Rule 4: Submission */}
            <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
              <CheckCircle2 className="text-emerald-400 shrink-0" size={24} />
              <div>
                <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-wider">Final Submission</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Ensure all questions are answered before submitting. Once submitted, you cannot edit your answers.
                </p>
              </div>
            </div>
          </div>

          {/* Points to cover score section */}
          <div className="mb-10 text-center bg-[#4fb3ff]/5 p-5 rounded-2xl border border-[#4fb3ff]/10">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-[#4fb3ff]/10 border border-[#4fb3ff]/20">
              <Star className="text-[#4fb3ff]" size={14} />
              <span className="text-[10px] font-black text-[#4fb3ff] uppercase tracking-widest">Master Tip</span>
            </div>
            <p className="text-sm text-slate-300 italic">
              "Ranking is decided by Accuracy first, then Speed. Maintain your streak!"
            </p>
          </div>

          <button
            id="start-quiz-now-btn"
            onClick={onStart}
            className="w-full btn-primary bg-brand-600 hover:bg-brand-500 py-4 font-black flex items-center justify-center gap-3 group transition-all"
          >
            {buttonText}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
