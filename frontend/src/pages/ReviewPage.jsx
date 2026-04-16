import React from 'react';
import { useQuiz } from '../context/QuizContext';
import ReviewPanel from '../components/Quiz/ReviewPanel';
import { Navigate, useNavigate } from 'react-router-dom';

export default function ReviewPage() {
  const navigate = useNavigate();
  const { questions, answers, result, isQuizActive, student } = useQuiz();

  // Guard: If no result exists, they shouldn't be here
  if (!result) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white overflow-x-hidden flex flex-col">
      <div className="relative z-10 max-w-4xl w-full mx-auto px-4 py-12 flex-1 flex flex-col">
        <header className="mb-12 text-center">
            <h1 className="text-4xl font-normal uppercase tracking-tighter mb-2 ">Detailed Analysis</h1>
            <p className="text-white text-[10px] uppercase tracking-[0.5em] font-light">Comprehensive Schematic Evaluation</p>
        </header>

        {isQuizActive ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white/[0.02] border border-white/5 rounded-3xl text-center">
             <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 animate-pulse">
                <span className="text-4xl">🔒</span>
             </div>
             <h2 className="text-2xl font-normal mb-4 uppercase tracking-tighter italic">Review Locked</h2>
             <p className="max-w-md text-white/40 text-sm leading-relaxed mb-8">
                Analysis will be released once the global session is terminated. 
                This prevents any tactical advantage during the active assessment sequence.
             </p>
             <button 
                onClick={() => navigate('/leaderboard')}
                className="px-8 py-4 bg-white text-black rounded-2xl font-normal text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
             >
                Return to Leaderboard
             </button>
          </div>
        ) : (
          <ReviewPanel 
            questions={questions}
            answers={answers}
            result={result}
            student={student}
            onFinish={() => navigate('/leaderboard')}
          />
        )}
      </div>
    </div>
  );
}
