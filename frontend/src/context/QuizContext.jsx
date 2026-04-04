import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getQuizStatus, submitQuiz as submitQuizApi } from '../api/quizApi'
import { useSocket } from './SocketContext'
import toast from 'react-hot-toast'

const QuizContext = createContext(null)

export const QuizProvider = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const socket = useSocket() // Access the global socket instance

  const [student, setStudent] = useState(() => {
    const saved = localStorage.getItem('quiz_student')
    return saved ? JSON.parse(saved) : null
  })
  const [questions, setQuestions] = useState(() => {
    const saved = localStorage.getItem('quiz_questions')
    return saved ? JSON.parse(saved) : []
  })
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem('quiz_answers')
    return saved ? JSON.parse(saved) : {}
  })
  const [result, setResult] = useState(() => {
    const saved = localStorage.getItem('quiz_result')
    return saved ? JSON.parse(saved) : null
  })

  const [phase, setPhase] = useState('register')
  const [isQuizActive, setIsQuizActive] = useState(false)
  const [participantCount, setParticipantCount] = useState(0)
  const [quizDuration, setQuizDuration] = useState(15) // Minutes
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startTime, setStartTime] = useState(() => {
    const saved = localStorage.getItem('quiz_start_time')
    return saved ? parseInt(saved) : null
  })
  const [allowTabSwitching, setAllowTabSwitching] = useState(() => {
    return localStorage.getItem('quiz_allow_tabs') === 'true'
  })

  // ── Persistence ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (student) localStorage.setItem('quiz_student', JSON.stringify(student))
    else {
      localStorage.removeItem('quiz_student');
      localStorage.removeItem('quiz_questions');
      localStorage.removeItem('quiz_answers');
      localStorage.removeItem('quiz_start_time');
      localStorage.removeItem('quiz_allow_tabs');
    }
  }, [student])

  useEffect(() => {
    localStorage.setItem('quiz_allow_tabs', allowTabSwitching.toString())
  }, [allowTabSwitching])

  useEffect(() => {
    if (result) localStorage.setItem('quiz_result', JSON.stringify(result))
    else localStorage.removeItem('quiz_result')
  }, [result])

  useEffect(() => {
    if (questions.length) localStorage.setItem('quiz_questions', JSON.stringify(questions))
  }, [questions])

  useEffect(() => {
    if (Object.keys(answers).length) localStorage.setItem('quiz_answers', JSON.stringify(answers))
  }, [answers])

  useEffect(() => {
    if (startTime) localStorage.setItem('quiz_start_time', startTime.toString())
  }, [startTime])

  // ── Anti-Tab-Close ──
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (phase === 'quiz' && !isSubmitting) {
        e.preventDefault();
        e.returnValue = 'You have an active quiz session. Are you sure you want to leave? Your progress will be saved but the timer continues.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [phase, isSubmitting]);

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

  // ── Shuffling Utility (Move up to prevent initialization errors) ──────────
  const shuffleArray = (array) => {
    const newArr = [...array]
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]]
    }
    return newArr
  }

  const startQuiz = useCallback((studentData, loadedQuestions, allowTabs = false) => {
    const randomizedQuestions = shuffleArray(loadedQuestions).map(q => ({
      ...q,
      options: shuffleArray(q.options)
    }))

    setStudent(studentData)
    setQuestions(randomizedQuestions)
    setAnswers({})
    setStartTime(Date.now())
    setAllowTabSwitching(!!allowTabSwitching)
    updatePhase('quiz')
  }, [updatePhase])

  const submitCurrentQuiz = useCallback(async (isAuto = false) => {
    if (isSubmitting || !student || !questions.length) return;
    setIsSubmitting(true);

    const timeTaken = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    const answersPayload = questions.map((q) => ({
      questionId: q._id,
      selected: answers[q._id] || null,
    }));

    try {
      const data = await submitQuizApi({
        name: student.name,
        roll: student.roll,
        quizId: student.quizId,
        answers: answersPayload,
        timeTaken,
      });
      setResult({ ...data.result, total: data.totalQuestions });
      updatePhase('leaderboard');
    } catch (err) {
      console.error('Submission failed', err);
      // Even if failed, if auto-submit (quiz ended), move to leaderboard
      if (isAuto) updatePhase('leaderboard');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, student, questions, answers, startTime, updatePhase]);

  // ── WebSocket Live Listeners ────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !student?.quizId) return;

    const quizId = student.quizId.toUpperCase();
    socket.emit('joinQuiz', quizId);

    socket.on('quizStarted', (data) => {
      console.log('🚀 Quiz Started via Socket', data);
      setAllowTabSwitching(data.allowTabSwitching)
      setQuizDuration(data.duration || 15)
      startQuiz(student, data.questions, data.allowTabSwitching);
      toast.success('The quiz has started! Good luck!');
    });

    socket.on('quizStopped', () => {
      console.log('🛑 Quiz Stopped via Socket');
      if (phase === 'quiz') {
        toast.error('The admin has ended the quiz. Auto-submitting your answers...', { id: 'quiz-stopped' });
        submitCurrentQuiz(true); // Force submit
      } else {
        updatePhase('leaderboard');
      }
    });

    socket.on('leaderboardUpdate', (data) => {
      setResult(prev => ({ ...prev, leaderboard: data.results }));
    });

    return () => {
      socket.off('quizStarted');
      socket.off('quizStopped');
      socket.off('leaderboardUpdate');
    };
  }, [socket, student?.quizId, student, startQuiz, updatePhase, phase]);

  // ── Polling Fallback (Reduced Frequency) ────────────────────────────────────
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
        if (data.isActive && phase === 'waiting' && questions.length === 0) {
           const { getQuestions } = await import('../api/quizApi');
           const qData = await getQuestions(student.quizId);
           startQuiz(student, qData.questions);
        }
        if (!data.isActive && phase === 'quiz') {
           updatePhase('leaderboard')
        }
      } catch (err) {}
    }
    const interval = setInterval(checkStatus, 15000)
    checkStatus()
    return () => clearInterval(interval)
  }, [phase, updatePhase, student?.quizId, questions.length, student, startQuiz])

  const goToWaiting = useCallback((studentData) => {
    setStudent(studentData)
    setQuestions([])
    setAnswers({})
    updatePhase('waiting')
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
        startTime,
        allowTabSwitching,
        startQuiz,
        submitCurrentQuiz,
        isSubmitting,
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
