import React from 'react';

export default function QuestionCard({ currentQuestion, currentIndex, answers, selectAnswer, isSubmitting }) {
  if (!currentQuestion) return null;
  const labels = ['A', 'B', 'C', 'D'];

  return (
    <div key={currentQuestion._id} className="card p-6 md:p-8 mb-6 animate-slide-up bg-white-900/50 border-slate-800">
      <div className="flex items-start gap-4 mb-6">
        <span className="flex-shrink-0 w-20  h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-sm">
          Que {currentIndex + 1}
        </span>
        <p className="text-lg md:text-xl font-medium text-slate-100 leading-relaxed pt-1">
          {currentQuestion.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {currentQuestion.options.map((option, idx) => {
          const isSelected = answers[currentQuestion._id] === option;
          return (
            <button
              key={idx}
              id={`option-${idx}-btn`}
              onClick={() => selectAnswer(currentQuestion._id, option)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center gap-1 active:scale-[0.98]
                ${isSelected
                  ? 'bg-brand-600/25 border-brand-500/80 text-white shadow-[0_0_25px_rgba(59,130,246,0.15)] ring-1 ring-brand-500/20'
                  : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800/80 hover:border-slate-600 hover:text-slate-200'}`}
              disabled={isSubmitting}
            >
              <span className={`inline-flex w-7 h-7 rounded-lg items-center justify-center text-xs font-black mr-3 flex-shrink-0 transition-transform duration-300
                ${isSelected
                  ? 'bg-brand-500 text-white scale-110'
                  : 'bg-slate-700/50 text-slate-500'}`}>
                {labels[idx]}
              </span>
              <span className="font-medium tracking-tight">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
