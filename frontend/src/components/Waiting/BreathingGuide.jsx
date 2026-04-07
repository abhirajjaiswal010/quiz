import React from 'react';

// ── SVG Face expressions ────────────────────────────────────────────────────
function InhaleFace() {
  return (
    <svg width="56" height="46" viewBox="0 0 56 46" fill="none">
      <circle cx="17" cy="15" r="4.5" fill="#1e1b4b" />
      <circle cx="18.5" cy="13.5" r="1.5" fill="white" opacity="0.7" />
      <circle cx="39" cy="15" r="4.5" fill="#1e1b4b" />
      <circle cx="40.5" cy="13.5" r="1.5" fill="white" opacity="0.7" />
      <ellipse cx="28" cy="36" rx="7" ry="5" fill="#1e1b4b" />
    </svg>
  );
}

function HoldFace() {
  return (
    <svg width="56" height="46" viewBox="0 0 56 46" fill="none">
      <path d="M12 15 Q17 10 22 15" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M12 15 Q17 18 22 15" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M34 15 Q39 10 44 15" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M34 15 Q39 18 44 15" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M18 35 Q28 37 38 35" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function ExhaleFace() {
  return (
    <svg width="56" height="46" viewBox="0 0 56 46" fill="none">
      <path d="M12 17 Q17 11 22 17" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M34 17 Q39 11 44 17" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" fill="none" />
      <ellipse cx="11" cy="25" rx="5" ry="3" fill="#f9a8d4" opacity="0.55" />
      <ellipse cx="45" cy="25" rx="5" ry="3" fill="#f9a8d4" opacity="0.55" />
      <ellipse cx="28" cy="36" rx="4.5" ry="4" fill="#1e1b4b" />
    </svg>
  );
}

const FACES = [InhaleFace, HoldFace, ExhaleFace];

export default function BreathingGuide({ phaseIndex, breatheClass, faceOpacity = 1 }) {
  const FaceComponent = FACES[phaseIndex];

  return (
    <div
      className="relative flex items-center justify-center select-none mb-3"
      style={{ width: 300, height: 300 }}
    >
      {/* Ring 4 */}
      <div className={`smiley-ring ring4 ${breatheClass} absolute rounded-full`}
        style={{ width: 290, height: 290, background: 'rgba(146,172,255,0.02)', border: '1px solid rgba(146,172,255,0.05)' }} />
      {/* Ring 3 */}
      <div className={`smiley-ring ring3 ${breatheClass} absolute rounded-full`}
        style={{ width: 245, height: 245, background: 'rgba(146,172,255,0.04)', border: '1px solid rgba(146,172,255,0.08)' }} />
      {/* Ring 2 */}
      <div className={`smiley-ring ring2 ${breatheClass} absolute rounded-full`}
        style={{ width: 200, height: 200, background: 'rgba(146,172,255,0.06)', border: '1px solid rgba(146,172,255,0.12)' }} />
      {/* Ring 1 */}
      <div className={`smiley-ring ring1 ${breatheClass} absolute rounded-full`}
        style={{ width: 158, height: 158, background: 'rgba(146,172,255,0.08)', border: '1px solid rgba(146,172,255,0.18)' }} />

      {/* Core – white glowing circle */}
      <div
        className={`smiley-core ${breatheClass} relative rounded-full flex flex-col items-center justify-center z-10`}
        style={{
          width: 118, height: 118,
          background: 'radial-gradient(circle at 42% 38%, #ffffff 0%, #e0e7ff 100%)',
          boxShadow: '0 0 40px rgba(139,92,246,0.35), 0 0 80px rgba(99,102,241,0.15)',
        }}
      >
        <div style={{ transition: 'opacity 0.5s ease', opacity: faceOpacity }}>
          <FaceComponent />
        </div>
      </div>
    </div>
  );
}
