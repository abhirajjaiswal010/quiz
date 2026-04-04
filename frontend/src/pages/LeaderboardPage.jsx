import { useState, useEffect, useCallback } from 'react'
import { useQuiz } from '../context/QuizContext'
import { getLeaderboard } from '../api/quizApi'
import confetti from 'canvas-confetti'
import { Trophy, Medal, PartyPopper, BarChart3, Lock, Flag, Loader2, Flame, Star, ThumbsUp, BookOpen as BookIcon } from 'lucide-react'

const DEPARTMENTS = ['All', 'CSE', 'IT', 'ECE', 'ME', 'CE', 'EEE', 'MCA', 'MBA', 'OTHER']

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function RankBadge({ rank }) {
  if (rank === 1) return <Trophy className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" size={24} />
  if (rank === 2) return <Trophy className="text-slate-200 drop-shadow-[0_0_8px_rgba(226,232,240,0.4)]" size={22} />
  if (rank === 3) return <Trophy className="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]" size={20} />
  return (
    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 text-sm font-bold">
      {rank}
    </span>
  )
}

function ScoreBar({ score, total }) {
  const pct = total > 0 ? (score / total) * 100 : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden min-w-[60px]">
        <div
          className="h-full rounded-full transition-all duration-700 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-slate-300 tabular-nums">
        {score}/{total}
      </span>
    </div>
  )
}

