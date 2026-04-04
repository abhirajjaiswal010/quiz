import { useState, useEffect } from 'react'
import { LayoutDashboard, Zap, BookOpen, Radio, Moon, Users, Pencil, Trash2, LogOut } from 'lucide-react'
import logo from '../assets/logo.png'

function formatAdminTime(seconds) {
  if (seconds <= 0) return 'EXPIRED';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

const AdminTimer = ({ startedAt, duration }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculate = () => {
      const start = new Date(startedAt).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - start) / 1000);
      const total = duration * 60;
      setTimeLeft(Math.max(0, total - elapsed));
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [startedAt, duration]);

  const color = timeLeft > 300 ? 'text-emerald-400' : timeLeft > 60 ? 'text-amber-400' : 'text-red-400';

  return (
    <span className={`font-mono font-black text-xl tabular-nums ${color}`}>
      {formatAdminTime(timeLeft)}
    </span>
  );
};

export default function AdminDashboard({
  tab, setTab, quizId, setQuizId, fetchStatus, handleCreate, handleStart, handleStop, 
  duration, setDuration, allowTabSwitching, setAllowTabSwitching,
  loading, status, participantCount, sessionInfo, leaderboard, handleLogout,
  questions, qForm, setQForm, handleSaveQuestion, editingId, setEditingId, handleDeleteQuestion
}) {
    return (
    <div className="min-h-screen bg-[#0f0f0f] relative overflow-hidden">
    

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo" className="w-12 h-12 object-contain brightness-0 invert" />
          <div>
            <h1 className="font-display text-4xl font-bold text-white tracking-tight flex items-center gap-3">
              Admin Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">Full control over quiz sessions and question bank</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-primary bg-[#FF7575] text-white text-xs px-4 self-start md:self-auto font-bold uppercase tracking-wider flex items-center gap-2">
          <LogOut size={16} />
          Logout
        </button>
      </div>

      <div className="flex gap-1 mb-8 bg-white/5 p-1 rounded-2xl w-fit border border-white/10">
        <button onClick={() => setTab('control')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${tab === 'control' ? 'bg-[#4FB3FF] text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
          <Zap size={16} />
          Session Control
        </button>
        <button onClick={() => setTab('questions')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${tab === 'questions' ? 'bg-[#4FB3FF] text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
          <BookOpen size={16} />
          Question Bank
        </button>
      </div>

      {tab === 'control' && (
        <div className="space-y-8 animate-slide-up">
          <div className="card p-8">
            <h2 className="text-xl font-bold text-white mb-6">Manage Quiz Session</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="label">Unique Quiz ID</label>
                    <input type="text" value={quizId} onChange={e => setQuizId(e.target.value)} placeholder="e.g. hack-24" className="input-field bg-[#0f0f0f]/20 border border-white/20 uppercase text-white py-2 text-sm focus:border-white transition-colors" />
                  </div>
                  <div className="w-24">
                     <label className="label">Mins</label>
                     <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="input-field bg-[#0f0f0f]/20 border border-white/20 text-white py-2 text-sm focus:border-white transition-colors" />
                  </div>
                  <div className="flex-col flex items-center justify-center pt-5">
                    <label className="text-[9px] text-slate-500 uppercase font-bold mb-1 tracking-tight">Allow Tab</label>
                    <button 
                      onClick={() => setAllowTabSwitching(!allowTabSwitching)}
                      className={`w-12 h-6 rounded-full transition-all duration-300 relative ${allowTabSwitching ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${allowTabSwitching ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  <button onClick={fetchStatus} className="btn-primary bg-[#4FB3FF] mt-7 text-white whitespace-nowrap h-[38px] flex items-center">Fetch</button>
                </div>
                <div className="pt-4 grid grid-cols-1 gap-3">
                  <button onClick={handleCreate} disabled={loading} className="btn-primary w-full bg-white ">Create New Quiz</button>
                  <button onClick={handleStart} disabled={loading || status === true || !status === null} className="btn-primary w-full bg-[#98E19A] border-[#98E19A]/50 ">Start Quiz</button>
                  <button onClick={handleStop} disabled={loading || status === false || !status === null} className="btn-primary w-full bg-[#FF7575] border-[#FF7575]/50 ">Stop Quiz</button>
                </div>
              </div>

              <div className="space-y-6">
                <div className={`p-6 rounded-2xl border transition-colors flex items-center justify-between ${status === true ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-widest">Live Status</p>
                    <p className={`text-xl font-bold ${status === true ? 'text-[#98E19A] animate-pulse' : 'text-[#FF7575]'}`}>
                      {status === true ? 'ACTIVE' : status === false ? 'INACTIVE' : 'NOT FOUND'}
                    </p>        
                  </div>
                  <div className="text-white">
                    {status === true ? <Radio className="animate-pulse" size={28} /> : <Moon size={28} />}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-widest">Participants</p>
                    <p className="text-2xl font-bold text-white">{participantCount}</p>
                  </div>
                  <div className="text-white">
                    <Users size={28} />
                  </div>
                </div>

                {sessionInfo && (
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest border-b border-white/5 pb-2">Session Details</p>
                    
                    {/* Live Timer Section */}
                    {status && sessionInfo.quizDetails?.startedAt && (
                      <div className="flex justify-between items-center bg-brand-500/10 p-3 rounded-xl border border-brand-500/20 mb-4">
                        <span className="text-brand-400 text-xs font-bold uppercase">Time Remaining</span>
                        <AdminTimer 
                          startedAt={sessionInfo.quizDetails.startedAt} 
                          duration={sessionInfo.quizDetails.duration} 
                        />
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Total Questions</span>
                      <span className="text-white font-bold">{sessionInfo.totalQuestions}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Time Limit</span>
                      <span className="text-white font-bold">{sessionInfo.quizDetails.duration} mins</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Created At</span>
                      <span className="text-white text-[11px]">{new Date(sessionInfo.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t border-white/5 pt-2">
                       <span className="text-slate-400 text-xs">Anti-Cheat Mode</span>
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${allowTabSwitching ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                         {allowTabSwitching ? 'Disabled (Allowed)' : 'Enabled (Locked)'}
                       </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {leaderboard.length > 0 && (
            <div className="card p-8 animate-slide-up">
              <h3 className="text-xl font-bold text-white mb-6">Session Leaderboard</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="text-left py-3 px-2">Rank</th>
                      <th className="text-left py-3 px-2">Student</th>
                      <th className="text-left py-3 px-2">Score</th>
                      <th className="text-left py-3 px-2">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {leaderboard.map((r, i) => (
                      <tr key={r.roll}>
                        <td className="py-3 px-2 font-bold text-brand-400">#{i + 1}</td>
                        <td className="py-3 px-2">
                          <div className="text-white font-medium">{r.name}</div>
                          <div className="text-[10px] text-slate-500">{r.roll}</div>
                        </td>
                        <td className="py-3 px-2 text-white">{r.score}</td>
                        <td className="py-3 px-2 text-slate-400">{r.timeTaken}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'questions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-up">
          <div className="lg:col-span-4">
            <form onSubmit={handleSaveQuestion} className="card p-6 sticky top-10">
              <h3 className="text-lg font-bold text-white mb-6">{editingId ? 'Edit' : 'Add'} Question</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Question Text</label>
                  <textarea value={qForm.question} onChange={e => setQForm({ ...qForm, question: e.target.value })} className="input-field h-24 resize-none" placeholder="..." required />
                </div>
                {qForm.options.map((opt, i) => (
                  <div key={i}>
                    <label className="label">Option {i + 1}</label>
                    <input type="text" value={opt} onChange={e => {
                      const opts = [...qForm.options]
                      opts[i] = e.target.value
                      setQForm({ ...qForm, options: opts })
                    }} className="input-field" required />
                  </div>
                ))}
                <div>
                  <label className="label">Correct Answer</label>
                  <select value={qForm.answer} onChange={e => setQForm({ ...qForm, answer: e.target.value })} className="input-field text-white" required>
                    <option value="">Select Option</option>
                    {qForm.options.filter(o => o.trim()).map((o, i) => (
                      <option key={i} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="btn-primary flex-1">{editingId ? 'Update' : 'Save'}</button>
                  {editingId && <button type="button" onClick={() => { setEditingId(null); setQForm({ question: '', options: ['', '', '', ''], answer: '' }) }} className="btn-secondary">Cancel</button>}
                </div>
              </div>
            </form>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-lg font-bold text-white px-2">Total Questions: {questions.length}</h3>
            {questions.map((q, idx) => (
              <div key={q._id} className="card p-6 border-l-4 border-l-brand-600 transition-all hover:bg-slate-900/50">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-white font-medium mb-4"><span className="text-slate-500 mr-2">{idx + 1}.</span>{q.question}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((o, i) => (
                        <div key={i} className={`px-3 py-2 rounded-lg text-xs border ${o === q.answer ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' : 'bg-slate-800/50 border-slate-700/50 text-slate-500'}`}>
                          {o}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingId(q._id); setQForm({ question: q.question, options: [...q.options], answer: q.answer }) }} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-[#4FB3FF] transition-colors">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDeleteQuestion(q._id)} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </div>
    )
}