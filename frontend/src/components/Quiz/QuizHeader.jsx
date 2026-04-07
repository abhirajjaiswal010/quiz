import React from 'react';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function QuizHeader({ timeLeft, timerColor, student, answeredCount, questions, progress, currentIndex }) {
  return (
    <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-5 min-w-0">
          <span className="text-xl">🧠</span>
          <div className="min-w-0">
            <p className="text-xl text-white font-semib leading-none">ClubQuiz</p>
            <p className="text-md mt-1 font-semibold text-white truncate">User : {student?.name}</p>
          </div>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-2 font-mono font-bold text-2xl ${timerColor} tabular-nums`}>
          <svg className={`w-5 h-5 ${timeLeft <= 60 ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatTime(timeLeft)}
        </div>

        {/* Progress */}
        <div className="hidden sm:flex items-center gap-2 text-sm text-white">
          <span className="text-white font-semibold">{answeredCount}</span>
          <span>/</span>
          <span>{questions.length}</span>
          <span>answered</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="max-w-3xl mx-auto mt-3">
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full"
            style={{ width: `${progress}%`, transition: 'width 0.4s ease' }}
          />
        </div>
        <div className="flex justify-between text-md text-white mt-1">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </div>
    </header>
  );
}
