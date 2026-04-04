import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getQuizStatus } from '../api/quizApi'
import toast from 'react-hot-toast'

const QuizContext = createContext(null)

export const QuizProvider = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const [student, setStudent] = useState(() => {
    const saved = localStorage.getItem('quiz_student')
    return saved ? JSON.parse(saved) : null
  })
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(() => {
    const saved = localStorage.getItem('quiz_result')
    return saved ? JSON.parse(saved) : null
  })

  const [phase, setPhase] = useState('register')
  const [isQuizActive, setIsQuizActive] = useState(false)
  const [participantCount, setParticipantCount] = useState(0)
  const [quizDuration, setQuizDuration] = useState(15) // Minutes

  // ── Persistence ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (student) localStorage.setItem('quiz_student', JSON.stringify(student))
    else localStorage.removeItem('quiz_student')
  }, [student])

  useEffect(() => {
    if (result) localStorage.setItem('quiz_result', JSON.stringify(result))
    else localStorage.removeItem('quiz_result')
  }, [result])

  // ── Sync URL with phase ───────────────────────────────────────────────────
  useEffect(() => {
    const path = location.pathname
    if (path === '/') setPhase('register')
    else if (path === '/waiting') setPhase('waiting')
    else if (path === '/quiz') setPhase('quiz')
    else if (path === '/leaderboard') setPhase('leaderboard')
  }, [location.pathname])

  // ── Sync phase with URL (when changed programmatically) ─────────────────────
  const updatePhase = useCallback((newPhase) => {
    setPhase(newPhase)
    if (newPhase === 'register' && location.pathname !== '/') navigate('/')
    if (newPhase === 'waiting' && location.pathname !== '/waiting') navigate('/waiting')
    if (newPhase === 'quiz' && location.pathname !== '/quiz') navigate('/quiz')
    if (newPhase === 'leaderboard' && location.pathname !== '/leaderboard') navigate('/leaderboard')
  }, [navigate, location.pathname])

  // ── Polling Quiz Status ───────────────────────────────────────────────────
  useEffect(() => {
    const checkStatus = async () => {
      if (!student?.quizId) return;

      try {
        const data = await getQuizStatus(student.quizId)
        setIsQuizActive(data.isActive)
        setParticipantCount(data.participantCount || 0)
        if (data.totalQuestions && data.quizDetails?.duration) {
           setQuizDuration(data.quizDetails.duration)
        }

        // Auto-start if waiting and quiz becomes active
        if (data.isActive && phase === 'waiting') {
           const { getQuestions } = await import('../api/quizApi');
           const qData = await getQuestions(student.quizId);
           startQuiz(student, qData.questions);
        }

        // Auto-end if quiz stops
        if (!data.isActive && phase === 'quiz') {
           updatePhase('leaderboard')
        }
      } catch (err) {
        // If the quizId doesn't exist, kick the student back to registration
        if (err.message?.toLowerCase().includes('not found') || err.message?.toLowerCase().includes('quiz')) {
          toast.error('Quiz not found. Check your Quiz ID and try again.', { id: 'quiz-not-found' })
          setStudent(null)
          setQuestions([])
          updatePhase('register')
        }
      }
    }

    const interval = setInterval(checkStatus, 3000)
    checkStatus()

    return () => clearInterval(interval)
  }, [phase, updatePhase, student?.quizId])

  const goToWaiting = useCallback((studentData) => {
    setStudent(studentData)
    setQuestions([])
    setAnswers({})
    updatePhase('waiting')
  }, [updatePhase])

  // ── Shuffling Utility ───────────────────────────────────────────────────
  const shuffleArray = (array) => {
    const newArr = [...array]
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]]
    }
    return newArr
  }

  const startQuiz = useCallback((studentData, loadedQuestions) => {
    // 1. Shuffle the order of questions
    let randomizedQuestions = shuffleArray(loadedQuestions)

    // 2. Shuffle the options within each question
    randomizedQuestions = randomizedQuestions.map(q => ({
      ...q,
      options: shuffleArray(q.options)
    }))

    setStudent(studentData)
    setQuestions(randomizedQuestions)
    setAnswers({})
    updatePhase('quiz')
  }, [updatePhase])

  const selectAnswer = useCallback((questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }))
  }, [])

  const completeQuiz = useCallback((submissionResult) => {
    setResult(submissionResult)
    updatePhase('leaderboard') // Now syncing with leaderboard path directly
  }, [updatePhase])

  const goToLeaderboard = useCallback(() => {
    updatePhase('leaderboard')
  }, [updatePhase])

  const reset = useCallback(() => {
    setStudent(null)
    setQuestions([])
    setAnswers({})
    setResult(null)
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
        startQuiz,
        goToWaiting,
        selectAnswer,
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
