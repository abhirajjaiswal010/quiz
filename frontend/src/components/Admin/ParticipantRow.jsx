import React from 'react';
import { CheckCircle2 } from 'lucide-react';

/**
 * Individual Participant Row for Admin Dashboard.
 * Memoized to ensure that 70+ student items don't re-render 
 * every time a single person's status changes.
 */
const ParticipantRow = React.memo(({ p, idx }) => {
  return (
    <div className="flex justify-between items-center bg-white/5 hover:bg-white/[0.08] p-3 rounded-xl border border-white/5 transition-all group">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-white truncate">{p.name}</p>
        <div className="flex items-center gap-4 mt-0.5">
          <p className="text-[12px] font-mono text-white/50  tracking-tighter">
             <span className="text-white mr-1">ID:</span>{p.studentId}
          </p>
          {p.isSubmitted ? (
            <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-400 uppercase bg-emerald-400/10 px-1.5 py-0.5 rounded-md border border-emerald-400/20">
              <CheckCircle2 size={8} /> Finalized
            </span>
          ) : p.isDisconnected ? (
            <span className="flex items-center gap-1 text-[8px] font-bold text-white uppercase bg-red-400/10 px-1.5 py-0.5 rounded-md border border-red-400/20">
              Left Quiz
            </span>
          ) : null}
        </div>
      </div>
      <div className="text-right shrink-0 ml-4">
        <p className="text-[10px] font-mono text-white/30 group-hover:text-white/60 transition-colors">
          <span className="text-white mr-1">Joined:</span>
          {new Date(p.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
});

ParticipantRow.displayName = 'ParticipantRow';

export default ParticipantRow;
