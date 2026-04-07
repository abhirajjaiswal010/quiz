import { useState, useEffect } from 'react'
import { LayoutDashboard, Zap, BookOpen, Radio, Moon, Users, Pencil, Trash2, LogOut, CheckCircle2, Trophy, FileJson, Upload } from 'lucide-react'
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
  loading, status, participantCount, participants, sessionInfo, leaderboard, handleLogout,
  questions, quizzes, fetchQuizzes, qForm, setQForm, handleSaveQuestion, editingId, setEditingId, handleDeleteQuestion,
  handleDeleteQuiz, handleBulkUpload
}) {
  const [pTab, setPTab] = useState('all') // all | doing | done

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result)
        handleBulkUpload(json)
      } catch (err) {
        alert('Invalid JSON file')
      }
    }
    reader.readAsText(file)
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const filteredParticipants = participants.filter(p => {
    if (pTab === 'doing') return !p.isSubmitted
    if (pTab === 'done') return p.isSubmitted
    return true
  })

  // Counts
  const countDoing = participants.filter(p => !p.isSubmitted).length
  const countDone = participants.filter(p => p.isSubmitted).length
  const countAll = participants.length

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
        <button onClick={() => { setTab('history'); fetchQuizzes(); }} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${tab === 'history' ? 'bg-[#4FB3FF] text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
          <LayoutDashboard size={16} />
          Recent Sessions
        </button>
        <button onClick={() => setTab('leaderboard')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${tab === 'leaderboard' ? 'bg-[#4FB3FF] text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
          <Trophy size={16} />
          Leaderboard
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
                   <button onClick={handleCreate} disabled={loading} className="btn-primary w-full bg-white text-black font-bold uppercase py-4 shadow-xl hover:bg-white/90 transition-all">Create New Quiz</button>
                   <button onClick={handleStart} disabled={loading || status === true || status === null} className="btn-primary w-full bg-[#98E19A] border-[#98E19A]/50 font-bold uppercase py-4 text-black hover:opacity-90 disabled:opacity-30 transition-all">Start Quiz</button>
                   <button onClick={handleStop} disabled={loading || status === false || status === null} className="btn-primary w-full bg-[#FF7575] border-[#FF7575]/50 font-bold uppercase py-4 text-white hover:opacity-90 disabled:opacity-30 transition-all">Stop Quiz</button>
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

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-widest">Participants</p>
                      <p className="text-2xl font-bold text-white">{participantCount}</p>
                    </div>
                    <div className="text-white">
                      <Users size={28} />
                    </div>
                  </div>

                  {/* Tab Switches */}
                  <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                    <button 
                      onClick={() => setPTab('all')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${pTab === 'all' ? 'bg-[#4FB3FF] text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                      All ({countAll})
                    </button>
                    <button 
                      onClick={() => setPTab('doing')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${pTab === 'doing' ? 'bg-[#4FB3FF] text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                      Doing ({countDoing})
                    </button>
                    <button 
                      onClick={() => setPTab('done')}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${pTab === 'done' ? 'bg-[#4FB3FF] text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                    >
                      Done ({countDone})
                    </button>
                  </div>

                  {/* Joined Names List */}
                  {filteredParticipants && filteredParticipants.length > 0 ? (
                    <div className="max-h-[320px] overflow-y-auto pr-2 space-y-2 mt-2 custom-scrollbar">
                      {filteredParticipants.map((p, idx) => (
                        <div key={p.roll || idx} className="flex justify-between items-center bg-white/5 p-2.5 rounded-xl border border-white/5 animate-fade-in">
                           <div className="min-w-0">
                             <p className="text-xs font-bold text-white truncate">{p.name}</p>
                             <div className="flex items-center gap-2">
                               <p className="text-[10px] text-slate-500">{p.roll}</p>
                               {p.isSubmitted && (
                                 <CheckCircle2 size={12} className="text-emerald-500" />
                               )}
                             </div>
                           </div>
                           <span className="text-[9px] text-slate-600 font-mono">
                             {new Date(p.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                       <p className="text-xs text-slate-600 font-medium">No students found in this category</p>
                    </div>
                  )}
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
        </div>
      )}

      {tab === 'leaderboard' && (
        <div className="animate-slide-up">
          <div className="card p-8 min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Session Leaderboard</h3>
                <p className="text-slate-500 text-sm mt-1">Real-time standings for Quiz ID: <span className="text-brand-400 font-mono uppercase font-bold">{quizId}</span></p>
              </div>
              <div className="bg-brand-500/10 p-4 rounded-2xl border border-brand-500/20 text-brand-400">
                 <Trophy size={32} />
              </div>
            </div>

            {leaderboard.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="text-left py-4 px-4">Rank</th>
                      <th className="text-left py-4 px-4">Student</th>
                      <th className="text-left py-4 px-4">Accuracy</th>
                      <th className="text-left py-4 px-4">Score</th>
                      <th className="text-left py-4 px-4 text-right">Time Taken</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {leaderboard.map((r, i) => {
                      const isTop3 = i < 3
                      const rankColors = ['text-yellow-400', 'text-slate-300', 'text-amber-600']
                      return (
                        <tr key={r.roll} className="group hover:bg-white/5 transition-colors">
                          <td className={`py-5 px-4 font-black text-xl ${isTop3 ? rankColors[i] : 'text-slate-500'}`}>
                            #{i + 1}
                          </td>
                          <td className="py-5 px-4">
                            <div className="text-white font-bold group-hover:text-brand-400 transition-colors">{r.name}</div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">{r.roll}</div>
                          </td>
                          <td className="py-5 px-4">
                            <span className="text-white font-medium">{r.correctAnswers || 0}</span>
                            <span className="text-slate-500 text-[10px]"> / {r.totalQuestions || 0}</span>
                          </td>
                          <td className="py-5 px-4">
                             <span className="bg-brand-500/10 text-brand-400 px-3 py-1 rounded-lg font-black border border-brand-500/20">
                               {r.score}
                             </span>
                          </td>
                          <td className="py-5 px-4 text-right">
                             <span className="text-slate-400 text-xs font-mono">{r.timeTaken}s</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                 <div className="text-6xl mb-4">🏆</div>
                 <p className="text-white font-bold text-lg">No Results Yet</p>
                 <p className="text-slate-500 text-sm mt-1">Leaderboard will update automatically as students submit.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'questions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-up">
          <div className="lg:col-span-4 space-y-6">
            <form onSubmit={handleSaveQuestion} className="card p-6 sticky top-10">
              <h3 className="text-lg font-bold text-white mb-6 tracking-tight">{editingId ? 'Update' : 'Create'} Question</h3>
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
                <button type="submit" disabled={loading} className="btn-primary w-full py-4 uppercase tracking-widest font-black flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} />
                  {editingId ? 'Update' : 'Save'} Question
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setQForm({ question: '', options: ['', '', '', ''], answer: '' }) }} className="btn-secondary w-full py-2 text-xs opacity-50 uppercase font-black">Cancel Edit</button>
                )}
              </div>
            </form>

            {/* BULK UPLOAD CARD */}
            {!editingId && (
              <div className="card p-6 border-brand-400/20 bg-brand-400/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-brand-500/20 p-2 rounded-lg text-brand-400">
                    <FileJson size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Bulk Import</h4>
                    <p className="text-[10px] text-slate-500">Fast-track with JSON</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-6">
                  Replace existence questions by uploading a <code>questions.json</code> file. Ensure the format matches the system schema.
                </p>
                <div className="relative group cursor-pointer group-hover:border-brand-400">
                   <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-2xl hover:border-brand-400/50 hover:bg-brand-400/10 transition-all cursor-pointer">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                         <Upload className="w-8 h-8 mb-3 text-slate-500 group-hover:text-brand-400 transition-colors" />
                         <p className="text-xs font-bold text-slate-500 group-hover:text-white">Choose JSON File</p>
                         <p className="text-[9px] text-slate-600 mt-1 uppercase font-black tracking-tighter">Click to browse</p>
                      </div>
                      <input type="file" accept=".json" className="hidden" onChange={handleFileSelect} />
                   </label>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest mb-2">JSON Format Hint</p>
                  <pre className="text-[8px] bg-black/50 p-3 rounded-lg text-brand-300 font-mono overflow-x-auto">
                    {`[`} <br/>
                    {`  {`} <br/>
                    {`    "question": "Text",`} <br/>
                    {`    "options": ["A", "B", "C", "D"],`} <br/>
                    {`    "answer": "A"`} <br/>
                    {`  }`} <br/>
                    {`]`}
                  </pre>
                </div>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-8">
            <div className="card min-h-[500px]">
               <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white tracking-tight">Active Question Bank</h3>
                  <div className="bg-white/5 px-3 py-1 rounded-full border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {questions.length} Questions
                  </div>
               </div>
               <div className="divide-y divide-white/5 max-h-[800px] overflow-y-auto custom-scrollbar">
                  {questions.length > 0 ? (
                    questions.map((q, idx) => (
                      <div key={q._id} className="p-6 hover:bg-white/5 transition-colors group">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <span className="text-[9px] font-black text-brand-400 uppercase tracking-widest mb-2 block items-center gap-2">
                              Question #{idx + 1}
                            </span>
                            <h4 className="text-white font-bold text-md leading-relaxed mb-4">{q.question}</h4>
                            <div className="grid grid-cols-2 gap-2">
                               {q.options.map((opt, i) => (
                                 <div key={i} className={`px-4 py-2 rounded-lg text-[10px] font-bold border transition-colors ${opt === q.answer ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/5 text-slate-500'}`}>
                                    {String.fromCharCode(65 + i)}. {opt}
                                 </div>
                               ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => {
                              setEditingId(q._id)
                              setQForm({ question: q.question, options: q.options, answer: q.answer })
                            }} className="p-2.5 bg-brand-500/10 text-brand-400 rounded-xl border border-brand-500/20 hover:bg-brand-500 hover:text-white transition-all">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => handleDeleteQuestion(q._id)} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
                       <BookOpen size={64} className="mb-4 text-slate-500" />
                       <h4 className="text-white font-black uppercase tracking-widest">Question Bank Empty</h4>
                       <p className="text-slate-600 text-xs max-w-[200px] mx-auto mt-2 italic">Add questions manually or use bulk import to get started.</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}

        {tab === 'history' && (
          <div className="grid gap-6 animate-slide-up">
            <div className="card bg-[#0f0f0f]/40 backdrop-blur-md border-white/10 p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <LayoutDashboard className="text-[#4FB3FF]" />
                    Recent Sessions
                  </h2>
                  <p className="text-slate-500 text-sm">Review previous quiz IDs and their current status</p>
                </div>
                <button 
                  onClick={fetchQuizzes}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"
                  title="Refresh List"
                >
                  <Zap size={20} />
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Quiz ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Created</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {quizzes.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-20 text-center text-slate-500">
                          No sessions found. Create a quiz to get started!
                        </td>
                      </tr>
                    ) : (
                      quizzes.map((q) => (
                        <tr key={q._id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-5">
                            <span className="font-display font-black text-[#4FB3FF] text-lg tracking-wider bg-[#4FB3FF]/10 px-3 py-1 rounded-lg">
                              {q.quizId}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-slate-300">
                            {new Date(q.createdAt).toLocaleDateString()} at {new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${q.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-white/10'}`}>
                              {q.isActive ? 'Active' : 'Completed'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right flex items-center justify-end gap-3">
                            <button 
                              onClick={() => {
                                setQuizId(q.quizId);
                                setTab('control');
                                fetchStatus(q.quizId); // pass ID directly
                              }}
                              className="text-white hover:text-[#4FB3FF] text-xs font-bold uppercase transition-all opacity-0 group-hover:opacity-100 bg-white/5 px-4 py-2 rounded-lg"
                            >
                              Load
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteQuiz(q.quizId);
                              }}
                              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              title="Delete Session"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    )
}