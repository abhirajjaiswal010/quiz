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
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-1
                ${isSelected
                  ? 'bg-brand-600/20 border-brand-500 text-white shadow-lg shadow-brand-500/10'
                  : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'}`}
              disabled={isSubmitting}
            >
              <span className={`inline-flex w-7 h-7 rounded-lg items-center justify-center text-xs font-bold mr-3 flex-shrink-0
                ${isSelected
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-700 text-slate-400'}`}>
                {labels[idx]}
              </span>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
