import React from 'react';
import { Trophy, Users, Timer, Target } from 'lucide-react';

const LeaderboardTab = ({ leaderboard, quizId }) => {
  return (
    <div className="animate-slide-up">
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-10 min-h-[500px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-6">
            <div className="bg-white/5 p-5 rounded-full text-white border border-white/10">
               <Trophy size={42} strokeWidth={1} />
            </div>
            <div>
              <h3 className="text-2xl font-normal text-white tracking-widest uppercase">Live Standings</h3>
              <p className="text-white/20 text-[10px] mt-2 flex items-center gap-2 tracking-[0.2em] uppercase font-light">
                Session ID: <span className="text-white ml-1 font-mono">{quizId || 'UNDEFINED'}</span>
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/[0.02] px-5 py-3 rounded-xl border border-white/5 flex items-center gap-4">
                <Users size={14} className="text-white/20" />
                <div>
                   <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1 font-light">Total Pool</p>
                   <p className="text-sm text-white font-normal">{leaderboard.length}</p>
                </div>
             </div>
             <div className="bg-white/[0.02] px-5 py-3 rounded-xl border border-white/5 flex items-center gap-4">
                <Target size={14} className="text-white/20" />
                <div>
                   <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1 font-light">Efficiency</p>
                   <p className="text-sm text-white font-normal">100%</p>
                </div>
             </div>
          </div>
        </div>

        {leaderboard.length > 0 ? (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="text-white/20 border-b border-white/5 uppercase tracking-[0.3em] text-[9px]">
                  <th className="py-6 px-4 font-light">Position</th>
                  <th className="py-6 px-4 font-light">Identity</th>
                  <th className="py-6 px-4 font-light text-center">Precision</th>
                  <th className="py-6 px-4 font-light text-center">Calculated Score</th>
                  <th className="py-6 px-4 font-light text-right">Sequence Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {leaderboard.map((r, i) => {
                  const isTop3 = i < 3;
                  return (
                    <tr key={r.studentId} className={`group hover:bg-white/[0.02] transition-all`}>
                      <td className="py-8 px-4">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-full border text-base  font-normal ${isTop3 ? 'bg-white text-black border-white' : 'bg-transparent text-white/20 border-white/5'}`}>
                           {i + 1}
                        </div>
                      </td>
                      <td className="py-8 px-4">
                        <div className="text-white text-lg group-hover:text-white transition-colors uppercase tracking-tight font-normal">{r.name}</div>
                        <div className="text-[10px] text-white/20 font-mono mt-1 uppercase tracking-widest font-light">{r.studentId}</div>
                      </td>
                      <td className="py-8 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-white text-lg font-normal">{r.correctAnswers || 0}</span>
                          <span className="text-white/10 text-[8px] uppercase tracking-widest font-light">Correct Vectors</span>
                        </div>
                      </td>
                      <td className="py-8 px-4 text-center">
                        <span className="text-white px-5 py-2.5 rounded-lg border border-white/10 inline-block font-mono text-xl font-normal">
                          {r.score}
                        </span>
                      </td>
                      <td className="py-8 px-4 text-right">
                        <div className="flex flex-col items-end">
                           <div className="flex items-center gap-1.5 text-white text-lg font-normal">
                              <Timer size={14} className="text-white/20" />
                              {r.timeTaken}s
                           </div>
                           <span className="text-white/10 text-[8px] uppercase tracking-widest font-light">Finalized Time</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center">
             <div className="p-8 bg-white/[0.02] rounded-full mb-8">
               <Trophy size={64} strokeWidth={1} className="text-white/10" />
             </div>
             <h4 className="text-white/20 uppercase tracking-[0.4em] text-xl font-light">Standings Standby</h4>
             <p className="text-white/10 text-[10px] mt-6 tracking-[0.2em] max-w-[300px] mx-auto uppercase leading-relaxed font-light">Refreshing live as transmission completes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardTab;
