import React from 'react';
import { LayoutDashboard, Zap, Trash2, Calendar, Clock, Radio, Power } from 'lucide-react';

const SessionHistoryTab = ({ quizzes, fetchQuizzes, setQuizId, setTab, fetchStatus, handleDeleteQuiz }) => {
  return (
    <div className="grid gap-8 animate-slide-up">
      <div className="card bg-[#0f0f0f]/50  p-10 ">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-[#4fb3ff]/10 p-4 rounded-2xl border border-[#4fb3ff]/20 text-[#4fb3ff]">
              <LayoutDashboard size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-widest uppercase">Vault Sessions</h2>
              <p className="text-slate-500 text-sm mt-1.5 font-bold tracking-widest uppercase">Historical Session Index & Telemetry</p>
            </div>
          </div>
          <button 
            onClick={fetchQuizzes}
            className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 text-white/50 hover:text-white hover:bg-white/10 active:scale-95 transition-all uppercase text-[10px] font-black tracking-widest"
            title="Synchronize Database"
          >
            <Zap size={18} className="text-[#4fb3ff]" />
            Refresh Vault
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/[0.05] bg-white/[0.02]">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/[0.05]">
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Session Identity</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Temporal Stamp</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">System Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {quizzes.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-32 text-center">
                    <LayoutDashboard size={64} className="mx-auto mb-4 text-slate-900 animate-pulse" />
                    <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-lg">Vault Index Empty</p>
                    <p className="text-slate-800 text-[10px] font-bold mt-2 uppercase">Create your initial quiz session to begin archival</p>
                  </td>
                </tr>
              ) : (
                quizzes.map((q) => (
                  <tr key={q._id} className="group hover:bg-white/[0.04] transition-all">
                    <td className="px-8 py-7">
                      <div className="flex items-center gap-4">
                         <div className="w-2 h-10 bg-[#4fb3ff]/10 rounded-full group-hover:bg-[#4fb3ff] transition-all duration-300" />
                         <span className="font-display font-black text-2xl text-white tracking-[0.1em] group-hover:text-[#4fb3ff] transition-colors">
                           {q.quizId}
                         </span>
                      </div>
                    </td>
                    <td className="px-8 py-7 text-slate-400 font-bold text-xs uppercase tracking-tight">
                      <div className="flex items-center gap-2 mb-1">
                         <Calendar size={12} className="text-slate-600" /> {new Date(q.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                         <Clock size={12} className="text-slate-600" /> {new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 border  ${q.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 ' : 'bg-slate-500/10 text-slate-500 border-slate-500/10'}`}>
                        {q.isActive ? <Radio size={10} className="animate-pulse" /> : <Power size={10} />}
                        {q.isActive ? 'Live Session' : 'Offline Session'}
                      </div>
                    </td>
                    <td className="px-8 py-7">
                       <div className="flex items-center justify-end gap-4">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuizId(q.quizId);
                              setTab('control');
                              fetchStatus(q.quizId);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="bg-white/5 px-6 py-2.5 rounded-xl border border-white/10 text-white hover:text-[#0f0f0f] hover:bg-white hover:border-white font-bold uppercase text-[10px] tracking-widest transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 "
                          >
                            Load Blueprint
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuiz(q.quizId);
                            }}
                            className="p-2 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 group-hover:delay-75 "
                            title="Destroy Archival Data"
                          >
                            <Trash2 size={13} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SessionHistoryTab;
