import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { getLeaderboard } from '../api/quizApi';
import confetti from 'canvas-confetti';
import { ArrowBigLeftDashIcon, Trophy } from 'lucide-react';

// Modular UI Components
import PersonalStats from '../components/Leaderboard/PersonalStats';
import LeaderboardTable from '../components/Leaderboard/LeaderboardTable';
import Podium from '../components/Leaderboard/Podium';

/**
 * Global Real-Time Leaderboard Page.
 * Orchestrates personal result banners and the global participant table.
 * Includes automated polling and celebratory confetti for submissions.
 */
export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { result, student, reset, questions, isQuizActive } = useQuiz();
  
  // State for total question count and rankings
  const [total, setTotal] = useState(0);
  const totalQuestions = total || result?.total || questions.length || 0;
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Fetches the latest global rankings from the specialized leaderboard controller.
   */
  const fetchLeaderboard = useCallback(async () => {
    if (!student?.quizId) {
      setLoading(false);
      return;
    }
    try {
      setError('');
      const data = await getLeaderboard(student.quizId);
      setLeaderboard(data.results || []);
      if (data.totalQuestions) setTotal(data.totalQuestions);
    } catch (err) {
      setError(err.message || 'Failed to sync rankings. Connection unstable.');
    } finally {
      setLoading(false);
    }
  }, [student?.quizId]);

  // Handle Polling & Initial Fetch
  useEffect(() => {
    if (student?.quizId) {
      fetchLeaderboard();
      const interval = setInterval(fetchLeaderboard, 5000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [fetchLeaderboard, isQuizActive, student?.quizId]);

  // Confetti celebration on successful quiz completion
  useEffect(() => {
    if (result) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [result]);

  const myRank = result
    ? leaderboard.findIndex((r) => r.studentId === student?.studentId) + 1
    : null;

  return (
    <div className="min-h-screen animate-fade-in bg-[#0F0F0F]">
      
      {/* ── Personal Achievement Banner ── */}
      <PersonalStats result={result} myRank={myRank} />

      {/* ── Podium Winners (Post-Quiz Glory View) ── */}
      {!isQuizActive && leaderboard.length >= 3 && (
        <Podium topThree={leaderboard.slice(0, 3)} />
      )}

      {/* ── Global Rankings Module ── */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Table Title and Status Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div className="flex-1">
            <h2 className="font-display text-3xl font-bold text-white flex items-center gap-3">
              <Trophy className="text-[#4FB3FF]" />
              Global Rankings
            </h2>
            <p className="text-slate-500 text-sm mt-1 uppercase tracking-tight text-xs font-bold font-mono">
              {isQuizActive ? 'Live calculation in progress...' : `${leaderboard.length} submissions finalized`}
            </p>
          </div>
        </div>

        {/* The Core Rankings Table Component */}
        <LeaderboardTable 
          leaderboard={leaderboard} 
          student={student} 
          loading={loading} 
          error={error} 
          totalQuestions={totalQuestions} 
          onRefresh={fetchLeaderboard}
        />

        {/* Secondary Navigation Actions */}
        <div className="mt-8 text-center pb-20">
          <button
            id="back-to-home-btn"
            onClick={reset}
            className="btn-secondary mx-auto font-montserrat uppercase px-10 py-4 tracking-widest text-[10px] font-bold border-none"
          >
            <ArrowBigLeftDashIcon/> Exit to Portal
          </button>
        </div>
      </div>
    </div>
  );
}
