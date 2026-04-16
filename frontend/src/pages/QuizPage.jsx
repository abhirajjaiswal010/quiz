import { useState, useEffect, useRef } from 'react'
import { useQuiz } from '../context/QuizContext'

// Modular components with 100% UI preservation
import AntiCheatWarning from '../components/Quiz/AntiCheatWarning'
import SubmitConfirmation from '../components/Quiz/SubmitConfirmation'
import QuizHeader from '../components/Quiz/QuizHeader'
import QuestionCard from '../components/Quiz/QuestionCard'
import QuestionNavigation from '../components/Quiz/QuestionNavigation'
import QuizIntro from '../components/Quiz/QuizIntro'
import QuizRules from '../components/Quiz/QuizRules'

// Helper function preserved exactly
function computeRemaining(startTime, quizDuration) {
  if (!startTime) return quizDuration * 60
  const endTime = startTime + quizDuration * 60 * 1000
  return Math.max(0, Math.round((endTime - Date.now()) / 1000))
}

export default function QuizPage() {
  const {
    student, questions, answers, selectAnswer,
    submitCurrentQuiz, isSubmitting, quizDuration, startTime, allowTabSwitching, result
  } = useQuiz()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(() => computeRemaining(startTime, quizDuration))
  const autoSubmitted = useRef(false)
  const [submitError, setSubmitError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [isFullscreenWarning, setIsFullscreenWarning] = useState(() => {
    return localStorage.getItem('quiz_warn_pending') === 'true'
  })
  const [showIntro, setShowIntro] = useState(true)
  const [showRules, setShowRules] = useState(false) // No longer blocking by default

  /** ─── Fullscreen Logic ───────────────────────────────────────────── */
  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => console.warn("Fullscreen blocked:", err));
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
    enterFullscreen();
  };

  // ── ANTI-CHEAT STRIKES ──
  const [strikes, setStrikes] = useState(() => {
    const saved = localStorage.getItem('quiz_strikes')
    return saved ? parseInt(saved) : 0
  })

  const answeredCount = Object.keys(answers).length
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0
  const canSubmit = true

  // ── Anti-Cheat Effect (Tab Switching & Global Fullscreen Lock) ──
  useEffect(() => {
    const handleViolation = (isStrike = true) => {
       if (isSubmitting || showIntro) return;
       
       if (isStrike) {
         const newStrikes = strikes + 1
         setStrikes(newStrikes)
         localStorage.setItem('quiz_strikes', newStrikes.toString())
         if (newStrikes >= 3) {
           submitCurrentQuiz(true)
           return;
         }
       }
       
       // Always show warning and lock UI
       localStorage.setItem('quiz_warn_pending', 'true')
       setIsFullscreenWarning(true)
    }

    // 1. Mandatory Fullscreen Lock (Show warning but NO strike)
    const handleFSChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        if (!isSubmitting && !showIntro && !result) {
          handleViolation(false); // No strike for simple FS exit
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);
    document.addEventListener('mozfullscreenchange', handleFSChange);
    document.addEventListener('MSFullscreenChange', handleFSChange);

    // 2. Tab Switching Lock (Increments Strikes)
    if (!allowTabSwitching) {
      const handleVisibility = () => {
        if (document.hidden) handleViolation(true); // Strike for tab switch
      }
      document.addEventListener('visibilitychange', handleVisibility)
      window.addEventListener('popstate', handleViolation);

      return () => {
        document.removeEventListener('fullscreenchange', handleFSChange);
        document.removeEventListener('webkitfullscreenchange', handleFSChange);
        document.removeEventListener('mozfullscreenchange', handleFSChange);
        document.removeEventListener('MSFullscreenChange', handleFSChange);
        document.removeEventListener('visibilitychange', handleVisibility)
        window.removeEventListener('popstate', handleViolation);
      };
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange);
      document.removeEventListener('webkitfullscreenchange', handleFSChange);
      document.removeEventListener('mozfullscreenchange', handleFSChange);
      document.removeEventListener('MSFullscreenChange', handleFSChange);
    };
  }, [strikes, isSubmitting, submitCurrentQuiz, allowTabSwitching, showIntro, result])

  // ── Timer Effect ────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = computeRemaining(startTime, quizDuration)
      setTimeLeft(remaining)

      if (remaining <= 0 && !autoSubmitted.current && !isSubmitting) {
        autoSubmitted.current = true
        submitCurrentQuiz(true)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [startTime, quizDuration, isSubmitting, submitCurrentQuiz])

  const confirmSubmit = () => {
    if ((questions.length - answeredCount) > 0) {
      setShowConfirm(true)
    } else {
      submitCurrentQuiz()
    }
  }

  // Quiz not ready state
  if (!questions || !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-center">
        <div className="card max-w-sm p-8 animate-fade-in">
          <div className="text-5xl mb-6">⏳</div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">Quiz not ready</h2>
          <p className="text-slate-400 text-sm mb-6">
            We couldn't find any questions. Make sure the quiz has started and you've joined correctly.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-primary w-full bg-brand-600 hover:bg-brand-500 border-none"
          >
            Go to Registration
          </button>
        </div>
      </div>
    )
  }

  const timerColor =
    timeLeft > 300 ? 'text-emerald-400' : timeLeft > 60 ? 'text-amber-400' : 'text-red-400'

  return (
    <div 
      className="min-h-screen flex flex-col animate-fade-in bg-[#0f0f0f] text-white select-none"
      onContextMenu={(e) => e.preventDefault()}
    >

      {showIntro && <QuizIntro onComplete={handleIntroComplete} />}

      {showRules && <QuizRules onStart={() => setShowRules(false)} />}

      {/* ── Modals and Overlays ── */}
      {isFullscreenWarning && (
        <AntiCheatWarning
          strikes={strikes}
          setIsFullscreenWarning={(val) => {
            if (!val) {
              localStorage.removeItem('quiz_warn_pending');
              enterFullscreen();
            }
            setIsFullscreenWarning(val);
          }}
        />
      )}

      {showConfirm && (
        <SubmitConfirmation
          questions={questions}
          answeredCount={answeredCount}
          setShowConfirm={setShowConfirm}
          submitCurrentQuiz={submitCurrentQuiz}
        />
      )}

      {/* ── UI Components ── */}
      <QuizHeader
        timeLeft={timeLeft}
        timerColor={timerColor}
        student={student}
        answeredCount={answeredCount}
        questions={questions}
        progress={progress}
        currentIndex={currentIndex}
      />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        {submitError && (
          <div className="mb-5 p-4 rounded-xl bg-red-950/60 border border-red-800/60 text-red-400 text-sm flex items-start gap-2">
            <span>⚠️</span>
            <span>{submitError}</span>
          </div>
        )}

        <QuestionCard
          currentQuestion={questions[currentIndex]}
          currentIndex={currentIndex}
          answers={answers}
          selectAnswer={selectAnswer}
          isSubmitting={isSubmitting}
        />

        <QuestionNavigation
          questions={questions}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          answers={answers}
          isSubmitting={isSubmitting}
          canSubmit={canSubmit}
          confirmSubmit={confirmSubmit}
        />
      </main>
    </div>
  )
}
