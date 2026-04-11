import React, { useState } from 'react';
import { Zap, Radio, Moon, Users, CheckCircle2 } from 'lucide-react';
import AdminTimer from './AdminTimer';
import ParticipantRow from './ParticipantRow';
import Counter from '../counter';

const SessionControlTab = ({
  quizId, setQuizId, duration, setDuration, allowTabSwitching, setAllowTabSwitching,
  fetchStatus, handleCreate, handleStart, handleStop, loading, status,
  participantCount, participants, sessionInfo, socketConnected
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
    <div className="space-y-6 animate-slide-up">
      <div className="card p-6">
        <h2 className="text-lg font-bold text-white mb-4">Manage Quiz Session</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mt-4">
          {/* Socket Connection Status */}
          <div className="lg:col-span-2 flex items-center gap-3 bg-white/5 p-2 px-3 rounded-lg border border-white/10">
             <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
             <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
               Real-time Data Stream: {socketConnected ? 'Connected' : 'Disconnected / Reconnecting...'}
             </p>
          </div>

          {/* Left: Input Controls */}
          <div className="space-y-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="label uppercase tracking-widest text-[9px] text-white/50 font-bold">Session Code</label>
                  {status === null && (
                    <button 
                      onClick={() => setQuizId(Math.floor(100000 + Math.random() * 900000).toString())}
                      className="text-[#4fb3ff] text-[8px] uppercase font-bold hover:text-white transition-colors cursor-pointer"
                    >
                      Regenerate
                    </button>
                  )}
                </div>
                <div className="bg-[#0A0A0A]/80 border border-white/10 text-white py-1.5 text-lg font-mono text-center tracking-[0.3em] font-black rounded-lg select-all">
                  {quizId.length === 6 && /^\d+$/.test(quizId) ? `${quizId.substring(0,3)}-${quizId.substring(3)}` : quizId}
                </div>
              </div>
              <div className="w-20">
                <label className="label uppercase tracking-widest text-[9px] text-white/50 font-bold mb-1.5">Mins</label>
                <input
                  type="number"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="input-field bg-white/5 border-white/10 text-white py-1.5 text-sm focus:border-[#4fb3ff] transition-all rounded-lg"
                />
              </div>
              <div className="flex-col flex items-center justify-center mb-2">
                <label className="text-[8px] text-white/40 uppercase font-bold mb-2 tracking-tight border-b border-white/5 pb-1">Allow Tab</label>
                <button
                  onClick={() => setAllowTabSwitching(!allowTabSwitching)}
                  className={`w-10 h-5 rounded-full transition-all duration-300 relative ${allowTabSwitching ? 'bg-emerald-500 ' : 'bg-white/20'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${allowTabSwitching ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              <button
                onClick={fetchStatus}
                className="btn-primary mt-6 text-white text-xs font-bold px-3 h-[34px] whitespace-nowrap flex items-center rounded-lg active:scale-95 transition-all"
              >
                Fetch
              </button>
            </div>

            <div className="pt-2 grid grid-cols-1 gap-3">
              <button onClick={handleCreate} disabled={loading} className="btn-primary w-full text-xs text-white font-montserrat uppercase py-3 active:scale-[0.98] transition-all rounded-lg">Create Session</button>
              <button onClick={handleStart} disabled={loading || status === true || status === null} className="btn-primary w-full border-[#98E19A]/50 text-xs font-montserrat uppercase py-3 text-white hover:opacity-90 disabled:opacity-30 active:scale-[0.98] transition-all rounded-lg">Launch Quiz</button>
              <button onClick={handleStop} disabled={loading || status === false || status === null} className="btn-primary w-full border-[#FF7575]/50 text-xs font-montserrat uppercase py-3 text-white hover:opacity-90 disabled:opacity-30 active:scale-[0.98] transition-all rounded-lg">Terminate Quiz</button>
            </div>
          </div>

          {/* Right: Live Monitor Section */}
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border transition-all duration-500 flex items-center justify-between ${status === true ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
              <div>
                <p className="text-[10px] text-white uppercase font-bold mb-0.5 tracking-[0.2em]">Session Health</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${status === true ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
                  <p className={`text-lg font-bold tracking-tight ${status === true ? 'text-emerald-400' : 'text-red-400'}`}>
                    {status === true ? 'LIVE' : status === false ? 'OFFLINE' : 'PENDING'}
                  </p>
                </div>
              </div>
              <div className="text-white">
                {status === true ? <Radio className="text-emerald-400 animate-pulse" size={24} /> : <Moon className="text-white" size={24} />}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-[10px] text-white uppercase font-bold mb-1 tracking-widest">Active Pool</p>
                  <div className="flex items-center -ml-2 gap-3">
                    <Counter 
                      value={participantCount} 
                      fontSize={32} 
                      textColor="white" 
                      gradientHeight={0}
                      containerStyle={{ display: 'inline-flex' }}
                    />
                    <span className="text-white/20 text-[10px] font-mono self-end mb-1">/ RAW: {participantCount}</span>
                  </div>
                </div>
                <div className="text-white">
                  <Users size={24} />
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
                    className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${pTab === b.id ? 'bg-[#4FB3FF] text-white' : 'text-white/30 hover:text-white'}`}
                  >
                    {b.label} ({b.count})
                  </button>
                ))}
              </div>


              {/* Scrollable list of student sessions */}
              <div className="max-h-[280px] overflow-y-auto pr-1 space-y-2 mt-2 custom-scrollbar">
                {filteredParticipants.length > 0 ? filteredParticipants.map((p, idx) => (
                  <ParticipantRow key={p.studentId || idx} p={p} idx={idx} />
                )) : (
                  <div className="py-12 text-center opacity-30 italic text-xs">
                    No participant data available for this selection
                  </div>
                )}
              </div>
            </div>

            {sessionInfo && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <p className="text-[9px] text-white/40 uppercase font-bold tracking-[0.2em] border-b border-white/5 pb-2">Live Session Telemetry</p>

                {status && sessionInfo.quizDetails?.startedAt && (
                  <div className="flex justify-between items-center bg-[#4fb3ff]/10 p-3 rounded-lg border border-[#4fb3ff]/20">
                    <span className="text-[#4fb3ff] text-[10px] font-bold uppercase tracking-widest">Global Clock</span>
                    <div className="text-sm">
                      <AdminTimer
                        startedAt={sessionInfo.quizDetails.startedAt}
                        duration={sessionInfo.quizDetails.duration}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-white/40 text-[9px] uppercase font-bold block mb-1">Total Pool Questions</span>
                    <span className="text-white font-bold text-base">{sessionInfo.totalQuestions}</span>
                  </div>
                  <div>
                    <span className="text-white/40 text-[9px] uppercase font-bold block mb-1">Time Constraints</span>
                    <span className="text-white font-bold text-base">{sessionInfo.quizDetails.duration}m</span>
                  </div>
                </div>

                <div className="pt-1">
                  <div className={`flex items-center justify-between p-2.5 rounded-lg border ${allowTabSwitching ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                    <span className="text-slate-400 text-[10px] font-bold">ANTI-CHEAT LOCK</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${allowTabSwitching ? 'text-amber-500' : 'text-emerald-400'}`}>
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
