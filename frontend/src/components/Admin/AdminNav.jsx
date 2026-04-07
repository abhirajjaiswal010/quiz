import React from 'react';
import { Zap, BookOpen, LayoutDashboard, Trophy } from 'lucide-react';

const AdminNav = ({ tab, setTab, fetchQuizzes }) => {
  const NavButton = ({ id, label, icon: Icon, onClick }) => (
    <button 
      onClick={onClick || (() => setTab(id))} 
      className={`px-6 py-3 rounded-2xl text-xs font-montserrat font-bold uppercase  transition-all duration-300 flex items-center gap-3 active:scale-95 border ${
        tab === id 
          ? 'bg-[#4FB3FF] text-white  border-[#4fb3ff]' 
          : 'text-slate-500 hover:text-white hover:bg-white/5 border-transparent'
      }`}
    >
      <Icon size={16} className={tab === id ? 'animate-pulse' : ''} />
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap gap-2 mb-10 bg-white/5 p-2 rounded-[24px] w-fit border border-white/10 shadow-2xl backdrop-blur-xl">
      <NavButton id="control" label="Telemetry Control" icon={Zap} />
      <NavButton id="questions" label="Question Bank" icon={BookOpen} />
      <NavButton id="history" label="Session Archive" icon={LayoutDashboard} onClick={() => { setTab('history'); fetchQuizzes(); }} />
      <NavButton id="leaderboard" label="Live Rankings" icon={Trophy} />
    </div>
  );
};

export default AdminNav;
