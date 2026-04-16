import { useState, useEffect, useRef } from 'react'
import { useQuiz } from '../context/QuizContext'

// Modular components with 100% UI preservation
import BreathingGuide from '../components/Waiting/BreathingGuide'
import WaitingStatus from '../components/Waiting/WaitingStatus'
import WaitingTips from '../components/Waiting/WaitingTips'
import QuizRules from '../components/Quiz/QuizRules'
import { ShieldCheck, Users } from 'lucide-react'

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
  { label: 'Inhale', duration: 4, hint: 'breathe in slowly...', color: '#818cf8' },
  { label: 'Hold', duration: 4, hint: 'hold it steady...', color: '#a78bfa' },
  { label: 'Exhale', duration: 4, hint: 'breathe out gently...', color: '#2dd4bf' },
]

export default function WaitingPage() {
  const { student, participantCount, recentJoiners } = useQuiz()
  const [showRules, setShowRules] = useState(false)

  // ── Phase clock ─────────────────────────────────────────────────────────
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [phaseSeconds, setPhaseSeconds] = useState(PHASES[0].duration)
  const phaseRef = useRef(0)
  const secRef = useRef(PHASES[0].duration)

  useEffect(() => {
    const tick = setInterval(() => {
      secRef.current -= 1
      if (secRef.current <= 0) {
        const next = (phaseRef.current + 1) % PHASES.length
        phaseRef.current = next
        secRef.current = PHASES[next].duration
        setPhaseIndex(next)
      }
      setPhaseSeconds(secRef.current)
    }, 1000)
    return () => clearInterval(tick)
  }, [])

  // ── Motivational rotation ────────────────────────────────────────────────
  const [msgIndex, setMsgIndex] = useState(0)
  const [msgKey, setMsgKey] = useState(0)
  useEffect(() => {
    const t = setInterval(() => {
      setMsgIndex(i => (i + 1) % MOTIVATIONAL_MESSAGES.length)
      setMsgKey(k => k + 1)
    }, 6000)
    return () => clearInterval(t)
  }, [])

  const phase = PHASES[phaseIndex]

  const breatheClass = phaseIndex === 0
    ? 'breathe-in'
    : phaseIndex === 1
      ? 'breathe-hold'
      : 'breathe-out'

  const phaseGlow = [
    'rgba(56,189,248,0.09)',   // inhale  – sky blue
    'rgba(167,139,250,0.11)', // hold    – violet
    'rgba(45,212,191,0.09)',  // exhale  – teal
  ][phaseIndex]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-charcoal-800 animate-fade-in overflow-hidden relative">

      {/* Ambient Glow Preserved */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <div
          style={{ width: 520, height: 520, borderRadius: '50%', background: `radial-gradient(circle, ${phaseGlow} 0%, transparent 70%)`, transition: 'background 3.6s ease' }}
        />
      </div>

      <WaitingStatus student={student} participantCount={participantCount} />

      <BreathingGuide phaseIndex={phaseIndex} breatheClass={breatheClass} />

      {/* Phase Metadata Header/Timer */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-1">
          <span className="text-xl font-normal tracking-tight transition-colors duration-500" style={{ color: phase.color }}>
            {phase.label}
          </span>
          <span className="text-xl font-normal text-white tabular-nums leading-none transition-all duration-300">
            {phaseSeconds}
          </span>
        </div>
        <p className="text-slate-500 text-xs tracking-wide">{phase.hint}</p>
      </div>

      {/* Dot Indicators */}
      <div className="flex gap-2 items-center mb-8">
        {PHASES.map((p, i) => (
              <div
                key={p.label}
                className="transition-all duration-700 rounded-full"
                style={{
                  width: i === phaseIndex ? 32 : 8,
                  height: 4,
                  background: i === phaseIndex
                    ? `linear-gradient(90deg, ${p.color}, ${PHASES[(i + 1) % 3].color})`
                    : 'rgba(100,116,139,0.3)',
                }}
              />
        ))}
      </div>

      {/* Motivational message */}
      <div className="h-7 flex items-center justify-center mb-4">
        <p key={msgKey} className="motivational-text text-slate-400 text-sm italic font-normal text-center">
          "{MOTIVATIONAL_MESSAGES[msgIndex]}"
        </p>
      </div>

      <WaitingTips student={student} />

      {/* Rules Toggle Button */}
      <div className="absolute bottom-6 right-6 z-10">
        <button
          onClick={() => setShowRules(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all text-[10px] font-normal uppercase tracking-[0.2em]"
        >
          <ShieldCheck size={14} className="text-brand-400" />
          View Rules
        </button>
      </div>

      {/* Live Joining Feed */}
      <div className="absolute top-6 right-6 w-48 z-10 hidden md:block">
        <h3 className="text-[9px] text-slate-500 uppercase font-normal tracking-[0.2em] mb-3 flex items-center gap-1.5">
          <Users size={12} className="text-emerald-400" />
          Live Join Feed
        </h3>
        <div className="space-y-2">
          {recentJoiners && recentJoiners.length > 0 ? recentJoiners.map((rj) => (
            <div key={rj.id} className="flex items-center gap-2 bg-slate-800/30 border border-slate-700/50 px-3 py-1.5 rounded-lg animate-slide-up">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
              <p className="text-[11px] text-white/80 font-normal font-montserrat truncate">{rj.name}</p>
            </div>
          )) : (
             <p className="text-[10px] text-slate-600 italic">New participants will appear here...</p>
          )}
        </div>
      </div>

      {/* Rules Modal Overlay */}
      {showRules && (
        <QuizRules
          onStart={() => setShowRules(false)}
          buttonText="CLOSE GUIDELINES"
        />
      )}
    </div>
  )
}
