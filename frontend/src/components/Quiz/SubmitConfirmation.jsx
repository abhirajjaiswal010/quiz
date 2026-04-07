import React from 'react';

export default function SubmitConfirmation({ questions, answeredCount, setShowConfirm, submitCurrentQuiz }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 animate-fade-in">
      <div className="card max-w-sm w-full p-8 text-center">
        <div className="text-4xl mb-4">🤔</div>
        <h3 className="font-display text-xl font-bold text-white mb-2">Submit Quiz?</h3>
        <p className="text-slate-400 text-sm mb-1">
          You have <span className="text-amber-400 font-semibold">{questions.length - answeredCount} unanswered</span> question(s).
        </p>
        <p className="text-slate-500 text-xs mb-6">Unanswered questions will count as wrong.</p>
        <div className="flex gap-3">
          <button
            id="cancel-submit-btn"
            onClick={() => setShowConfirm(false)}
            className="btn-secondary flex-1"
          >
            Go Back
          </button>
          <button
            id="confirm-submit-btn"
            onClick={() => submitCurrentQuiz()}
            className="btn-accent flex-1"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
