import React from 'react';
import { Zap, BookOpen, LayoutDashboard, Trophy } from 'lucide-react';

const AdminNav = ({ tab, setTab, fetchQuizzes }) => {
  const NavButton = ({ id, label, icon: Icon, onClick }) => (
    <button
      onClick={onClick || (() => setTab(id))}
      className={`px-5 py-2.5 rounded-xl text-[10px] uppercase transition-all duration-300 flex items-center gap-2 active:scale-95 border ${tab === id
          ? 'bg-white text-black border-white'
          : 'text-white/30 hover:text-white hover:bg-white/5 border-transparent'
        }`}
    >
      <Icon size={14} className={tab === id ? "text-black" : "text-white"} />
      <span className="tracking-[0.2em] font-normal">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-wrap gap-2 mb-10 bg-white/[0.03] p-1.5 rounded-2xl w-fit border border-white/10">
      <NavButton id="control" label="Console" icon={Zap} />
      <NavButton id="questions" label="Vault" icon={BookOpen} />
      <NavButton id="history" label="Archive" icon={LayoutDashboard} onClick={() => { setTab('history'); fetchQuizzes(); }} />
      <NavButton id="leaderboard" label="Rankings" icon={Trophy} />
    </div>
  );
};

export default AdminNav;
