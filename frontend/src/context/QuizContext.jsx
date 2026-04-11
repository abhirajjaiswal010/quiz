import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getQuizStatus, submitQuiz as submitQuizApi, saveProgress } from '../api/quizApi'
import { useSocket } from './SocketContext'
import toast from 'react-hot-toast'

const QuizContext = createContext(null)

// ── Shuffle helper ──────────────────────────────────────────────────────────
function shuffleArray(array) {
  const newArr = [...array]
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
  }
  return newArr
}

// ── Randomize question + options order (stable per student session) ─────────
function randomizeQuestions(rawQuestions) {
  return shuffleArray(rawQuestions).map(q => ({
    ...q,
    options: shuffleArray(q.options),
  }))
}

export const QuizProvider = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const socket = useSocket()

  // ── Persisted student identity ────────────────────────────────────────────
  const [student, setStudent] = useState(() => {
    const saved = localStorage.getItem('quiz_student')
    return saved ? JSON.parse(saved) : null
  })

  // ── Quiz questions (randomized order cached in localStorage) ──────────────
  const [questions, setQuestions] = useState(() => {
    const saved = localStorage.getItem('quiz_questions')
    return saved ? JSON.parse(saved) : []
  })

  // ── Answers: { questionId: selectedOption } ───────────────────────────────
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem('quiz_answers')
    return saved ? JSON.parse(saved) : {}
  })

  // ── Final result ──────────────────────────────────────────────────────────
  const [result, setResult] = useState(() => {
    const saved = localStorage.getItem('quiz_result')
    return saved ? JSON.parse(saved) : null
  })

  const [leaderboard, setLeaderboard] = useState([])

  // ── Server-authoritative timing (NEVER touch after quiz starts) ───────────
  // startTime: epoch ms when admin started the quiz (from server)
  // quizDuration: minutes (from server)
  const [startTime, setStartTime] = useState(() => {
    const saved = localStorage.getItem('quiz_start_time')
    return saved ? parseInt(saved, 10) : null
  })
  const [quizDuration, setQuizDuration] = useState(() => {
    const saved = localStorage.getItem('quiz_duration')
    return saved ? parseInt(saved, 10) : 15
  })

  const [allowTabSwitching, setAllowTabSwitching] = useState(() => {
    return localStorage.getItem('quiz_allow_tabs') === 'true'
  })

  // ── UI states ─────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('register')
  const [isQuizActive, setIsQuizActive] = useState(false)
  const [participantCount, setParticipantCount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Prevent duplicate socket-triggered submit runs
  const submitLock = useRef(false)

  // ── Persistence effects ───────────────────────────────────────────────────
  useEffect(() => {
    if (student) {
      localStorage.setItem('quiz_student', JSON.stringify(student))
    } else {
      // Full cleanup on logout/reset
      ;[
        'quiz_student', 'quiz_questions', 'quiz_answers',
        'quiz_start_time', 'quiz_duration', 'quiz_allow_tabs',
        'quiz_result', 'quiz_strikes',
      ].forEach(k => localStorage.removeItem(k))
    }
  }, [student])

  useEffect(() => {
    if (questions.length) localStorage.setItem('quiz_questions', JSON.stringify(questions))
    else localStorage.removeItem('quiz_questions')
  }, [questions])

  useEffect(() => {
    if (Object.keys(answers).length) localStorage.setItem('quiz_answers', JSON.stringify(answers))
    else localStorage.removeItem('quiz_answers')
  }, [answers])

  useEffect(() => {
    if (result) localStorage.setItem('quiz_result', JSON.stringify(result))
    else localStorage.removeItem('quiz_result')
  }, [result])

  useEffect(() => {
    if (startTime) localStorage.setItem('quiz_start_time', startTime.toString())
  }, [startTime])

  useEffect(() => {
    localStorage.setItem('quiz_duration', quizDuration.toString())
  }, [quizDuration])

  useEffect(() => {
    localStorage.setItem('quiz_allow_tabs', allowTabSwitching.toString())
  }, [allowTabSwitching])

  // ── Warn before tab close during quiz ────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (phase === 'quiz' && !isSubmitting) {
        e.preventDefault()
        e.returnValue = 'Your quiz is in progress. Timer keeps running — your answers are saved.'
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [phase, isSubmitting])

  // ── Sync phase with URL ───────────────────────────────────────────────────
  useEffect(() => {
    const path = location.pathname
    if (path === '/') setPhase('register')
    else if (path === '/waiting') setPhase('waiting')
    else if (path === '/quiz') setPhase('quiz')
    else if (path === '/leaderboard') setPhase('leaderboard')
  }, [location.pathname])

  const updatePhase = useCallback((newPhase) => {
    setPhase(newPhase)
    const routes = { register: '/', waiting: '/waiting', quiz: '/quiz', leaderboard: '/leaderboard' }
    if (routes[newPhase] && location.pathname !== routes[newPhase]) {
      navigate(routes[newPhase])
    }
  }, [navigate, location.pathname])

  // ── Core: Initialize quiz state from server data ──────────────────────────
  // Used for: fresh start, late join, reconnect
  const initQuizFromServer = useCallback((serverData, studentData, savedAnswers = {}) => {
    const { questions: rawQuestions, startTime: serverStartTime, duration, allowTabSwitching: allowTabs } = serverData

    // Always randomize questions (but keep same order on reconnect via localStorage)
    const savedQs = localStorage.getItem('quiz_questions')
    let finalQuestions
    if (savedQs) {
      const parsed = JSON.parse(savedQs)
      // Validate they belong to same quiz by checking ids match
      const serverIds = new Set(rawQuestions.map(q => q._id))
      const savedIds = new Set(parsed.map(q => q._id))
      const isSameSet = [...serverIds].every(id => savedIds.has(id)) && serverIds.size === savedIds.size
      finalQuestions = isSameSet ? parsed : randomizeQuestions(rawQuestions)
    } else {
      finalQuestions = randomizeQuestions(rawQuestions)
    }

    setStudent(studentData)
    setQuestions(finalQuestions)
    setAnswers(savedAnswers)           // Restore previous answers if reconnecting
    setStartTime(serverStartTime)      // Authoritative server time
    setQuizDuration(duration || 15)
    setAllowTabSwitching(!!allowTabs)
    updatePhase('quiz')
  }, [updatePhase])

  // ── Submit quiz ───────────────────────────────────────────────────────────
  const submitCurrentQuiz = useCallback(async (isAuto = false) => {
    if (submitLock.current || !student || !questions.length) return
    submitLock.current = true
    setIsSubmitting(true)

    // Use server startTime for accurate timeTaken calculation
    const timeTaken = startTime
      ? Math.round((Date.now() - startTime) / 1000)
      : (quizDuration * 60) // fallback: treat as used full time

    const answersPayload = questions.map(q => ({
      questionId: q._id,
      selected: answers[q._id] || null,
    }))

    try {
      const data = await submitQuizApi({
        name: student.name,
        studentId: student.studentId,
        quizId: student.quizId,
        answers: answersPayload,
        timeTaken,
      })
      setResult({ ...data.result, total: data.result?.totalQuestions || data.totalQuestions })
      updatePhase('leaderboard')
    } catch (err) {
      console.error('Submission failed:', err)
      if (isAuto) {
        // Timer expired or admin ended quiz — still move to leaderboard
        updatePhase('leaderboard')
      } else {
        toast.error(err.message || 'Submission failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
      submitLock.current = false
    }
  }, [student, questions, answers, startTime, quizDuration, updatePhase])

  // ── Select answer + immediately persist to backend ────────────────────────
  const selectAnswer = useCallback((questionId, option) => {
    setAnswers(prev => {
      const updated = { ...prev, [questionId]: option }

      // Fire-and-forget save to backend (debounced effect not needed — per-answer is fine)
      if (student?.quizId && student?.studentId) {
        saveProgress({
          quizId: student.quizId,
          studentId: student.studentId,
          answers: updated,
        }).catch(() => { })
      }

      return updated
    })
  }, [student])

  // ── WebSocket Listeners ───────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !student?.quizId) return

    const quizId = student.quizId.toUpperCase()
    socket.emit('joinQuiz', { quizId, studentId: student.studentId })

    // Admin started quiz → broadcast received by waiting students
    const handleQuizStarted = (data) => {
      console.log('🚀 quizStarted', data)
      setAllowTabSwitching(data.allowTabSwitching)
      setQuizDuration(data.duration || 15)
      initQuizFromServer(data, student, {})
      toast.success('Quiz has started! Good luck! 🚀')
    }

    // Admin stopped quiz → force submit if in quiz
    const handleQuizStopped = () => {
      console.log('🛑 quizStopped')
      if (phase === 'quiz') {
        toast.error('Admin ended the quiz. Auto-submitting…', { id: 'quiz-stopped' })
        submitCurrentQuiz(true)
      } else {
        updatePhase('leaderboard')
      }
    }

    const handleParticipantJoined = (data) => {
      console.log('👤 participantJoined', data)
      setParticipantCount(data.participantCount || 0)
    }

    const handleLeaderboardUpdate = (data) => {
      setLeaderboard(data.results || [])
    }

    socket.on('quizStarted', handleQuizStarted)
    socket.on('quizStopped', handleQuizStopped)
    socket.on('leaderboardUpdate', handleLeaderboardUpdate)
    socket.on('participantJoined', handleParticipantJoined)

    return () => {
      socket.off('quizStarted', handleQuizStarted)
      socket.off('quizStopped', handleQuizStopped)
      socket.off('leaderboardUpdate', handleLeaderboardUpdate)
      socket.off('participantJoined', handleParticipantJoined)
    }
  }, [socket, student?.quizId, student, phase, initQuizFromServer, submitCurrentQuiz, updatePhase])

  // ── Polling Fallback (reduced frequency) ──────────────────────────────────
  // Only used when socket misses events (network blip, etc.)
  useEffect(() => {
    const checkStatus = async () => {
      if (!student?.quizId) return
      try {
        const data = await getQuizStatus(student.quizId)
        setIsQuizActive(data.isActive)
        setParticipantCount(data.participantCount || 0)

        // Only act on poll data if we're in waiting — to catch missed socket events
        if (data.isActive && data.startTime && phase === 'waiting' && questions.length === 0) {
          const { getQuestions } = await import('../api/quizApi')
          const qData = await getQuestions(student.quizId)
          initQuizFromServer(
            {
              questions: qData.questions,
              startTime: qData.startTime || data.startTime,
              duration: qData.duration || data.quizDetails?.duration || 15,
              allowTabSwitching: qData.allowTabSwitching || false,
            },
            student,
            {}
          )
        }

        if (!data.isActive && phase === 'quiz') {
          updatePhase('leaderboard')
        }
      } catch (_) { }
    }

    const interval = setInterval(checkStatus, 15000)
    checkStatus()
    return () => clearInterval(interval)
  }, [phase, student?.quizId, student, questions.length, initQuizFromServer, updatePhase])

  // ── goToWaiting (called after joinQuiz responds with quizState='waiting') ──
  const goToWaiting = useCallback((studentData) => {
    setStudent(studentData)
    setQuestions([])
    setAnswers({})
    updatePhase('waiting')
  }, [updatePhase])

  // ── goToQuiz (called after joinQuiz responds with quizState='active') ──────
  // This handles both late joiners and reconnecting students
  const goToQuiz = useCallback((studentData, serverData, savedAnswers = {}) => {
    initQuizFromServer(serverData, studentData, savedAnswers)
  }, [initQuizFromServer])

  const completeQuiz = useCallback((submissionResult) => {
    setResult(submissionResult)
    updatePhase('leaderboard')
  }, [updatePhase])

  const goToLeaderboard = useCallback(() => updatePhase('leaderboard'), [updatePhase])

  const reset = useCallback(() => {
    setStudent(null)
    setQuestions([])
    setAnswers({})
    setResult(null)
    setStartTime(null)
    submitLock.current = false
    updatePhase('register')
  }, [updatePhase])

  return (
    <QuizContext.Provider
      value={{
        student,
        questions,
        answers,
        result,
        phase,
        isQuizActive,
        participantCount,
        quizDuration,
        startTime,
        allowTabSwitching,
        isSubmitting,
        leaderboard,
        // Actions
        goToWaiting,
        goToQuiz,
        selectAnswer,
        submitCurrentQuiz,
        completeQuiz,
        goToLeaderboard,
        reset,
      }}
    >
      {children}
    </QuizContext.Provider>
  )
}

export const useQuiz = () => {
  const ctx = useContext(QuizContext)
  if (!ctx) throw new Error('useQuiz must be used within QuizProvider')
  return ctx
}
