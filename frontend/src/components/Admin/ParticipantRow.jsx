import React from 'react';
import { CheckCircle2 } from 'lucide-react';

/**
 * Individual Participant Row for Admin Dashboard.
 * Memoized to ensure that 70+ student items don't re-render 
 * every time a single person's status changes.
 */
const ParticipantRow = React.memo(({ p, idx }) => {
  return (
    <div className="flex justify-between items-center bg-white/[0.02] hover:bg-white/[0.05] p-3 rounded-xl border border-white/5 transition-all group">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white truncate">{p.name}</p>
        <div className="flex items-center gap-4 mt-1.5">
          <p className="text-xs font-mono text-white tracking-widest uppercase">
             <span className="text-white mr-1 italic">SID:</span>{p.studentId}
          </p>
          {p.isSubmitted ? (
            <span className="flex items-center gap-1.5 text-[9px] font-medium text-white uppercase bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
              <div className="w-1 h-1 rounded-full bg-white shadow-[0_0_4px_white]" /> Finished
            </span>
          ) : p.isDisconnected ? (
            <span className="flex items-center gap-1.5 text-[9px] font-medium text-white uppercase bg-white/[0.02] px-2 py-0.5 rounded-full border border-white/5">
              Lost
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[9px] font-medium text-white/60 uppercase animate-pulse">
               Solving...
            </span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0 ml-4">
        <p className="text-[10px] font-mono text-white transition-colors uppercase tracking-tight">
          <span className="mr-1 opacity-50 text-white">AT</span>
          {new Date(p.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
});

ParticipantRow.displayName = 'ParticipantRow';

export default ParticipantRow;
