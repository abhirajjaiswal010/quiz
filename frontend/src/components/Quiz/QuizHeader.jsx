import React from 'react';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function QuizHeader({ timeLeft, timerColor, student, answeredCount, questions, progress, currentIndex }) {
  return (
    <header className="sticky top-0 z-20 bg-[#0F0F0F] backdrop-blur-md  px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#0f0f0f]/20 border border-white/20 flex items-center justify-center text-xl ">
            🧠
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-white/40 uppercase tracking-[0.2em] leading-none mb-1">ClubQuiz Session</p>
            <p className="text-md font-bold text-white truncate">{student?.name}</p>
          </div>
        </div>

        {/* Timer */}
        <div className={`px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center gap-3 font-mono font-black text-2xl ${timerColor} tabular-nums transition-colors duration-500 shadow-inner`}>
          <div className={`w-2 h-2 rounded-full ${timeLeft <= 60 ? 'bg-red-500 animate-ping' : 'bg-current opacity-50'}`} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="max-w-3xl mx-auto mt-4 px-1">
        <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-brand-600 via-brand-400 to-[#4fb3ff] rounded-full transition-all duration-700 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            {/* Glow Tip */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-white/20 blur-sm" />
          </div>
        </div>
        <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">
          <span>Item {currentIndex + 1} / {questions.length}</span>
          <span className="text-brand-400">{Math.round(progress)}% Processed</span>
        </div>
      </div>
    </header>
  );
}
