import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QuizProvider, useQuiz } from './context/QuizContext'
import { SocketProvider } from './context/SocketContext'
import RegistrationPage from './pages/RegistrationPage'
import QuizPage from './pages/QuizPage'
import WaitingPage from './pages/WaitingPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ReviewPage from './pages/ReviewPage'
import AdminPanel from './pages/AdminPanel'
import { Toaster } from 'react-hot-toast'
import WelcomePreloader from './components/WelcomePreloader'
import { useState, useEffect } from 'react'

function AppRoutes() {
  const { phase, result, student, questions, isQuizActive } = useQuiz()

  // ── Routing Guards ──
  // 1. If result exists, always force to leaderboard
  // 2. If quiz has started (questions loaded), force to quiz
  // 3. If registered but no questions, force to waiting
  
  return (
    <Routes>
      <Route path="/" element={
        result ? <Navigate to="/leaderboard" replace /> :
        questions.length > 0 ? <Navigate to="/quiz" replace /> :
        student ? <Navigate to="/waiting" replace /> :
        <RegistrationPage />
      } />

      <Route path="/waiting" element={
        result ? <Navigate to="/leaderboard" replace /> :
        questions.length > 0 ? <Navigate to="/quiz" replace /> :
        student ? <WaitingPage /> : <Navigate to="/" replace />
      } />

      <Route path="/quiz" element={
        result ? <Navigate to="/review" replace /> :
        !isQuizActive ? <Navigate to="/leaderboard" replace /> :
        questions.length > 0 ? <QuizPage /> : 
        student ? <Navigate to="/waiting" replace /> : <Navigate to="/" replace />
      } />

      <Route path="/review" element={<ReviewPage />} />

      <Route path="/leaderboard" element={
        (result || !isQuizActive) ? <LeaderboardPage /> : 
        questions.length > 0 ? <Navigate to="/quiz" replace /> :
        student ? <Navigate to="/waiting" replace /> : <Navigate to="/" replace />
      } />

      <Route path="/admin" element={<AdminPanel />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Check if they've already seen the preloader in this session
    const hasSeen = sessionStorage.getItem('has_seen_welcome');
    if (hasSeen) {
      setShowWelcome(false);
    }
  }, []);

  const handleWelcomeComplete = () => {
    sessionStorage.setItem('has_seen_welcome', 'true');
    setShowWelcome(false);
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SocketProvider>
        <QuizProvider>
          {showWelcome && <WelcomePreloader onComplete={handleWelcomeComplete} />}
          <Toaster position="top-center" toastOptions={{ 
            style: { 
              background: '#0f172a', 
              color: '#fff', 
              border: '1px solid #1e293b',
              borderRadius: '12px'
            } 
          }} />
          <div className={showWelcome ? 'hidden' : 'block'}>
            <AppRoutes />
          </div>
        </QuizProvider>
      </SocketProvider>
    </Router>
  )
}
