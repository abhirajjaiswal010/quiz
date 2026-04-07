import React, { useState } from 'react';
import { Zap, Radio, Moon, Users, CheckCircle2 } from 'lucide-react';
import AdminTimer from './AdminTimer';
import ParticipantRow from './ParticipantRow';

const SessionControlTab = ({
  quizId, setQuizId, duration, setDuration, allowTabSwitching, setAllowTabSwitching,
  fetchStatus, handleCreate, handleStart, handleStop, loading, status, 
  participantCount, participants, sessionInfo
}) => {
  const [pTab, setPTab] = useState('all'); // all | doing | done

  const filteredParticipants = participants.filter(p => {
    if (pTab === 'doing') return !p.isSubmitted;
    if (pTab === 'done') return p.isSubmitted;
    return true;
  });

  const countDoing = participants.filter(p => !p.isSubmitted).length;
  const countDone = participants.filter(p => p.isSubmitted).length;
  const countAll = participants.length;

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="card p-8">
        <h2 className="text-xl font-bold text-white mb-6">Manage Quiz Session</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left: Input Controls */}
          <div className="space-y-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="label uppercase tracking-widest text-[10px] text-slate-500 font-bold mb-1.5">Unique Quiz ID</label>
                <input 
                  type="text" 
                  value={quizId} 
                  onChange={e => setQuizId(e.target.value)} 
                  placeholder="e.g. HACK-24" 
                  className="input-field bg-white/5 border-white/10 uppercase text-white py-2.5 text-sm focus:border-[#4fb3ff] transition-all rounded-xl" 
                />
              </div>
              <div className="w-24">
                <label className="label uppercase tracking-widest text-[10px] text-slate-500 font-bold mb-1.5">Mins</label>
                <input 
                  type="number" 
                  value={duration} 
                  onChange={e => setDuration(e.target.value)} 
                  className="input-field bg-white/5 border-white/10 text-white py-2.5 text-sm focus:border-[#4fb3ff] transition-all rounded-xl" 
                />
              </div>
              <div className="flex-col flex items-center justify-center mb-3">
                <label className="text-[9px] text-slate-500 uppercase font-bold mb-3 tracking-tight border-b border-white/5 pb-1">Allow Tab</label>
                <button 
                  onClick={() => setAllowTabSwitching(!allowTabSwitching)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 relative ${allowTabSwitching ? 'bg-emerald-500 ' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${allowTabSwitching ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <button 
                onClick={fetchStatus} 
                className="btn-primary  mt-7 text-white font-bold px-4 h-[42px] whitespace-nowrap flex items-center rounded-xl active:scale-95 transition-all"
              >
                Fetch
              </button>
            </div>
            
            <div className="pt-4 grid grid-cols-1 gap-4">
              <button onClick={handleCreate} disabled={loading} className="btn-primary w-full  text-white font-monserrat uppercase py-4 shadow-xl  active:scale-[0.98] transition-all rounded-xl ">Create Session</button>
              <button onClick={handleStart} disabled={loading || status === true || status === null} className="btn-primary w-full  border-[#98E19A]/50 font-monserrat uppercase py-4 text-white hover:opacity-90 disabled:opacity-30 active:scale-[0.98] transition-all rounded-xl ">Launch Quiz</button>
              <button onClick={handleStop} disabled={loading || status === false || status === null} className="btn-primary w-full  border-[#FF7575]/50 font-monserrat uppercase py-4 text-white hover:opacity-90 disabled:opacity-30 active:scale-[0.98] transition-all rounded-xl ">Terminate Quiz</button>
            </div>
          </div>

          {/* Right: Live Monitor Section */}
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border transition-all duration-500 flex items-center justify-between ${status === true ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold mb-1 tracking-[0.2em]">Session Health</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${status === true ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
                  <p className={`text-xl font-black tracking-tight ${status === true ? 'text-emerald-400' : 'text-red-400'}`}>
                    {status === true ? 'LIVE' : status === false ? 'OFFLINE' : 'PENDING'}
                  </p>
                </div>
              </div>
              <div className="text-white">
                {status === true ? <Radio className="text-emerald-400 animate-pulse" size={28} /> : <Moon className="text-slate-500" size={28} />}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-4 ">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-black mb-1 tracking-widest">Active Pool</p>
                  <p className="text-3xl font-black text-white">{participantCount}</p>
                </div>
                <div className="text-[#4fb3ff]">
                  <Users size={32} />
                </div>
              </div>

              {/* Toggles for Participant View */}
              <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5 overflow-hidden">
                {[
                  { id: 'all', label: 'Total', count: countAll },
                  { id: 'doing', label: 'In Progress', count: countDoing },
                  { id: 'done', label: 'Finalized', count: countDone }
                ].map(b => (
                  <button 
                    key={b.id}
                    onClick={() => setPTab(b.id)}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${pTab === b.id ? 'bg-[#4FB3FF] text-[#0f0f0f] shadow-lg' : 'text-slate-500 hover:text-white'}`}
                  >
                    {b.label} ({b.count})
                  </button>
                ))}
              </div>


              {/* Scrollable list of student sessions */}
              <div className="max-h-[280px] overflow-y-auto pr-1 space-y-2 mt-2 custom-scrollbar">
                {filteredParticipants.length > 0 ? filteredParticipants.map((p, idx) => (
                  <ParticipantRow key={p.roll || idx} p={p} idx={idx} />
                )) : (
                  <div className="py-12 text-center opacity-30 italic text-xs">
                     No participant data available for this selection
                  </div>
                )}
              </div>
            </div>

            {sessionInfo && (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <p className="text-[11px] text-slate-500 uppercase font-black tracking-[0.2em] border-b border-white/5 pb-2.5">Live Session Telemetry</p>
                
                {status && sessionInfo.quizDetails?.startedAt && (
                  <div className="flex justify-between items-center bg-[#4fb3ff]/10 p-4 rounded-xl border border-[#4fb3ff]/20">
                    <span className="text-[#4fb3ff] text-xs font-black uppercase tracking-widest">Global Clock</span>
                    <AdminTimer 
                      startedAt={sessionInfo.quizDetails.startedAt} 
                      duration={sessionInfo.quizDetails.duration} 
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Total Pool Questions</span>
                    <span className="text-white font-black text-lg">{sessionInfo.totalQuestions}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Time Constrains</span>
                    <span className="text-white font-black text-lg">{sessionInfo.quizDetails.duration}m</span>
                  </div>
                </div>
                
                <div className="pt-2">
                   <div className={`flex items-center justify-between p-3 rounded-xl border ${allowTabSwitching ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                      <span className="text-slate-400 text-xs font-bold">ANTI-CHEAT LOCK</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${allowTabSwitching ? 'text-amber-500' : 'text-emerald-400'}`}>
                        {allowTabSwitching ? 'Unlocked' : 'Strict Mode'}
                      </span>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionControlTab;
