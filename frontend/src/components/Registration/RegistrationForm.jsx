import React from 'react';
import { Rocket, ShieldCheck, Timer } from 'lucide-react';

const RegistrationForm = ({ form, onChange, onSubmit, loading }) => {
  return (
    <div className="border border-white/20 rounded-xl max-w-md p-6 animate-slide-up bg-[#0F0F0F]/10 backdrop-blur-xl w-full mt-4">
      <div className="mb-4">
        <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider">Join Quiz </h2>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="quizId" className="text-xs font-semibold text-white uppercase tracking-widest mb-1.5 block">
            Session Code
          </label>
          <input
            id="quizId"
            type="text"
            name="quizId"
            value={form.quizId}
            onChange={onChange}
            // placeholder="e.g. 483-921"
            className="input-field bg-white/5 border-white/10 text-white py-2.5 text-sm uppercase focus:border-[#4FB3FF] transition-all w-full px-4 rounded-lg placeholder:text-white/20 font-mono  tracking-[0.2em] text-center"
            required
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="name" className="text-xs font-semibold text-white uppercase tracking-widest mb-1.5 block">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            // placeholder="E.G. Alexander Pierce"
            className="input-field bg-white/5 border-white/10 text-white py-2.5 text-sm focus:border-[#4FB3FF] transition-all w-full px-4 rounded-lg placeholder:text-white/20"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary cursor-target bg-[#4fb3ff] w-full py-4 text-sm font-bold text-white flex items-center justify-center gap-2 rounded-lg   mt-4 uppercase tracking-widest "
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Connecting...</span>
            </div>
          ) : (
            <>
              <Rocket size={18} />
              <span>Enter Quiz Lobby</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-4 text-[10px] text-white/40">
        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
          <ShieldCheck size={14} className="text-[#4fb3ff]" /> Single Attempt
        </span>
        <span className="opacity-30">•</span>
        <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
          <Timer size={14} className="text-[#4fb3ff]" /> Live Ranking
        </span>
      </div>
    </div>
  );
};

export default RegistrationForm;
