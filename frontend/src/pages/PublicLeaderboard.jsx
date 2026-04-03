import { useState, useEffect } from 'react'
import { useQuiz } from '../context/QuizContext'
import { getLeaderboard } from '../api/quizApi'

const DEPARTMENTS = ['All', 'CSE', 'IT', 'ECE', 'ME', 'CE', 'EEE', 'MCA', 'MBA', 'OTHER']

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-xl">🥇</span>
  if (rank === 2) return <span className="text-xl">🥈</span>
  if (rank === 3) return <span className="text-xl">🥉</span>
  return <span className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 text-xs font-bold">{rank}</span>
}

export default function PublicLeaderboard() {
  const { reset } = useQuiz()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [deptFilter, setDeptFilter] = useState('All')

  useEffect(() => {
    getLeaderboard(deptFilter === 'All' ? '' : deptFilter)
      .then((d) => setLeaderboard(d.leaderboard || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [deptFilter])

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold gradient-text">🏆 Live Leaderboard</h1>
          <p className="text-slate-500 text-sm mt-1">{leaderboard.length} participants ranked</p>
        </div>
        <button onClick={reset} id="go-register-btn" className="btn-secondary">← Register</button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {DEPARTMENTS.map((d) => (
          <button key={d} onClick={() => setDeptFilter(d)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all
              ${deptFilter === d ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {d}
          </button>
        ))}
      </div>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : leaderboard.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No results yet.</div>
        ) : (
          <table className="w-full">
            <thead><tr className="border-b border-slate-800">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase w-16">Rank</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Student</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Dept</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Score</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Time</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-800/50">
              {leaderboard.map((entry) => (
                <tr key={entry.roll} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3"><RankBadge rank={entry.rank} /></td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-200">{entry.name}</p>
                    <p className="text-xs text-slate-600">{entry.roll}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="badge bg-slate-800 text-slate-400 border border-slate-700">{entry.department}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-brand-400">{entry.score}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-slate-400">{formatTime(entry.timeTaken)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
