import { useState, useEffect, useCallback } from 'react';
import * as quizApi from '../api/quizApi';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-hot-toast';

export const useAdminData = () => {
  const [adminKey, setAdminKey] = useState(localStorage.getItem('adminKey') || '');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const socket = useSocket();

  const [tab, setTab] = useState('control');
  const [quizId, setQuizId] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  const [duration, setDuration] = useState(15);
  const [allowTabSwitching, setAllowTabSwitching] = useState(false);

  // Questions & Archive state
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [qForm, setQForm] = useState({ question: '', options: ['', '', '', ''], answer: 0 });
  const [editingId, setEditingId] = useState(null);

  // Reset data when quizId changes to prevent leakage between sessions
  useEffect(() => {
    setStatus(null);
    setParticipantCount(0);
    setParticipants([]);
    setSessionInfo(null);
    setLeaderboard([]);
  }, [quizId]);

  // ── Session Methods ────────────────────────────────────────────────────────
  const fetchStatus = useCallback(async (manualId = null, silent = false) => {
    // If manualId is a React Event or not a string, ignore it and use quizId state
    const idToUse = (typeof manualId === 'string' ? manualId : quizId)?.trim()?.toUpperCase();
    if (!idToUse) return;
    try {
      const data = await quizApi.getQuizStatus(idToUse);
      setStatus(data.isActive);
      setParticipantCount(data.participantCount || 0);
      setParticipants(data.participants || []);
      setSessionInfo({
        totalQuestions: data.totalQuestions,
        createdAt: data.createdAt,
        quizDetails: data.quizDetails
      });
      if (data.quizDetails?.allowTabSwitching !== undefined) {
        setAllowTabSwitching(data.quizDetails.allowTabSwitching);
      }
      const lbData = await quizApi.getLeaderboard(idToUse);
      setLeaderboard(lbData.results || []);
    } catch (err) {
      if (!silent) {
        setStatus(null);
        toast.error(err.message || 'Quiz not found');
      }
    }
  }, [quizId]);

  const handleCreate = async () => {
    if (!quizId) return toast.error('Enter a quizId');
    setLoading(true);
    try {
      await quizApi.createQuiz(adminKey, quizId.trim().toUpperCase(), duration, allowTabSwitching);
      toast.success('Quiz created');
      setStatus(false); // Enable Launch button instantly
      fetchStatus();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      await quizApi.startQuiz(adminKey, quizId, allowTabSwitching);
      toast.success('Quiz STARTED');
      fetchStatus();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await quizApi.stopQuiz(adminKey, quizId);
      toast.success('Quiz STOPPED');
      fetchStatus();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Question Methods ───────────────────────────────────────────────────────
  const fetchQuestions = useCallback(async () => {
    try {
      const data = await quizApi.getAdminQuestions(adminKey);
      setQuestions(data.questions);
    } catch (err) {
      toast.error('Failed to fetch questions');
    }
  }, [adminKey]);

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await quizApi.getAllQuizzes(adminKey);
      setQuizzes(res.quizzes);
    } catch (err) {
      console.error('Fetch quizzes failed:', err);
    }
  }, [adminKey]);

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await quizApi.updateQuestion(adminKey, editingId, qForm);
        toast.success('Updated');
      } else {
        await quizApi.addQuestion(adminKey, qForm);
        toast.success('Added');
      }
      setQForm({ question: '', options: ['', '', '', ''], answer: 0 });
      setEditingId(null);
      fetchQuestions();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await quizApi.deleteQuestion(adminKey, id);
      toast.success('Deleted');
      fetchQuestions();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteQuiz = async (quizIdToDelete) => {
    if (!window.confirm(`Delete section ${quizIdToDelete}? Results will be lost.`)) return;
    setLoading(true);
    try {
      await quizApi.deleteQuiz(adminKey, quizIdToDelete);
      toast.success('Deleted');
      fetchQuizzes();
      if (quizIdToDelete === quizId) setStatus(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (jsonQuestions) => {
    setLoading(true);
    try {
      await quizApi.uploadQuestions(adminKey, jsonQuestions);
      toast.success('Success!');
      fetchQuestions();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Auth Methods ──────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    const key = e.target.key.value;
    setLoading(true);
    try {
      await quizApi.verifyAdmin(key);
      setAdminKey(key);
      setIsAuthorized(true);
      localStorage.setItem('adminKey', key);
      toast.success('Authorized');
    } catch (err) {
      toast.error('Invalid Secret Key');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAdminKey('');
    setIsAuthorized(false);
    localStorage.removeItem('adminKey');
  };

  // ── Lifecycle Effects ─────────────────────────────────────────────────────
  useEffect(() => {
    if (adminKey) {
      quizApi.verifyAdmin(adminKey)
        .then(() => {
          setIsAuthorized(true);
          fetchQuestions();
        })
        .catch(() => handleLogout());
    }
  }, [adminKey, fetchQuestions]);

  // Auto-fetch status when quizId changes to keep UI fresh
  useEffect(() => {
    if (isAuthorized && quizId && quizId.trim().length >= 3) {
      const timer = setTimeout(() => {
        fetchStatus(quizId, true);
      }, 500); // Small debounce to avoid spamming while typing
      return () => clearTimeout(timer);
    }
  }, [isAuthorized, quizId, fetchStatus]);

  useEffect(() => {
    // Removed 'status === null' check to allow joining room before status is fetched
    if (!socket || !isAuthorized || !quizId) return;

    const normalizedId = quizId.trim().toUpperCase();

    const joinRoom = () => {
      console.log(`📡 Attempting to join admin room: ${normalizedId}`);
      socket.emit('adminJoin', normalizedId);
      // Sync latest snapshot on every connection/reconnection
      fetchStatus(normalizedId, true);
    };

    // Join immediately if connected
    if (socket.connected) {
      joinRoom();
    }

    // Handle reconnections
    socket.on('connect', joinRoom);

    const handleParticipantJoined = (data) => {
      console.log('👤 Live Event: Participant Joined', data);
      setParticipantCount(data.participantCount);
      if (data.name && data.roll) {
        setParticipants(prev => {
          if (prev.some(p => p.roll === data.roll)) {
            // If they were already there (e.g. reconnected), clear their disconnected status
            return prev.map(p => p.roll === data.roll ? { ...p, isDisconnected: false } : p);
          }
          return [{ name: data.name, roll: data.roll, joinedAt: new Date(), isDisconnected: false }, ...prev];
        });
        toast.success(`${data.name} joined!`, { id: 'join-alert', duration: 2000 });
      }
    };

    const handleParticipantLeft = (data) => {
      console.log('🚪 Live Event: Participant Left', data);
      setParticipants(prev => prev.map(p => 
        p.roll === data.roll ? { ...p, isDisconnected: true } : p
      ));
    };

    const handleParticipantSubmitted = (data) => {
      console.log('✅ Live Event: Participant Submitted', data);
      setParticipants(prev => prev.map(p => 
        p.roll === data.roll ? { ...p, isSubmitted: true, isDisconnected: false } : p
      ));
    };

    const handleLeaderboardUpdate = (data) => {
      console.log('📊 Live Event: Leaderboard Update', data.results?.length);
      setLeaderboard(data.results);
    };

    const handleQuizStarted = () => {
      console.log('🚀 Live Event: Quiz Started');
      setStatus(true);
      fetchStatus(normalizedId, true);
    };

    const handleQuizStopped = () => {
      console.log('🛑 Live Event: Quiz Stopped');
      setStatus(false);
      fetchStatus(normalizedId, true);
    };

    socket.on('participantJoined', handleParticipantJoined);
    socket.on('participantLeft', handleParticipantLeft);
    socket.on('participantSubmitted', handleParticipantSubmitted);
    socket.on('leaderboardUpdateAdmin', handleLeaderboardUpdate);
    socket.on('quizStarted', handleQuizStarted);
    socket.on('quizStopped', handleQuizStopped);

    return () => {
      socket.off('connect', joinRoom);
      socket.off('participantJoined', handleParticipantJoined);
      socket.off('participantLeft', handleParticipantLeft);
      socket.off('participantSubmitted', handleParticipantSubmitted);
      socket.off('leaderboardUpdateAdmin', handleLeaderboardUpdate);
      socket.off('quizStarted', handleQuizStarted);
      socket.off('quizStopped', handleQuizStopped);
    };
  }, [socket, isAuthorized, quizId, fetchStatus]);

  return {
    isAuthorized, loading, tab, setTab, quizId, setQuizId, status, participantCount,
    participants, sessionInfo, duration, setDuration, allowTabSwitching, setAllowTabSwitching,
    questions, quizzes, qForm, setQForm, editingId, setEditingId, leaderboard,
    handleLogin, handleLogout, fetchStatus, handleCreate, handleStart, handleStop,
    fetchQuizzes, handleSaveQuestion, handleDeleteQuestion, handleDeleteQuiz, handleBulkUpload
  };
};
