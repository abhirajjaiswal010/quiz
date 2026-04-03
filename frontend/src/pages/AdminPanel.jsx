import { useState, useEffect, useCallback } from 'react'
import * as quizApi from '../api/quizApi'
import { toast } from 'react-hot-toast'
import { Lock } from 'lucide-react'
import Threads from '../components/thread'
import AdminDashboard from './AdminDashboard'

export default function AdminPanel() {
  const [adminKey, setAdminKey] = useState(localStorage.getItem('adminKey') || '')
  const [isAuthorized, setIsAuthorized] = useState(false)

  const [tab, setTab] = useState('control') // control | questions
  const [quizId, setQuizId] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [participantCount, setParticipantCount] = useState(0)

  // Questions state
  const [questions, setQuestions] = useState([])
  const [qForm, setQForm] = useState({ question: '', options: ['', '', '', ''], answer: '' })
  const [editingId, setEditingId] = useState(null)

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState([])

  // ── Auth ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    const key = e.target.key.value
    setLoading(true)
    try {
      await quizApi.verifyAdmin(key)
      setAdminKey(key)
      setIsAuthorized(true)
      localStorage.setItem('adminKey', key)
      toast.success('Authorized')
    } catch (err) {
      toast.error('Invalid Secret Key')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setAdminKey('')
    setIsAuthorized(false)
    localStorage.removeItem('adminKey')
  }

  // ── Session Control ───────────────────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    if (!quizId) return
    try {
      const data = await quizApi.getQuizStatus(quizId)
      setStatus(data.isActive)
      setParticipantCount(data.participantCount || 0)

      if (!data.isActive) {
        const lbData = await quizApi.getLeaderboard(quizId)
        setLeaderboard(lbData.results || [])
      }
    } catch (err) {
      setStatus(null)
      toast.error(err.message || 'Quiz not found')
    }
  }, [quizId])

  const handleCreate = async () => {
    if (!quizId) return toast.error('Enter a quizId')
    setLoading(true)
    try {
      await quizApi.createQuiz(adminKey, quizId)
      toast.success('Quiz created')
      fetchStatus()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStart = async () => {
    setLoading(true)
    try {
      await quizApi.startQuiz(adminKey, quizId)
      toast.success('Quiz STARTED')
      fetchStatus()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStop = async () => {
    setLoading(true)
    try {
      await quizApi.stopQuiz(adminKey, quizId)
      toast.success('Quiz STOPPED')
      fetchStatus()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Question Management ──────────────────────────────────────────────────
  const fetchQuestions = useCallback(async () => {
    try {
      const data = await quizApi.getAdminQuestions(adminKey)
      setQuestions(data.questions)
    } catch (err) {
      toast.error('Failed to fetch questions')
    }
  }, [adminKey])

  const handleSaveQuestion = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingId) {
        await quizApi.updateQuestion(adminKey, editingId, qForm)
        toast.success('Updated')
      } else {
        await quizApi.addQuestion(adminKey, qForm)
        toast.success('Added')
      }
      setQForm({ question: '', options: ['', '', '', ''], answer: '' })
      setEditingId(null)
      fetchQuestions()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return
    try {
      await quizApi.deleteQuestion(adminKey, id)
      toast.success('Deleted')
      fetchQuestions()
    } catch (err) {
      toast.error(err.message)
    }
  }

  useEffect(() => {
    if (adminKey) {
      quizApi.verifyAdmin(adminKey)
        .then(() => {
          setIsAuthorized(true)
          fetchQuestions()
        })
        .catch(() => handleLogout())
    }
  }, [adminKey, fetchQuestions])

  // ── UI Components ────────────────────────────────────────────────────────
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] p-6 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <Threads  amplitude={1} distance={0.1} enableMouseInteraction />
        </div>
        
        <div className="card relative z-10 bg-[#0f0f0f]/10 backdrop-blur-sm max-w-sm w-full p-8 text-center shadow-2xl border-white/20">
          <div className="mx-auto w-16 h-16 bg-[#4FB3FF]/10 rounded-2xl flex items-center justify-center mb-6 text-[#4FB3FF] ">
            <Lock size={32} />
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-white text-sm mb-8">Enter your Secret Key to manage the quiz</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input name="key" type="password" placeholder="Admin Secret Key" className="input-field bg-[#0f0f0f]/20 border border-white/20 uppercase text-white py-2 text-[10px] focus:border-white transition-colors" required />
            <button type="submit" disabled={loading} className="btn-primary bg-white w-full py-4">
              {loading ? 'Verifying...' : 'Unlock Panel'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <AdminDashboard
      tab={tab}
      setTab={setTab}
      quizId={quizId}
      setQuizId={setQuizId}
      fetchStatus={fetchStatus}
      handleCreate={handleCreate}
      handleStart={handleStart}
      handleStop={handleStop}
      loading={loading}
      status={status}
      participantCount={participantCount}
      leaderboard={leaderboard}
      handleLogout={handleLogout}
      questions={questions}
      qForm={qForm}
      setQForm={setQForm}
      handleSaveQuestion={handleSaveQuestion}
      editingId={editingId}
      setEditingId={setEditingId}
      handleDeleteQuestion={handleDeleteQuestion}
    />
  )
}
