import React from 'react';
import { Users } from 'lucide-react';

export default function WaitingStatus({ student, participantCount }) {
  return (
    <>
      {/* Status pill */}
      <div className="m-5 flex items-center gap-3 px-4 py-2 rounded-full bg-charcoal-900 border border-charcoal-700 text-xs text-brand-200/50">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-300 animate-ping" />
          Waiting for quiz to start
        </span>
        <span className="h-3 w-px bg-charcoal-700" />
        <span className="flex items-center gap-3 text-brand-200">
          <Users className="text-sm" />
          <span className="font-semibold text-xl">{participantCount || 1}</span>
        </span>
      </div>

      {/* Greeting */}
      <h1 className="font-display text-3xl md:text-4xl font-bold text-white text-center mb-1 flex items-center gap-3">
        Hey, <span className="gradient-text">{student?.name?.split(' ')[0] || 'there'}</span>
      </h1>
      <p className="text-slate-500 text-sm text-center mb-1">
        Follow the breathing guide while you wait
      </p>
    </>
  );
}
