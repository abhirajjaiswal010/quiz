import { useState, useEffect, useRef } from 'react'
import { useQuiz } from '../context/QuizContext'
import { BookOpen, Timer, BellOff, Users, Sparkles } from 'lucide-react'




const MOTIVATIONAL_MESSAGES = [
  "Stay calm, you got this ",
  "Focus > Speed",
  "Think before you click",
  "You prepared for this moment",
  "Breathe. Read. Answer.",
  "Trust your instincts",
  "One question at a time",
  "Clarity beats rushing",
  "Your best effort is enough",
  "You've got this — stay steady",
]

const PHASES = [
  { label: 'Inhale',  duration: 4, hint: 'breathe in slowly...',   color: '#818cf8' },
  { label: 'Hold',    duration: 4, hint: 'hold it steady...',      color: '#a78bfa' },
  { label: 'Exhale',  duration: 4, hint: 'breathe out gently...', color: '#2dd4bf' },
]

// ── SVG Face expressions ────────────────────────────────────────────────────
function InhaleFace() {
  // Wide eyes + big open mouth (inhaling in surprise/eagerness)
  return (
    <svg width="56" height="46" viewBox="0 0 56 46" fill="none">
      {/* Left eye – bigger, wide awake */}
      <circle cx="17" cy="15" r="4.5" fill="#1e1b4b" />
      <circle cx="18.5" cy="13.5" r="1.5" fill="white" opacity="0.7" />
      {/* Right eye */}
      <circle cx="39" cy="15" r="4.5" fill="#1e1b4b" />
      <circle cx="40.5" cy="13.5" r="1.5" fill="white" opacity="0.7" />
      {/* Mouth – open oval (inhale) */}
      <ellipse cx="28" cy="36" rx="7" ry="5" fill="#1e1b4b" />
    </svg>
  )
}

