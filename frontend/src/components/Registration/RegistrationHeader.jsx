import React from 'react';
import logo from '../../assets/logo.png';

const RegistrationHeader = () => {
  return (
    <div className="text-center mb-1">
      <div className="inline-flex items-center justify-center mb-1">
        <img src={logo} alt="Innovixus Logo" className="w-20 h-20 object-contain" />
      </div>
      <div className="space-y-0">
        <span className="text-[15px] font-bold text-white tracking-[0.2em] uppercase block mb-10">
          Platform by Innovixus
        </span>
        <h1 className="font-display text-4xl text-[#4FB3FF] tracking-tight font-montserrat">
          Club Quiz
        </h1>
      </div>
      <p className="text-white text-xs mt-1 font-medium tracking-wide uppercase">
        Authentication & Joining
      </p>
    </div>
  );
};

export default RegistrationHeader;
