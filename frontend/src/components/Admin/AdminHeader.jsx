import React from 'react';
import { LogOut, RotateCcw } from 'lucide-react';
import logo from '../../assets/logo.png';

const AdminHeader = ({ handleLogout, fetchStatus, quizId }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
      <div className="flex items-center gap-4">
        <img
          src={logo}
          alt="Admin Logo"
          className="w-10 h-10 object-contain grayscale opacity-80"
        />
        <div>
          <h1 className="text-2xl font-medium text-white tracking-wide flex items-center gap-3 uppercase">
            Admin Dashboard
          </h1>
          <p className="text-white/30 text-[11px] mt-1 uppercase tracking-widest font-light">
            System Core Control & Question Repository
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 self-start md:self-auto">
        <button
          onClick={() => fetchStatus(quizId)}
          className="group text-white/50 hover:text-white transition-all text-[10px] px-5 py-3 border border-white/10 hover:border-white/30 rounded-lg uppercase tracking-[0.2em] flex items-center gap-2"
          title="Manual Session Sync"
        >
          <RotateCcw size={14} className="group-active:rotate-[360deg] transition-transform duration-500" />
          Refresh
        </button>
        <button
          onClick={handleLogout}
          className="group text-white/50 hover:text-white transition-all text-[10px] px-6 py-3 border border-white/10 hover:border-white/30 rounded-lg uppercase tracking-[0.2em] flex items-center gap-2"
        >
          <LogOut size={14} className="group-hover:text-red-400 transition-colors" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminHeader;