function HoldFace() {
  // Closed/squinting eyes + straight closed mouth (holding breath, calm)
  return (
    <svg width="56" height="46" viewBox="0 0 56 46" fill="none">
      {/* Left eye – half closed / squint */}
      <path d="M12 15 Q17 10 22 15" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M12 15 Q17 18 22 15" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Right eye */}
      <path d="M34 15 Q39 10 44 15" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M34 15 Q39 18 44 15" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Mouth – flat/neutral */}
      <path d="M18 35 Q28 37 38 35" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

function ExhaleFace() {
  // Relaxed open eyes + small pursed "o" mouth blowing out
  return (
    <svg width="56" height="46" viewBox="0 0 56 46" fill="none">
      {/* Left eye – relaxed, happy */}
      <path d="M12 17 Q17 11 22 17" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Right eye */}
      <path d="M34 17 Q39 11 44 17" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" fill="none"/>
      {/* Cheeks – rosy blush */}
      <ellipse cx="11" cy="25" rx="5" ry="3" fill="#f9a8d4" opacity="0.55" />
      <ellipse cx="45" cy="25" rx="5" ry="3" fill="#f9a8d4" opacity="0.55" />
      {/* Mouth – small pursed "o" (exhaling) */}
      <ellipse cx="28" cy="36" rx="4.5" ry="4" fill="#1e1b4b" />
    </svg>
  )
}

const FACES = [InhaleFace, HoldFace, ExhaleFace]

// ── Main Page ──────────────────────────────────────────────────────────────
export default function WaitingPage() {
  const { student, participantCount } = useQuiz()

  // ── Phase clock ─────────────────────────────────────────────────────────
  const [phaseIndex, setPhaseIndex]   = useState(0)
  const [phaseSeconds, setPhaseSeconds] = useState(PHASES[0].duration)
  const phaseRef = useRef(0)
  const secRef   = useRef(PHASES[0].duration)

  useEffect(() => {
    const tick = setInterval(() => {
      secRef.current -= 1
      if (secRef.current <= 0) {
        const next = (phaseRef.current + 1) % PHASES.length
        phaseRef.current = next
        secRef.current   = PHASES[next].duration
        setPhaseIndex(next)
      }
      setPhaseSeconds(secRef.current)
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  // ── Motivational rotation ────────────────────────────────────────────────
  const [msgIndex, setMsgIndex] = useState(0)
  const [msgKey,   setMsgKey]   = useState(0)
  useEffect(() => {
    const t = setInterval(() => {
      setMsgIndex(i => (i + 1) % MOTIVATIONAL_MESSAGES.length)
      setMsgKey(k => k + 1)
    }, 6000)
    return () => clearInterval(t)
  }, [])

  const phase = PHASES[phaseIndex]
  const FaceComponent = FACES[phaseIndex]

  const breatheClass = phaseIndex === 0
    ? 'breathe-in'
    : phaseIndex === 1
    ? 'breathe-hold'
    : 'breathe-out'

  // Background glow color per phase
  const phaseGlow = [
    'rgba(56,189,248,0.09)',   // inhale  – sky blue
    'rgba(167,139,250,0.11)', // hold    – violet
    'rgba(45,212,191,0.09)',  // exhale  – teal
  ][phaseIndex]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-charcoal-800 animate-fade-in overflow-hidden relative">


      {/* Phase-reactive background glow */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <div
          style={{
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${phaseGlow} 0%, transparent 70%)`,
            transition: 'background 3.6s ease',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Status pill */}
      <div className="m-5 flex items-center gap-3 px-4 py-2 rounded-full bg-charcoal-900 border border-charcoal-700 text-xs text-brand-200/50">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-300 animate-ping" />
          Waiting for quiz to start
        </span>
        <span className="h-3 w-px bg-charcoal-700" />
        <span className="flex items-center gap-3 text-brand-200">
          <Users className="text-sm" />
          <span className="font-semibold text-xl">{participantCount ||  1}</span>
        </span>
      </div>

      {/* Greeting */}
      <h1 className="font-display text-3xl md:text-4xl font-bold text-white text-center mb-1 flex items-center gap-3">
        Hey, <span className="gradient-text">{student?.name?.split(' ')[0] || 'there'}</span>
      
      </h1>
      <p className="text-slate-500 text-sm text-center mb-1">
        Follow the breathing guide while you wait
      </p>

      {/* ── Breathing Circle ── */}
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
          {/* SVG Face – changes per phase */}
          <div style={{ transition: 'opacity 0.5s ease', opacity: 1 }}>
            <FaceComponent />
          </div>
        </div>


      </div>

      {/* Phase label + countdown + hint */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-1">
          <span
            className="text-xl font-black tracking-tight transition-colors duration-500"
            style={{ color: phase.color }}
          >
            {phase.label}
          </span>
          {/* Countdown number */}
          <span
            className="text-xl font-black text-white tabular-nums leading-none transition-all duration-300"
            style={{ textShadow: `0 0 20px ${phase.color}88` }}
          >
            {phaseSeconds}
          </span>
        </div>
        <p className="text-slate-500 text-xs tracking-wide">{phase.hint}</p>
      </div>

      {/* Phase dot indicators */}
      <div className="flex gap-2 items-center mb-8">
        {PHASES.map((p, i) => (
          <div
            key={p.label}
            className="transition-all duration-700 rounded-full"
            style={{
              width:  i === phaseIndex ? 32 : 8,
              height: 4,
              background: i === phaseIndex
                ? `linear-gradient(90deg, ${p.color}, ${PHASES[(i+1)%3].color})`
                : 'rgba(100,116,139,0.3)',
              boxShadow: i === phaseIndex ? `0 0 8px ${p.color}88` : 'none',
            }}
          />
        ))}
      </div>

      {/* Motivational message */}
      <div className="h-7 flex items-center justify-center mb-4">
        <p key={msgKey} className="motivational-text text-slate-400 text-sm italic font-medium text-center">
          "{MOTIVATIONAL_MESSAGES[msgIndex]}"
        </p>
      </div>

      {/* Tips row */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-3 text-center">
        {[
          { icon: <BookOpen className="text-white-400" />, label: 'Read carefully' },
          { icon: <Timer    className="text-white-400" />, label: 'Pace yourself'  },
          { icon: <BellOff  className="text-white-400" />,  label: 'Stay focused'   },
        ].map(t => (
          <div key={t.label} className="py-4 px-3 rounded-2xl bg-slate-900/50 border border-slate-800/60 flex flex-col items-center justify-center">
            <div className="text-2xl mb-2">{t.icon}</div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{t.label}</div>
          </div>
        ))}
      </div>

      {/* Quiz ID */}
      {student?.quizId && (
        <p className="mt-5 text-[11px] text-white-700 tracking-widest uppercase">
          Quiz · <span className="text-white-600">{student.quizId}</span>
        </p>
      )}
    </div>
  )
}
