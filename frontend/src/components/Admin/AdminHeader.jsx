import React from 'react';
import { LogOut } from 'lucide-react';
import logo from '../../assets/logo.png';

const AdminHeader = ({ handleLogout }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
      <div className="flex items-center gap-4">
        <img 
          src={logo} 
          alt="Admin Logo" 
          className="w-12 h-12 object-contain " 
        />
        <div>
          <h1 className="font-display text-4xl text-white tracking-tight flex items-center gap-3">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Full control over quiz sessions and question bank
          </p>
        </div>
      </div>
      <button 
        onClick={handleLogout} 
        className="btn-primary  group text-white text-xs px-5 self-start md:self-auto  uppercase tracking-[0.2em] flex items-center gap-2   "
      >
        <LogOut size={16} className="group-hover:rotate-12 transition-transform group-hover:text-red-500" />
        Logout
      </button>
    </div>
  );
};

export default AdminHeader;
