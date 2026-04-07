import { useState, useEffect, useCallback } from 'react'
import { useQuiz } from '../context/QuizContext'
import { getLeaderboard } from '../api/quizApi'
import confetti from 'canvas-confetti'
import { Trophy, Medal, PartyPopper, BarChart3, Lock, Flag, Loader2, Flame, Star, ThumbsUp, BookOpen as BookIcon, ChevronDown } from 'lucide-react'

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

function ScoreBar({ score, correct, total }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-black text-[#4FB3FF] tabular-nums leading-none">
          {score}
        </span>
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">pts</span>
      </div>
      <div className="flex items-center gap-1.5 mt-1">
         <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
              style={{ width: `${(correct/total) * 100}%` }}
            />
         </div>
         <span className="text-[10px] text-slate-500 font-medium">{correct}/{total}</span>
      </div>
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
            <p className="text-white font-semibold mb-4">
              Well done, <span className="text-white font-semibold">{result.name}</span>!
            </p>

            {myRank && (
              <div className="mb-8 animate-bounce-slow">
                <span className="text-white/50 text-xs font-bold uppercase tracking-[0.3em] block mb-1">Your Global Rank</span>
                <span className="text-5xl md:text-7xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  #{myRank}
                </span>
              </div>
            )}

            {/* Final Points Card */}
            <div className="mb-5 animate-slide-up animation-delay-200">
               <div className="inline-block bg-[#0F0F0F]/60 backdrop-blur-md border border-white/20 rounded-3xl px-12 py-8 border-t-white/40">
                  <span className="text-white/50 text-[10px] font-black uppercase tracking-[0.4em] block mb-2">Total Points Earned</span>
                  <div className="text-6xl md:text-8xl font-black text-white flex items-center justify-center gap-2">
                    <span className="gradient-text">{result.score || 0}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                     <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
                       {(result.correctAnswers || 0) * 100} Acc Points
                     </span>
                     <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20 font-bold">
                       +{result.remainingTime || 0} Speed Bonus
                     </span>
                  </div>
               </div>
            </div>

            {/* Stats Grid */}
            <div className="inline-flex flex-wrap items-center justify-center gap-4 md:gap-8 bg-[#0F0F0F]/60 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-5">
              {/* Correct */}
              <div className="text-center px-1">
                <div className="font-display text-4xl font-black text-[#98E19A]">
                  {result.correctAnswers || 0}
                  <span className="text-white/20 text-xl font-normal ml-0.5">/{result.totalQuestions || result.total}</span>
                </div>
                <div className="text-[10px] md:text-xs text-white/50 uppercase tracking-widest mt-1">Correct</div>
              </div>

              <div className="w-px h-10 bg-white/10" />

              {/* Wrong */}
              <div className="text-center px-1">
                <div className="font-display text-4xl font-black text-[#FF7575]">
                  {result.wrongAnswers || 0}
                </div>
                <div className="text-[10px] md:text-xs text-white/50 uppercase tracking-widest mt-1">Wrong</div>
              </div>

              <div className="w-px h-10 bg-white/10" />

              {/* Attempted */}
              <div className="text-center px-1">
                <div className="font-display text-4xl font-black text-[#4FB3FF]">
                  {(result.correctAnswers || 0) + (result.wrongAnswers || 0)}
                </div>
                <div className="text-[10px] md:text-xs text-white/50 uppercase tracking-widest mt-1">Attempted</div>
              </div>

              <div className="w-px h-10 bg-white/10" />

              {/* Accuracy */}
              <div className="text-center px-1">
                <div className="font-display text-4xl font-black text-amber-400">
                  { (result.totalQuestions || result.total) > 0 ? 
                    Math.round(((result.correctAnswers || 0) / (result.totalQuestions || result.total)) * 100) : 
                    '—' }
                  <span className="text-xl font-normal ml-0.5">%</span>
                </div>
                <div className="text-[10px] md:text-xs text-white/50 uppercase tracking-widest mt-1">Accuracy</div>
              </div>
            </div>

            <div className="mt-4 text-sm text-slate-500 flex flex-col items-center gap-2">
              {result.correctAnswers === (result.totalQuestions || result.total) && (
                <span className="flex items-center gap-2 text-amber-500 font-bold uppercase tracking-widest">
                  <Flame size={16} /> Perfect Score! Outstanding!
                </span>
              )}
              {result.correctAnswers >= (result.totalQuestions || result.total) * 0.8 && result.correctAnswers < (result.totalQuestions || result.total) && (
                <span className="flex items-center gap-2 text-white font-semibold">
                  <Star size={16} /> Excellent work!
                </span>
              )}
              {result.correctAnswers >= (result.totalQuestions || result.total) * 0.6 && result.correctAnswers < (result.totalQuestions || result.total) * 0.8 && (
                <span className="flex items-center gap-2 text-white font-semibold ">
                  <ThumbsUp size={16} /> Good job!
                </span>
              )}
              {result.correctAnswers < (result.totalQuestions || result.total) * 0.6 && (
                <span className="flex items-center gap-2 text-white font-semibold">
                  <BookIcon size={16} /> Keep practicing!
                </span>
              )}
            </div>
            
            {/* Scroll Indicator */}
            <div className="mt-4 flex flex-col items-center   opacity-40">
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-1">Scroll for Rankings</span>
               <ChevronDown size={15} className="text-white animate-bounce mb-[-10px]" />
               <ChevronDown size={20} className="text-white animate-bounce" />
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
                                <ScoreBar 
                                  score={entry.score} 
                                  correct={entry.correctAnswers || 0} 
                                  total={entry.totalQuestions || totalQuestions || 0} 
                                />
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
