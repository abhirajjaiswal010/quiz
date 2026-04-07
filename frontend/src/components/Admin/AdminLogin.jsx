import React from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Beams from '../beams';

/**
 * Admin Access Login Screen.
 * Maintains the exact UI/UX requested by the user.
 */
const AdminLogin = ({ handleLogin, loading, showKey, setShowKey }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
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

      <div className="card relative z-10 bg-[#0f0f0f]/10 backdrop-blur-sm max-w-sm w-full p-8 text-center shadow-2xl border-white/20">
        <div className="mx-auto w-16 h-16 bg-[#4FB3FF]/10 rounded-2xl flex items-center justify-center mb-6 text-[#4FB3FF] ">
          <Lock size={32} />
        </div>
        <h1 className="font-display text-2xl font-bold text-white mb-2">Admin Access</h1>
        <p className="text-white text-sm mb-8">Enter your Secret Key to manage the quiz</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <input
              name="key"
              type={showKey ? "text" : "password"}
              placeholder="Admin Secret Key"
              className="input-field bg-[#0f0f0f]/20 border border-white/20 uppercase text-white py-2 text-[10px] focus:border-white transition-colors w-full pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              title={showKey ? "Hide Secret Key" : "Show Secret Key"}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button type="submit" disabled={loading} className="btn-primary bg-white w-full py-4 uppercase font-bold text-black hover:bg-white/90 transition-all">
            {loading ? 'Verifying...' : 'Unlock Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
