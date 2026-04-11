import React from 'react';
import { Trophy, Users, Timer, Target } from 'lucide-react';

const LeaderboardTab = ({ leaderboard, quizId }) => {
  return (
    <div className="animate-slide-up">
      <div className="card p-10 min-h-[500px]  bg-white/[0.03]  ">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-[#4fb3ff]/10 p-5 rounded-3xl  text-[#4fb3ff] ">
               <Trophy size={48} className="animate-bounce-subtle" />
            </div>
            <div>
              <h3 className="text-3xl font-montserrat text-white tracking-widest uppercase">Live Standings</h3>
              <p className="text-white/40 text-sm mt-1.5 flex items-center gap-2  tracking-widest uppercase">
                Session Control: <span className="text-[#4fb3ff] font-mono">{quizId || 'UNDEFINED'}</span>
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3">
                <Users size={16} className="text-white/30" />
                <div>
                   <p className="text-[8px] text-white-600 font-montserrat uppercase tracking-widest mb-0.5">Pool Participants</p>
                   <p className="text-sm font-montserrat text-white">{leaderboard.length}</p>
                </div>
             </div>
             <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3">
                <Target size={16} className="text-white/30" />
                <div>
                   <p className="text-[8px] text-white-600 font-montserrat uppercase tracking-widest mb-0.5">Completion Rate</p>
                   <p className="text-sm font-montserrat text-white">100%</p>
                </div>
             </div>
          </div>
        </div>

        {leaderboard.length > 0 ? (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="text-white/40 border-b border-white/5">
                  <th className="py-5 px-6 text-[10px] font-montserrat uppercase tracking-[0.3em]">Position</th>
                  <th className="py-5 px-6 text-[10px] font-montserrat uppercase tracking-[0.3em]">Student Identity</th>
                  <th className="py-5 px-6 text-[10px] font-montserrat uppercase tracking-[0.3em] text-center">Precision</th>
                  <th className="py-5 px-6 text-[10px] font-montserrat uppercase tracking-[0.3em] text-center">Global Score</th>
                  <th className="py-5 px-6 text-[10px] font-montserrat uppercase tracking-[0.3em] text-right">Completion Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {leaderboard.map((r, i) => {
                  const isTop3 = i < 3;
                  const rankStyles = [
                    'from-yellow-400/20 to-yellow-400/5 text-yellow-400 border-yellow-400/20',
                    'from-slate-300/20 to-slate-300/5 text-slate-300 border-slate-300/20',
                    'from-amber-600/20 to-amber-600/5 text-amber-600 border-amber-600/20'
                  ];
                  return (
                    <tr key={r.studentId} className={`group hover:bg-white/[0.04] transition-all ${isTop3 ? 'bg-white/[0.01]' : ''}`}>
                      <td className="py-6 px-6">
                        <div className={`w-12 h-12 flex items-center justify-center rounded-2xl border text-xl font-montserrat italic  ${isTop3 ? `bg-gradient-to-br ${rankStyles[i]}` : 'bg-white/5 text-white/40 border-white/5'}`}>
                           #{i + 1}
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="text-white font-montserrat text-lg group-hover:text-[#4fb3ff] transition-colors uppercase tracking-tight">{r.name}</div>
                        <div className="text-[10px] text-white/40 font-mono mt-1 opacity-60 font-bold uppercase tracking-widest">{r.studentId}</div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="flex flex-col items-center">
                          <span className="text-white font-montserrat text-lg">{r.correctAnswers || 0}</span>
                          <span className="text-white/20 text-[9px] font-montserrat uppercase tracking-widest">Questions Target</span>
                        </div>
                      </td>
                      <td className="py-6 px-6 text-center">
                        <span className="bg-[#4fb3ff]/10 text-[#4fb3ff] px-6 py-2.5 rounded-2xl font-montserrat text-xl border border-[#4fb3ff]/30 inline-block">
                          {r.score}
                        </span>
                      </td>
                      <td className="py-6 px-6 text-right">
                        <div className="flex flex-col items-end">
                           <div className="flex items-center gap-1.5 text-white font-montserrat text-lg">
                              <Timer size={16} className="text-white/20" />
                              {r.timeTaken}s
                           </div>
                           <span className="text-white/20 text-[9px] font-montserrat uppercase tracking-widest">Total Duration</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
             <Trophy size={100} className="mb-6 text-slate-700  " />
             <h4 className="text-white/20  uppercase  text-2xl">Awaiting Submissions</h4>
             <p className="text-white/30 text-xs mt-4  max-w-[300px] mx-auto uppercase">Standings will refresh automatically as students finalize their sessions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardTab;
