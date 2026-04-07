import { useState, useEffect, useCallback } from 'react'
import * as quizApi from '../api/quizApi'
import { useSocket } from '../context/SocketContext'
import { toast } from 'react-hot-toast'
import { Lock, Eye, EyeOff } from 'lucide-react'
import Threads from '../components/thread'
import AdminDashboard from './AdminDashboard'
import Beams from '../components/beams'

export default function AdminPanel() {
  const [adminKey, setAdminKey] = useState(localStorage.getItem('adminKey') || '')
  const [showKey, setShowKey] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const socket = useSocket()

  const [tab, setTab] = useState('control') // control | questions
  const [quizId, setQuizId] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [participantCount, setParticipantCount] = useState(0)
  const [participants, setParticipants] = useState([])
  const [sessionInfo, setSessionInfo] = useState(null)
  const [duration, setDuration] = useState(15) // Default 15 mins
  const [allowTabSwitching, setAllowTabSwitching] = useState(false)

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
  const fetchStatus = useCallback(async (silent = false) => {
    if (!quizId) return
    try {
      const data = await quizApi.getQuizStatus(quizId)
      setStatus(data.isActive)
      setParticipantCount(data.participantCount || 0)
      setParticipants(data.participants || [])
      setSessionInfo({
        totalQuestions: data.totalQuestions,
        createdAt: data.createdAt,
        quizDetails: data.quizDetails
      })

      if (data.quizDetails?.allowTabSwitching !== undefined) {
        setAllowTabSwitching(data.quizDetails.allowTabSwitching)
      }

      // Always fetch leaderboard data to show live results
      const lbData = await quizApi.getLeaderboard(quizId)
      setLeaderboard(lbData.results || [])
    } catch (err) {
      if (!silent) {
        setStatus(null)
        toast.error(err.message || 'Quiz not found')
      }
    }
  }, [quizId])

  // ── WebSocket Live Updates ───────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !isAuthorized || !quizId || status === null) return;

    const normalizedId = quizId.toUpperCase();
    socket.emit('adminJoin', normalizedId);

    socket.on('participantJoined', (data) => {
      setParticipantCount(data.participantCount);
      if (data.name && data.roll) {
        setParticipants(prev => {
          // Prevent duplicates in state
          if (prev.some(p => p.roll === data.roll)) return prev;
          return [{ name: data.name, roll: data.roll, joinedAt: new Date() }, ...prev];
        });
        toast.success(`${data.name} joined!`, { id: 'join-alert' });
      }
    });

    socket.on('resultSubmitted', (data) => {
      setLeaderboard(data.results);
      setParticipantCount(data.participantCount);
    });

    return () => {
      socket.off('participantJoined');
      socket.off('resultSubmitted');
    };
  }, [socket, isAuthorized, quizId, status]);

  // ── Polling Fallback (Slow) ───────────────────────────────────────────────
  useEffect(() => {
    let interval;
    if (isAuthorized && quizId && status !== null) {
      interval = setInterval(() => {
        fetchStatus(true); // Silent slow fallback
      }, 20000); // 20s fallback
    }
    return () => clearInterval(interval);
  }, [isAuthorized, quizId, status, fetchStatus]);

  const handleCreate = async () => {
    if (!quizId) return toast.error('Enter a quizId')
    const normalizedId = quizId.trim().toUpperCase()
    setLoading(true)
    try {
      await quizApi.createQuiz(adminKey, normalizedId, duration, allowTabSwitching)
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
      await quizApi.startQuiz(adminKey, quizId, allowTabSwitching)
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

  const handleBulkUpload = async (jsonQuestions) => {
    setLoading(true)
    try {
      await quizApi.uploadQuestions(adminKey, jsonQuestions)
      toast.success('Batch upload successful!')
      fetchQuestions()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
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
          {/* <Threads amplitude={1} distance={0.1} enableMouseInteraction /> */}
           <Beams
    beamWidth={3}
    beamHeight={30}
    beamNumber={20}
    lightColor="#55b4dd"
    speed={2}
    noiseIntensity={1.75}
    scale={0.2}
    rotation={30}
  />
        </div>

        <div className="card relative z-10 bg-[#0f0f0f]/10 backdrop-blur-sm max-w-sm w-full p-8 text-center shadow-2xl border-white/20">
          <div className="mx-auto w-16 h-16 bg-[#4FB3FF]/10 rounded-2xl flex items-center justify-center mb-6 text-[#4FB3FF] ">
            <Lock size={32} />
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-white text-sm mb-8">Enter your Secret Key to manage the quiz</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                name="key"
                type={showKey ? "text" : "password"}
                placeholder="Admin Secret Key"
                className="input-field bg-[#0f0f0f]/20 border border-white/20 uppercase text-white py-2 text-[10px] focus:border-white transition-colors w-full pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                title={showKey ? "Hide Secret Key" : "Show Secret Key"}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary bg-white w-full py-4 uppercase font-bold text-black hover:bg-white/90 transition-all">
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
      duration={duration}
      setDuration={setDuration}
      allowTabSwitching={allowTabSwitching}
      setAllowTabSwitching={setAllowTabSwitching}
      loading={loading}
      status={status}
      participantCount={participantCount}
      participants={participants}
      sessionInfo={sessionInfo}
      leaderboard={leaderboard}
      handleLogout={handleLogout}
      questions={questions}
      qForm={qForm}
      setQForm={setQForm}
      handleSaveQuestion={handleSaveQuestion}
      editingId={editingId}
      setEditingId={setEditingId}
      handleDeleteQuestion={handleDeleteQuestion}
      handleBulkUpload={handleBulkUpload}
    />
  )
}
