import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QuizProvider, useQuiz } from './context/QuizContext'
import { SocketProvider } from './context/SocketContext'
import RegistrationPage from './pages/RegistrationPage'
import QuizPage from './pages/QuizPage'
import WaitingPage from './pages/WaitingPage'
import LeaderboardPage from './pages/LeaderboardPage'
import AdminPanel from './pages/AdminPanel'
import { Toaster } from 'react-hot-toast'

function AppRoutes() {
  const { phase, result, student } = useQuiz()

  return (
    <Routes>
      <Route path="/" element={result ? <Navigate to="/leaderboard" replace /> : <RegistrationPage />} />
      <Route path="/waiting" element={<WaitingPage />} />
      <Route path="/quiz" element={result ? <Navigate to="/leaderboard" replace /> : <QuizPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/admin" element={<AdminPanel />} />
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SocketProvider>
        <QuizProvider>
          <Toaster position="top-center" toastOptions={{ 
            style: { 
              background: '#0f172a', 
              color: '#fff', 
              border: '1px solid #1e293b',
              borderRadius: '12px'
            } 
          }} />
          <AppRoutes />
        </QuizProvider>
      </SocketProvider>
    </Router>
  )
}
