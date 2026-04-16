import React from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Beams from '../beams';

/**
 * Admin Access Login Screen.
 * Maintains the exact UI/UX requested by the user.
 */
const AdminLogin = ({ handleLogin, loading, showKey, setShowKey }) => {
  return (
    <div className="admin-root min-h-screen flex items-center justify-center bg-[#0f0f0f] p-6 relative overflow-hidden text-white/90">
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
     <Beams
          beamWidth={3}
          beamHeight={30}
          beamNumber={20}
          lightColor="#55b4dd"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={30}
        />
      </div>

      <div className="relative z-10 bg-white/[0.03] border border-white/10 rounded-xl max-w-sm w-full p-10 text-center">
        <div className="mx-auto w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-6 text-white ">
          <Lock size={24} strokeWidth={1.5} />
        </div>
        <h1 className="text-xl font-normal text-white mb-2 uppercase tracking-wide">Admin Access</h1>
        <p className="text-white text-[11px] mb-8 font-light tracking-wider">Initialize secure schematic access</p>
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <input
              name="key"
              type={showKey ? "text" : "password"}
              placeholder="Admin Secret Key"
              className="bg-transparent border-b border-white/10 focus:border-white uppercase text-white py-3 text-[10px] transition-all w-full pr-10 outline-none tracking-[0.3em] font-light"
              required
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 text-[10px] uppercase tracking-[0.2em] font-normal border border-white/20 hover:bg-white hover:text-black transition-all rounded-lg mt-4 bg-transparent text-white">
            {loading ? 'Decrypting...' : 'Authenticate'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
