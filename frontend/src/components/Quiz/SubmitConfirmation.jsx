import Lottie from 'lottie-react';
import { useState, useEffect } from 'react';

export default function SubmitConfirmation({ questions, answeredCount, setShowConfirm, submitCurrentQuiz }) {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch('https://fonts.gstatic.com/s/e/notoemoji/latest/1f914/lottie.json')
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error('Lottie Load Error:', err));
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-[#0F0F0F] border border-white/10 rounded-3xl max-w-sm w-full p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/10 blur-[60px] pointer-events-none" />

        <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
          {animationData ? (
            <Lottie animationData={animationData} loop={true} className="w-full h-full" />
          ) : (
            <div className="text-4xl">🤔</div>
          )}
        </div>
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
