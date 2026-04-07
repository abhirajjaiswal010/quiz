import { useState, useEffect, useCallback } from 'react'
import { useQuiz } from '../context/QuizContext'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function QuizPage() {
  const { 
    student, questions, answers, selectAnswer, 
    submitCurrentQuiz, isSubmitting, quizDuration, startTime, allowTabSwitching 
  } = useQuiz()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!startTime) return quizDuration * 60
    const elapsed = Math.floor((Date.now() - startTime) / 1000)
    return Math.max(0, (quizDuration * 60) - elapsed)
  })
  const [submitError, setSubmitError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [isFullscreenWarning, setIsFullscreenWarning] = useState(false)
  
  // ── ANTI-CHEAT STRIKES ──
  const [strikes, setStrikes] = useState(() => {
    const saved = localStorage.getItem('quiz_strikes')
    return saved ? parseInt(saved) : 0
  })

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0
  
  // ── SUBMIT LOCK LOGIC ──
  // Enable submit only after 50% of the duration has passed
  const totalSeconds = quizDuration * 60
  const elapsedSeconds = totalSeconds - timeLeft
  const canSubmit = elapsedSeconds >= totalSeconds / 2

  // ── Anti-Cheat Effect ───────────────────────────────────────────────────
  useEffect(() => {
    if (allowTabSwitching) return; // Skip if disabled by admin

    const handleVisibility = () => {
      if (document.hidden && !isSubmitting) {
        const newStrikes = strikes + 1
        setStrikes(newStrikes)
        localStorage.setItem('quiz_strikes', newStrikes.toString())
        
        if (newStrikes >= 3) {
          submitCurrentQuiz(true) // Auto-submit on 3rd leak
        } else {
          setIsFullscreenWarning(true)
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [strikes, isSubmitting, submitCurrentQuiz, allowTabSwitching])

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft <= 0) {
      submitCurrentQuiz(true)
      return
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, submitCurrentQuiz])

  const confirmSubmit = () => {
    if ((questions.length - answeredCount) > 0) {
      setShowConfirm(true)
    } else {
      submitCurrentQuiz()
    }
  }

  if (!questions.length) return null

  const timerColor =
    timeLeft > 300 ? 'text-emerald-400' : timeLeft > 60 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="min-h-screen flex flex-col animate-fade-in bg-slate-950 text-slate-200">
      {/* ── Fullscreen Warning ── */}
      {isFullscreenWarning && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6 animate-fade-in backdrop-blur-sm">
          <div className="card max-w-sm w-full p-8 text-center border-red-700 shadow-[0_0_50px_rgba(185,28,28,0.2)]">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <span className="text-3xl">🚫</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-red-500 mb-2">Tab Switch Detected</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Switching tabs is strictly prohibited in this quiz. You have used <span className="text-red-500 font-bold">attempt {strikes} of 3</span>.
            </p>
            <div className="bg-red-500/5 rounded-xl p-4 mb-6 border border-red-500/10">
              <p className="text-xs text-red-400 font-medium italic">
                {strikes === 1 
                  ? "First warning. Your progress is saved, but don't do it again." 
                  : "Final warning! One more tab switch and your quiz will be AUTO-SUBMITTED."}
              </p>
            </div>
            <button
              id="return-to-quiz-btn"
              onClick={() => setIsFullscreenWarning(false)}
              className="btn-primary w-full bg-red-600 hover:bg-red-500 border-red-500"
            >
              Resume Quiz
            </button>
          </div>
        </div>
      )}

      {/* ── Confirm Submit Modal ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 animate-fade-in">
          <div className="card max-w-sm w-full p-8 text-center">
            <div className="text-4xl mb-4">🤔</div>
            <h3 className="font-display text-xl font-bold text-white mb-2">Submit Quiz?</h3>
            <p className="text-slate-400 text-sm mb-1">
              You have <span className="text-amber-400 font-semibold">{questions.length - answeredCount} unanswered</span> question(s).
            </p>
            <p className="text-slate-500 text-xs mb-6">Unanswered questions will count as wrong.</p>
            <div className="flex gap-3">
              <button
                id="cancel-submit-btn"
                onClick={() => setShowConfirm(false)}
                className="btn-secondary flex-1"
              >
                Go Back
              </button>
              <button
                id="confirm-submit-btn"
                onClick={() => submitCurrentQuiz()}
                className="btn-accent flex-1"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl">🧠</span>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 leading-none">ClubQuiz</p>
              <p className="text-sm font-semibold text-white truncate">{student?.name}</p>
            </div>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-2 font-mono font-bold text-2xl ${timerColor} tabular-nums`}>
            <svg className={`w-5 h-5 ${timeLeft <= 60 ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(timeLeft)}
          </div>

          {/* Progress */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
            <span className="text-brand-400 font-semibold">{answeredCount}</span>
            <span>/</span>
            <span>{questions.length}</span>
            <span>answered</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-3xl mx-auto mt-3">
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full"
              style={{ width: `${progress}%`, transition: 'width 0.4s ease' }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-600 mt-1">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>
      </header>

      {/* ── Main Quiz Area ── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        {submitError && (
          <div className="mb-5 p-4 rounded-xl bg-red-950/60 border border-red-800/60 text-red-400 text-sm flex items-start gap-2">
            <span>⚠️</span>
            <span>{submitError}</span>
          </div>
        )}

        {/* Question Card */}
        <div key={currentQuestion._id} className="card p-6 md:p-8 mb-6 animate-slide-up bg-slate-900/50 border-slate-800">
          <div className="flex items-start gap-4 mb-6">
            <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-sm">
              {currentIndex + 1}
            </span>
            <p className="text-lg md:text-xl font-medium text-slate-100 leading-relaxed pt-1">
              {currentQuestion.question}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answers[currentQuestion._id] === option
              const labels = ['A', 'B', 'C', 'D']
              return (
                <button
                  key={idx}
                  id={`option-${idx}-btn`}
                  onClick={() => selectAnswer(currentQuestion._id, option)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-1
                    ${isSelected 
                      ? 'bg-brand-600/20 border-brand-500 text-white shadow-lg shadow-brand-500/10' 
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600'}`}
                  disabled={isSubmitting}
                >
                  <span className={`inline-flex w-7 h-7 rounded-lg items-center justify-center text-xs font-bold mr-3 flex-shrink-0
                    ${isSelected
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-700 text-slate-400'}`}>
                    {labels[idx]}
                  </span>
                  {option}
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            id="prev-question-btn"
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0 || isSubmitting}
            className="btn-secondary px-6 shrink-0"
          >
            ← Previous
          </button>

          {/* Question dots (desktop) */}
          <div className="hidden md:flex flex-wrap justify-center gap-1.5 flex-1">
            {questions.map((q, i) => {
              const isCurrent = i === currentIndex
              const isAnswered = !!answers[q._id]
              const isSkipped = i < currentIndex && !isAnswered

              return (
                <button
                  key={q._id}
                  id={`jump-q-${i}-btn`}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all duration-150
                    ${isCurrent
                      ? 'bg-brand-600 text-white scale-110 ring-2 ring-brand-500 ring-offset-2 ring-offset-slate-950'
                      : isAnswered
                        ? 'bg-emerald-600 text-emerald-50'
                        : isSkipped
                          ? 'bg-amber-600/40 text-amber-200'
                          : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                  title={`Question ${i + 1}`}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>

          {currentIndex < questions.length - 1 ? (
            <button
              id="next-question-btn"
              onClick={() => setCurrentIndex((i) => i + 1)}
              disabled={isSubmitting}
              className="btn-primary px-8 shrink-0"
            >
              Next →
            </button>
          ) : (
            <div className="flex flex-col items-center">
              {!canSubmit && (
                <span className="text-[10px] text-amber-500 font-bold uppercase mb-1 animate-pulse">
                  Unlocks in {formatTime(Math.ceil((totalSeconds / 2) - elapsedSeconds))}
                </span>
              )}
              <button
                id="submit-quiz-btn"
                onClick={confirmSubmit}
                disabled={isSubmitting || !canSubmit}
                className={`btn-accent px-8 shrink-0 flex items-center gap-2 ${!canSubmit ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    ...
                  </>
                ) : (
                  '🚀 Submit'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Mobile question grid */}
        <div className="md:hidden mt-6 card p-4 bg-slate-900/50 border-slate-800">
          <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">Jump to:</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, i) => {
              const isCurrent = i === currentIndex
              const isAnswered = !!answers[q._id]
              const isSkipped = i < currentIndex && !isAnswered
              
              return (
                <button
                  key={q._id}
                  id={`mobile-jump-q-${i}-btn`}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-10 h-10 rounded-lg text-xs font-semibold transition-all
                    ${isCurrent
                      ? 'bg-brand-600 text-white'
                      : isAnswered
                        ? 'bg-emerald-600 text-emerald-50'
                        : isSkipped
                          ? 'bg-amber-600/40 text-amber-200'
                          : 'bg-slate-800 text-slate-500'}`}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
