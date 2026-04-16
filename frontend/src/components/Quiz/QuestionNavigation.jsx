import React from 'react';
import { ArrowBigLeftDashIcon, ArrowBigRightDashIcon } from 'lucide-react';

export default function QuestionNavigation({
  questions, currentIndex, setCurrentIndex, answers, isSubmitting, canSubmit, confirmSubmit
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-10">
        <button
          id="prev-question-btn"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0 || isSubmitting}
          className="btn-primary bg-slate-800/40 text-white px-6 shrink-0"
        >
          <ArrowBigLeftDashIcon /> Previous
        </button>

        {/* Question dots (desktop) */}
        <div className="hidden md:flex flex-wrap justify-center gap-3 flex-1">
          {questions.map((q, i) => {
            const isCurrent = i === currentIndex;
            const isAnswered = !!answers[q._id];
            const isSkipped = i < currentIndex && !isAnswered;

            return (
              <button
                key={q._id}
                id={`jump-q-${i}-btn`}
                onClick={() => setCurrentIndex(i)}
                className={`w-7 h-7 rounded-lg text-xs font-normal transition-all duration-150
                  ${isCurrent
                    ? 'bg-brand-600 text-white scale-110 ring-2 ring-brand-500 ring-offset-2 ring-offset-slate-950'
                    : isAnswered
                      ? 'bg-emerald-600 text-emerald-50'
                      : isSkipped
                        ? 'bg-[#D97A2B] text-white'
                        : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                title={`Question ${i + 1}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {currentIndex < questions.length - 1 ? (
          <button
            id="next-question-btn"
            onClick={() => setCurrentIndex((i) => i + 1)}
            disabled={isSubmitting}
            className="btn-primary px-8 shrink-0 bg-[#4fb3ff]"
          >
            Next
            <ArrowBigRightDashIcon />
          </button>
        ) : (
          <div className="flex flex-col items-center">
            <button
              id="submit-quiz-btn"
              onClick={confirmSubmit}
              disabled={isSubmitting || !canSubmit}
              className={`btn-accent px-8 shrink-0 flex items-center gap-2 ${!canSubmit ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  ...
                </>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Mobile question grid */}
      <div className="md:hidden mt-6 card p-4 bg-slate-900/50 border-slate-800">
        <p className="text-xs text-slate-500 mb-3 font-normal uppercase tracking-wider">Jump to:</p>
        <div className="flex flex-wrap gap-2">
          {questions.map((q, i) => {
            const isCurrent = i === currentIndex;
            const isAnswered = !!answers[q._id];
            const isSkipped = i < currentIndex && !isAnswered;

            return (
              <button
                key={q._id}
                id={`mobile-jump-q-${i}-btn`}
                onClick={() => setCurrentIndex(i)}
                className={`w-10 h-10 rounded-lg text-xs font-normal transition-all
                  ${isCurrent
                    ? 'bg-brand-600 text-white'
                    : isAnswered
                      ? 'bg-emerald-600 text-emerald-50'
                      : isSkipped
                        ? 'bg-amber-600/40 text-amber-200'
                        : 'bg-slate-800 text-slate-500'}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
