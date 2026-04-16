import React from 'react';
import { LayoutDashboard, Zap, Trash2, Calendar, Clock, Radio, Power } from 'lucide-react';

const SessionHistoryTab = ({ quizzes, fetchQuizzes, setQuizId, setTab, fetchStatus, handleDeleteQuiz }) => {
  return (
    <div className="grid gap-8 animate-slide-up text-white">
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-10 min-h-[500px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-6">
            <div className="bg-white/5 p-4 rounded-full border border-white/10 text-white">
              <LayoutDashboard size={28} strokeWidth={1} />
            </div>
            <div>
              <h2 className="text-2xl font-normal text-white tracking-widest uppercase">Archive Vault</h2>
              <p className="text-white/20 text-[10px] mt-2 tracking-[0.2em] uppercase font-light">Historical Session Registry</p>
            </div>
          </div>
          <button 
            onClick={fetchQuizzes}
            className="flex items-center gap-2.5 px-6 py-2.5 rounded-lg border border-white/10 text-white hover:text-white hover:bg-white/5 active:scale-95 transition-all uppercase text-[9px] tracking-[0.2em]"
          >
            <Zap size={14} strokeWidth={1.5} />
            Refresh Archive
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.01]">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.05] text-white/20 uppercase tracking-[0.3em] text-[9px]">
                <th className="px-8 py-6 font-light">Identity</th>
                <th className="px-8 py-6 font-light">Timestamp</th>
                <th className="px-8 py-6 font-light">Status</th>
                <th className="px-8 py-6 font-light text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {quizzes.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-32 text-center">
                    <div className="bg-white/[0.02] p-8 rounded-full w-fit mx-auto mb-6">
                      <LayoutDashboard size={48} strokeWidth={1} className="text-white/10" />
                    </div>
                    <p className="text-white/20 uppercase tracking-[0.4em] text-lg font-light">Vault Empty</p>
                  </td>
                </tr>
              ) : (
                quizzes.map((q) => (
                  <tr key={q._id} className="group hover:bg-white/[0.02] transition-all">
                    <td className="px-8 py-8">
                      <span className="font-mono text-xl text-white/90 tracking-[0.2em]">
                        {q.quizId}
                      </span>
                    </td>
                    <td className="px-8 py-8 text-white/30 text-[10px] uppercase tracking-wider font-light">
                      <div className="flex items-center gap-2 mb-1.5 text-white/50">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        {new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className={`px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest inline-flex items-center gap-2 border font-normal ${q.isActive ? 'bg-white text-black border-white' : 'bg-transparent text-white/20 border-white/5'}`}>
                        <div className={`w-1 h-1 rounded-full ${q.isActive ? 'bg-black animate-pulse' : 'bg-white/20'}`} />
                        {q.isActive ? 'Live' : 'Archived'}
                      </div>
                    </td>
                    <td className="px-8 py-8">
                       <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuizId(q.quizId);
                              setTab('control');
                              fetchStatus(q.quizId);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-5 py-2.5 rounded-lg border border-white/10 text-white/60 hover:text-black hover:bg-white hover:border-white text-[9px] uppercase tracking-[0.2em] transition-all"
                          >
                            Restore
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteQuiz(q.quizId);
                            }}
                            className="p-2.5 text-white/10 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all"
                            title="Wipe Sequence"
                          >
                            <Trash2 size={14} />
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
