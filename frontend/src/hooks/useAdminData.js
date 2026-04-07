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
  const [duration, setDuration] = useState(15);
  const [allowTabSwitching, setAllowTabSwitching] = useState(false);

  // Questions & Archive state
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [qForm, setQForm] = useState({ question: '', options: ['', '', '', ''], answer: 0 });
  const [editingId, setEditingId] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  // ── Session Methods ────────────────────────────────────────────────────────
  const fetchStatus = useCallback(async (manualId = null, silent = false) => {
    const idToUse = manualId || quizId;
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

  useEffect(() => {
    if (!socket || !isAuthorized || !quizId || status === null) return;
    const normalizedId = quizId.toUpperCase();
    socket.emit('adminJoin', normalizedId);

    const handleParticipantJoined = (data) => {
      setParticipantCount(data.participantCount);
      if (data.name && data.roll) {
        setParticipants(prev => {
          if (prev.some(p => p.roll === data.roll)) return prev;
          return [{ name: data.name, roll: data.roll, joinedAt: new Date() }, ...prev];
        });
        toast.success(`${data.name} joined!`, { id: 'join-alert' });
      }
    };

    const handleResultSubmitted = (data) => {
      setLeaderboard(data.results);
      setParticipantCount(data.participantCount);
    };

    socket.on('participantJoined', handleParticipantJoined);
    socket.on('resultSubmitted', handleResultSubmitted);

    return () => {
      socket.off('participantJoined', handleParticipantJoined);
      socket.off('resultSubmitted', handleResultSubmitted);
    };
  }, [socket, isAuthorized, quizId, status]);

  return {
    isAuthorized, loading, tab, setTab, quizId, setQuizId, status, participantCount,
    participants, sessionInfo, duration, setDuration, allowTabSwitching, setAllowTabSwitching,
    questions, quizzes, qForm, setQForm, editingId, setEditingId, leaderboard,
    handleLogin, handleLogout, fetchStatus, handleCreate, handleStart, handleStop,
    fetchQuizzes, handleSaveQuestion, handleDeleteQuestion, handleDeleteQuiz, handleBulkUpload
  };
};
