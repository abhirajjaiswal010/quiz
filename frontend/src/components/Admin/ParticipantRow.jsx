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
      <div className="min-w-0">
        <p className="text-xs font-bold text-white truncate">{p.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[10px] font-mono text-slate-500">{p.roll}</p>
          {p.isSubmitted && (
            <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-400 uppercase bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">
              <CheckCircle2 size={8} /> Submitted
            </span>
          )}
        </div>
      </div>
      <span className="text-[9px] text-slate-500 font-mono opacity-50 group-hover:opacity-100 transition-opacity">
        {new Date(p.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
});

ParticipantRow.displayName = 'ParticipantRow';

export default ParticipantRow;
