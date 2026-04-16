import React from 'react';
import { BookOpen, Timer, BellOff } from 'lucide-react';

export default function WaitingTips({ student }) {
  return (
    <>
      <div className="w-full max-w-xs grid grid-cols-3 gap-3 text-center">
        {[
          { icon: <BookOpen className="text-white-400" />, label: 'Read carefully' },
          { icon: <Timer className="text-white-400" />, label: 'Pace yourself' },
          { icon: <BellOff className="text-white-400" />, label: 'Stay focused' },
        ].map(t => (
          <div key={t.label} className="py-4 px-3 rounded-2xl bg-slate-900/50 border border-slate-800/60 flex flex-col items-center justify-center">
            <div className="text-2xl mb-2">{t.icon}</div>
            <div className="text-[10px] text-slate-500 font-normal uppercase tracking-wider">{t.label}</div>
          </div>
        ))}
      </div>

      {/* Session PIN */}
      {student?.quizId && (
        <p className="mt-5 text-[11px] text-white/50 tracking-widest uppercase">
          Session Code · <span className="text-white/80 font-normal">{student.quizId.length === 6 && /^\d+$/.test(student.quizId) ? `${student.quizId.substring(0,3)}-${student.quizId.substring(3)}` : student.quizId}</span>
        </p>
      )}
    </>
  );
}
