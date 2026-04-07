import React from 'react';

export default function AntiCheatWarning({ strikes, setIsFullscreenWarning }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6 animate-fade-in backdrop-blur-sm">
      <div className="card max-w-sm w-full p-8 text-center border-red-700 shadow-[0_0_50px_rgba(185,28,28,0.2)]">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
          <span className="text-3xl">🚫</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-red-500 mb-2">Tab Switch Detected</h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Switching tabs is strictly prohibited in this quiz. You have used <span className="text-red-500 font-bold">attempt {strikes} of 3</span>.
        </p>
        <div className="bg-red-500/5 rounded-xl p-4 mb-6 border border-red-500/10">
          <p className="text-xs text-red-400 font-medium italic">
            {strikes === 1
              ? "First warning. Your progress is saved, but don't do it again."
              : "Final warning! One more tab switch and your quiz will be AUTO-SUBMITTED."}
          </p>
        </div>
        <button
          id="return-to-quiz-btn"
          onClick={() => setIsFullscreenWarning(false)}
          className="btn-primary w-full bg-red-600 hover:bg-red-500 border-red-500"
        >
          Resume Quiz
        </button>
      </div>
    </div>
  );
}
