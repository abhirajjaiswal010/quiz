import React from 'react';

export default function AntiCheatWarning({ strikes, setIsFullscreenWarning }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6 animate-fade-in backdrop-blur-sm">
      <div className="card max-w-sm w-full p-8 text-center border-red-700 shadow-[0_0_50px_rgba(185,28,28,0.2)]">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
          <span className="text-3xl">🚫</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-red-500 mb-2">Protocol Breach Detected</h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Exiting fullscreen, switching tabs, or navigating away is strictly prohibited. You are on <span className="text-red-500 font-bold">strike {strikes} of 3</span>.
        </p>
        <div className="bg-red-500/5 rounded-xl p-4 mb-6 border border-red-500/10">
          <p className="text-xs text-red-400 font-medium italic">
            {strikes === 1
              ? "To exit this session properly, you must SUBMIT or COMPLETE the quiz. Protocol must be maintained."
              : "FINAL WARNING: Your session will be AUTO-TERMINATED on the next breach."}
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