export default function LeaderboardPage() {
  const { result, student, reset, questions, isQuizActive } = useQuiz()
  const [total, setTotal] = useState(0)           // totalQuestions from API
  // Best source of total: API total → stored result.total → questions array
  const totalQuestions = total || result?.total || questions.length || 0
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const fetchLeaderboard = useCallback(async () => {
    if (!student?.quizId) return;
    try {
      setError('')
      const data = await getLeaderboard(student.quizId)
      setLeaderboard(data.results || [])
      if (data.totalQuestions) setTotal(data.totalQuestions)
    } catch (err) {
      setError(err.message || 'Failed to load leaderboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [student?.quizId])

  useEffect(() => {
    if (student?.quizId) {
      fetchLeaderboard()

      const interval = setInterval(() => {
        fetchLeaderboard()
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [fetchLeaderboard, isQuizActive, student?.quizId])

  // ── Confetti Effect (on mount if result exists) ──────────────────────────
  useEffect(() => {
    if (result) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [result]) // Fires once when result is available on this page mount

  const handleRefresh = () => {
    setRefreshing(true)
    fetchLeaderboard()
  }

  const myRank = result
    ? leaderboard.findIndex((r) => r.roll === student?.roll) + 1
    : null

  return (
    <div className="min-h-screen animate-fade-in bg-[#0F0F0F]">
      {/* ── Result Banner ── */}
      {result && (
        <div className="bg-[#4FB3FF] border-b border-[#4FB3FF]/50">
          <div className="max-w-4xl mx-auto px-4 py-10 text-center animate-slide-up">
            <div className="flex justify-center mb-4">
              {result.score === result.total ? (
                <Trophy className="text-white" size={64} />
              ) : result.score >= result.total * 0.7 ? (
                <PartyPopper className="text-white" size={64} />
              ) : (
                <BarChart3 className="text-white" size={64} />
              )}
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
              Quiz Completed!
            </h1>
            <p className="text-white font-semibold mb-6">
              Well done, <span className="text-white font-semibold">{result.name}</span>!
            </p>

            {/* Score Card */}
            <div className="inline-flex gap-6 md:gap-10 bg-[#0F0F0F]/80 backdrop-blur-sm border border-white rounded-2xl px-8 py-5">
              <div className="text-center">
                <div className="font-display text-4xl font-black text-white">
                  {result.score}
                  <span className="text-white-500 text-2xl font-normal">/{result.total}</span>
                </div>
                <div className="text-xs text-white-500 mt-1">Score</div>
              </div>
              <div className="w-px bg-white" />
              <div className="text-center">
                <div className="font-display text-4xl font-black text-brand-400">
                  {totalQuestions > 0
                    ? Math.round((result.score / totalQuestions) * 100)
                    : result.total
                    ? Math.round((result.score / result.total) * 100)
                    : '—'}
                  <span className="text-2xl font-normal">%</span>
                </div>
                <div className="text-xs text-white-500 mt-1">Accuracy</div>
              </div>
              <div className="w-px bg-white" />
              <div className="text-center">
                <div className="font-display text-4xl font-black text-accent-400">
                  {formatTime(result.timeTaken)}
                </div>
                <div className="text-xs text-white  -500 mt-1">Time Taken</div>
              </div>
              {myRank && (
                <>
                  <div className="w-px bg-white hidden md:block" />
                  <div className="text-center hidden md:block">
                    <div className="font-display text-4xl font-black text-amber-400">
                      #{myRank}
                    </div>
                    <div className="text-xs text-white-500 mt-1">Your Rank</div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 text-sm text-slate-500 flex flex-col items-center gap-2">
              {result.score === result.total && (
                <span className="flex items-center gap-2 text-amber-500 font-bold uppercase tracking-widest">
                  <Flame size={16} /> Perfect Score! Outstanding!
                </span>
              )}
              {result.score >= result.total * 0.8 && result.score < result.total && (
                <span className="flex items-center gap-2 text-white font-semibold">
                  <Star size={16} /> Excellent work!
                </span>
              )}
              {result.score >= result.total * 0.6 && result.score < result.total * 0.8 && (
                <span className="flex items-center gap-2 text-white font-semibold ">
                  <ThumbsUp size={16} /> Good job!
                </span>
              )}
              {result.score < result.total * 0.6 && (
                <span className="flex items-center gap-2 text-white font-semibold">
                  <BookIcon size={16} /> Keep practicing!
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Leaderboard Section ── */}
      <div className="max-w-4xl mx-auto px-4 py-8 ">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div className="flex-1">
            <h2 className="font-display text-3xl font-black text-white flex items-center gap-3">
              <Trophy className="text-[#4FB3FF]" />
              Global Rankings
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {isQuizActive ? 'Ranking calculation in progress...' : `${leaderboard.length} participants finalized`}
            </p>
          </div>

          {!isQuizActive && (
            <button
              id="refresh-leaderboard-btn"
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary gap-2 self-start sm:self-auto px-6"
            >
              <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sync Data
            </button>
          )}
        </div>

        {false ? (
          <div className="card p-16 text-center border-amber-500/10 bg-amber-500/5 animate-pulse">
            <div className="flex justify-center mb-6 opacity-80">
              <Lock className="text-white" size={64} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Leaderboard Locked</h3>
            <p className="text-slate-400 max-w-sm mx-auto">
              The rankings are currently being calculated. Results will be released immediately after the quiz ends.
            </p>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="card p-5 flex items-center gap-5 border-slate-800/50">
                    <div className="w-10 h-10 rounded-full shimmer" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 rounded-lg shimmer w-1/3 opacity-30" />
                      <div className="h-3 rounded-lg shimmer w-1/5 opacity-10" />
                    </div>
                    <div className="h-6 rounded-lg shimmer w-20 opacity-20" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="card p-10 text-center border-red-500/20">
                <p className="text-red-400 mb-6 font-medium">{error}</p>
                <button onClick={handleRefresh} className="btn-primary mx-auto">Try Again</button>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="card p-20 text-center border-slate-800/50">
                <div className="flex justify-center mb-6 opacity-50">
                  <Flag className="text-white" size={64} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Results Found</h3>
                <p className="text-slate-500">Wait for the quiz session to be stopped!</p>
              </div>
            ) : (
              <>
                {/* Full Table */}
                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-800">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">Rank</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {leaderboard.map((entry, idx) => {
                          const isCurrentUser = entry.roll === student?.roll
                          const rank = idx + 1
                          return (
                            <tr
                              key={entry.roll}
                              className={`transition-colors duration-150 ${isCurrentUser
                                ? 'bg-[#4FB3FF]/10 border-l-2 border-l-[#4FB3FF]'
                                : 'hover:bg-slate-800/30'
                                }`}
                            >
                              <td className="px-4 py-3.5">
                                <div className="flex items-center justify-center w-8">
                                  <RankBadge rank={rank} />
                                </div>
                              </td>
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                                ${isCurrentUser ? 'bg-brand-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                    {entry.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className={`text-sm font-medium truncate ${isCurrentUser ? 'text-brand-300' : 'text-slate-200'}`}>
                                      {entry.name}
                                      {isCurrentUser && <span className="ml-1.5 text-xs text-brand-500">(You)</span>}
                                    </p>
                                    <p className="text-xs text-white font-medium truncate">{entry.roll}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3.5">
                                <ScoreBar score={entry.score} total={totalQuestions || entry.score} />
                              </td>
                              <td className="px-4 py-3.5 hidden md:table-cell text-slate-400 text-sm tabular-nums">
                                {formatTime(entry.timeTaken)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Back / Reset */}
            <div className="mt-8 text-center">
              <button
                id="back-to-home-btn"
                onClick={reset}
                className="btn-secondary mx-auto"
              >
                ← Back to Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
