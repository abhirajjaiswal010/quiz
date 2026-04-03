import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuiz } from '../context/QuizContext'
import { submitQuiz } from '../api/quizApi'

const QUIZ_DURATION = 15 * 60 // 15 minutes in seconds

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function QuizPage() {
  const { student, questions, answers, selectAnswer, completeQuiz } = useQuiz()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [isFullscreenWarning, setIsFullscreenWarning] = useState(false)
  const startTimeRef = useRef(Date.now())
  const hasSubmitted = useRef(false)

  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const progress = ((currentIndex + 1) / questions.length) * 100

  // ── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit(true)
      return
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  // ── Fullscreen anti-cheat warning ────────────────────────────────────────
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setIsFullscreenWarning(true)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // ── Submit Logic ─────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (autoSubmit = false) => {
      if (hasSubmitted.current) return
      hasSubmitted.current = true
      setSubmitting(true)
      setShowConfirm(false)
      setSubmitError('')

      const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000)
      const answersPayload = questions.map((q) => ({
        questionId: q._id,
        selected: answers[q._id] || null,
      }))

      try {
        const data = await submitQuiz({
          name: student.name,
          roll: student.roll,
          quizId: student.quizId,
          answers: answersPayload,
          timeTaken,
        })
        completeQuiz({ ...data.result, total: data.totalQuestions })
      } catch (err) {
        hasSubmitted.current = false
        setSubmitting(false)
        if (err.data?.duplicate) {
          setSubmitError('You have already submitted this quiz.')
        } else {
          setSubmitError(err.message || 'Submission failed. Please try again.')
        }
      }
    },
    [student, questions, answers, completeQuiz]
  )

  const confirmSubmit = () => {
    const unanswered = questions.length - answeredCount
    if (unanswered > 0) {
      setShowConfirm(true)
    } else {
      handleSubmit()
    }
  }

  if (!questions.length) return null

  const timerColor =
    timeLeft > 300 ? 'text-emerald-400' : timeLeft > 60 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      {/* ── Fullscreen Warning ── */}
      {isFullscreenWarning && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6 animate-fade-in">
          <div className="card max-w-sm w-full p-8 text-center border-red-700">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="font-display text-2xl font-bold text-red-400 mb-2">Tab Switch Detected</h2>
            <p className="text-slate-400 text-sm mb-6">
              Switching tabs during the quiz is not allowed. Please return to the quiz window.
            </p>
            <button
              id="return-to-quiz-btn"
              onClick={() => setIsFullscreenWarning(false)}
              className="btn-primary w-full"
            >
              I Understand — Return to Quiz
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
                onClick={() => handleSubmit()}
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
              className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full progress-bar"
              style={{ width: `${progress}%` }}
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
        <div key={currentQuestion._id} className="card p-6 md:p-8 mb-6 animate-slide-up">
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
                  className={`option-btn ${isSelected ? 'selected' : ''}`}
                  disabled={submitting}
                >
                  <span className={`inline-flex w-7 h-7 rounded-lg items-center justify-center text-xs font-bold mr-3 flex-shrink-0 align-middle
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
            disabled={currentIndex === 0 || submitting}
            className="btn-secondary"
          >
            ← Previous
          </button>

          {/* Question dots (desktop) */}
          <div className="hidden md:flex flex-wrap justify-center gap-1.5 flex-1">
            {questions.map((q, i) => (
              <button
                key={q._id}
                id={`jump-q-${i}-btn`}
                onClick={() => setCurrentIndex(i)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all duration-150
                  ${i === currentIndex
                    ? 'bg-brand-600 text-white scale-110'
                    : answers[q._id]
                      ? 'bg-emerald-700/60 text-emerald-300'
                      : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                title={`Question ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {currentIndex < questions.length - 1 ? (
            <button
              id="next-question-btn"
              onClick={() => setCurrentIndex((i) => i + 1)}
              disabled={submitting}
              className="btn-primary"
            >
              Next →
            </button>
          ) : (
            <button
              id="submit-quiz-btn"
              onClick={confirmSubmit}
              disabled={submitting}
              className="btn-accent"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                '🚀 Submit Quiz'
              )}
            </button>
          )}
        </div>

        {/* Mobile question grid */}
        <div className="md:hidden mt-6 card p-4">
          <p className="text-xs text-slate-500 mb-3 font-medium">Jump to question:</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, i) => (
              <button
                key={q._id}
                id={`mobile-jump-q-${i}-btn`}
                onClick={() => setCurrentIndex(i)}
                className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all
                  ${i === currentIndex
                    ? 'bg-brand-600 text-white'
                    : answers[q._id]
                      ? 'bg-emerald-700/60 text-emerald-300'
                      : 'bg-slate-800 text-slate-500'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
