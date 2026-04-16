import React from 'react';
import { useQuiz } from '../context/QuizContext';
import ReviewPanel from '../components/Quiz/ReviewPanel';
import { Navigate, useNavigate } from 'react-router-dom';

export default function ReviewPage() {
  const navigate = useNavigate();
  const { questions, answers, result } = useQuiz();

  // Guard: If no result exists, they shouldn't be here
  if (!result) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white overflow-x-hidden">


      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <header className="mb-12 text-center">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 ">Detailed Analysis</h1>
            <p className="text-white text-[10px] uppercase tracking-[0.5em] font-light">Comprehensive Schematic Evaluation</p>
        </header>

        <ReviewPanel 
          questions={questions}
          answers={answers}
          result={result}
          onFinish={() => navigate('/leaderboard')}
        />
      </div>
    </div>
  );
}
