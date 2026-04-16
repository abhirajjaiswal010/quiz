import React, { useState } from 'react';
import { Zap, Radio, Moon, Users, CheckCircle2, RefreshCw } from 'lucide-react';
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
    <div className="space-y-6 animate-slide-up text-white">
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8">
        <h2 className="text-xl font-normal text-white mb-6 uppercase tracking-wide">Session Console</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
          {/* Socket Connection Status */}
          <div className="lg:col-span-2 flex items-center gap-3 bg-white/5 p-3 px-4 rounded-lg border border-white/5">
            <div className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-white shadow-[0_0_8px_white] animate-pulse' : 'bg-red-500'}`} />
            <p className="text-[10px] font-light text-white uppercase tracking-[0.2em]">
              Real-time Data Stream: {socketConnected ? 'Stable' : 'Offline'}
            </p>
          </div>

          {/* Left: Input Controls */}
          <div className="space-y-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] text-white uppercase tracking-[0.2em] font-light">Session Code</label>
                </div>
                <div className="relative group/code">
                  <div className="bg-white/5 border border-white/10 text-white text-2xl font-mono flex items-center justify-center tracking-[0.1em] rounded-xl select-all h-[64px]">
                    {quizId.length === 6 && /^\d+$/.test(quizId) ? `${quizId.substring(0, 3)}-${quizId.substring(3)}` : quizId}
                  </div>
                  {status !== true && (
                    <button
                      onClick={() => setQuizId(Math.floor(100000 + Math.random() * 900000).toString())}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-white/0 hover:bg-white/10 text-white hover:text-white transition-all group-hover/code:text-white"
                      title="Regenerate Code"
                    >
                      <RefreshCw size={18} strokeWidth={1.5} className="transition-transform active:rotate-180 duration-500" />
                    </button>
                  )}
                </div>
              </div>
              <div className="w-20">
                <label className="text-[10px] text-white  uppercase tracking-[0.2em] font-light mb-2 block">Duration</label>
                <input
                  type="number"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white text-center text-2xl font-mono focus:border-white transition-all rounded-xl outline-none h-[64px] p-0"
                />
              </div>
              <div className="flex flex-col items-center ">
                <label className="text-[9px] text-white uppercase font-light mb-7 tracking-[0.2em]">Anti-Cheat</label>
                <button
                  onClick={() => setAllowTabSwitching(!allowTabSwitching)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 relative border ${!allowTabSwitching ? 'bg-white border-white' : 'bg-white/10 border-white/20'}`}
                  title={!allowTabSwitching ? "Anti-Cheat: ACTIVE" : "Anti-Cheat: DISABLED"}
                >
                  <div className={`absolute top-1 w-3.5 h-3.5 rounded-full transition-all duration-300 ${!allowTabSwitching ? 'left-7 bg-black' : 'left-1 bg-white'}`} />
                </button>
              </div>
            </div>

            <div className="pt-4 grid grid-cols-1 gap-3 pb-6">
              <button onClick={handleCreate} disabled={loading} className="w-full py-4 text-[11px] uppercase tracking-[0.2em] font-normal border border-white/10 hover:bg-white hover:text-black transition-all rounded-xl">Init Session</button>
              <button onClick={handleStart} disabled={loading || status === true || status === null} className="w-full py-4 text-[11px] uppercase tracking-[0.2em] font-normal border border-white/10 hover:bg-white hover:text-black transition-all rounded-xl disabled:opacity-20">Activate</button>
              <button onClick={handleStop} disabled={loading || status === false || status === null} className="w-full py-4 text-[11px] uppercase tracking-[0.2em] font-normal border border-white/10 hover:bg-red-500 hover:text-white transition-all rounded-xl disabled:opacity-20">Terminate</button>
            </div>

            {sessionInfo && (
              <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4 animate-slide-up">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <p className="text-[10px] text-white uppercase font-normal tracking-[0.2em]">Live Session Telemetry</p>
                  <Radio size={14} className="text-white" />
                </div>

                {status && sessionInfo.quizDetails?.startedAt && (
                  <div className="flex justify-between items-center bg-white/[0.03] p-4 rounded-lg border border-white/10">
                    <span className="text-white text-[10px] uppercase tracking-widest font-light">Global Sequence</span>
                    <div className="text-lg font-mono">
                      <AdminTimer
                        startedAt={sessionInfo.quizDetails.startedAt}
                        duration={sessionInfo.quizDetails.duration}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] p-3 rounded-lg border border-white/5">
                    <span className="text-white text-[8px] uppercase font-normal block mb-1">Total Vectors</span>
                    <span className="text-white font-normal text-lg font-mono">{sessionInfo.totalQuestions}</span>
                  </div>
                  <div className="bg-white/[0.02] p-3 rounded-lg border border-white/5">
                    <span className="text-white text-[8px] uppercase font-normal block mb-1">Allocated Time</span>
                    <span className="text-white font-normal text-lg font-mono">{sessionInfo.quizDetails.duration}M</span>
                  </div>
                </div>

                <div className={`p-3 rounded-lg border flex items-center justify-between ${allowTabSwitching ? 'bg-amber-500/5 border-amber-500/10' : 'bg-emerald-500/5 border-emerald-500/10'}`}>
                  <span className="text-white text-[9px] uppercase font-normal">ANTI-CHEAT LOCK</span>
                  <span className={`text-[8px] font-normal uppercase ${allowTabSwitching ? 'text-amber-500' : 'text-emerald-400'}`}>
                    {allowTabSwitching ? 'Inactive' : 'Secured'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Live Monitor Section */}
          <div className="space-y-6 flex flex-col h-full">
            <div className={`p-6 rounded-2xl border transition-all duration-500 flex items-center justify-between ${status === true ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10'}`}>
              <div>
                <p className={`text-[10px] uppercase font-normal mb-1 tracking-[0.2em] ${status === true ? 'text-black' : 'text-white'}`}>Session Status</p>
                <div className="flex items-center gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full ${status === true ? 'bg-black animate-pulse' : 'bg-white'}`} />
                  <p className="text-xl font-normal tracking-tight">
                    {status === true ? 'ACTIVE' : status === false ? 'STANDBY' : 'PENDING'}
                  </p>
                </div>
              </div>
              <div>
                {status === true ? <Zap className="text-black" size={24} fill="currentColor" /> : <Moon className="text-white" size={24} />}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-6 flex-1 h-full min-h-[400px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-white uppercase font-light mb-2 tracking-[0.2em]">Participant Pool</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-light tracking-tight">{participantCount < 10 ? `0${participantCount}` : participantCount}</span>
                    <span className="text-white text-[10px] font-mono tracking-widest self-end pb-1.5 uppercase">Participants Attached</span>
                  </div>
                </div>
                <div className="text-white">
                  <Users size={32} strokeWidth={1} />
                </div>
              </div>

              {/* Toggles for Participant View */}
              <div className="flex gap-2 bg-white/5 p-1.5 rounded-xl border border-white/5">
                {[
                  { id: 'all', label: 'All', count: countAll },
                  { id: 'doing', label: 'Queued', count: countDoing },
                  { id: 'done', label: 'Finished', count: countDone }
                ].map(b => (
                  <button
                    key={b.id}
                    onClick={() => setPTab(b.id)}
                    className={`flex-1 py-2 rounded-lg text-[9px] uppercase tracking-[0.2em] transition-all font-normal ${pTab === b.id ? 'bg-white text-black' : 'text-white hover:text-white'}`}
                  >
                    {b.label} ({b.count})
                  </button>
                ))}
              </div>


              {/* Scrollable list of student sessions - Fixed height to show scrollbar from 4 participants */}
              <div className="h-[280px] overflow-y-auto pr-1 space-y-2 mt-2 custom-scrollbar">
                {filteredParticipants.length > 0 ? filteredParticipants.map((p, idx) => (
                  <ParticipantRow key={p.studentId || idx} p={p} idx={idx} />
                )) : (
                  <div className="py-32 text-center opacity-30 italic text-[10px] uppercase tracking-widest">
                    Awaiting Student Connections
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionControlTab;
