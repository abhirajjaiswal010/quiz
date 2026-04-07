import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercept responses to standardize error format
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong with the server'
    return Promise.reject(new Error(message))
  }
)

/** ─── Generic Admin Headers ─────────────────────────────────────────────────── */
const getAdminHeaders = (key) => ({ headers: { 'x-admin-key': key } })

/** ─── Quiz System APIs (Exact Flow) ───────────────────────────────────────────── */

// 1. Admin creates a quiz
export const createQuiz = (key, quizId, duration, allowTabSwitching) => api.post('/create-quiz', { quizId, duration, allowTabSwitching }, getAdminHeaders(key))

// 2. Admin starts quiz
export const startQuiz = (key, quizId, allowTabSwitching) => api.post('/start-quiz', { quizId, allowTabSwitching }, getAdminHeaders(key))

// 3. Admin stops quiz
export const stopQuiz = (key, quizId) => api.post('/stop-quiz', { quizId }, getAdminHeaders(key))

// Admin Verification
export const verifyAdmin = (key) => api.get('/admin/verify', getAdminHeaders(key))

/** ─── Question Management (Admin) ───────────────────────────────────────────── */
export const getAdminQuestions = (key) => api.get('/admin/questions', getAdminHeaders(key))
export const getAllQuizzes = (key) => api.get('/admin/quizzes', getAdminHeaders(key))
export const deleteQuiz = (key, quizId) => api.delete(`/admin/quizzes/${quizId}`, getAdminHeaders(key))
export const addQuestion = (key, data) => api.post('/admin/questions', data, getAdminHeaders(key))
export const uploadQuestions = (key, questions) => api.post('/admin/questions/upload', { questions }, getAdminHeaders(key))
export const updateQuestion = (key, id, data) => api.put(`/admin/questions/${id}`, data, getAdminHeaders(key))
export const deleteQuestion = (key, id) => api.delete(`/admin/questions/${id}`, getAdminHeaders(key))


/** ─── Student APIs ───────────────────────────────────────────────────────────── */
export const joinQuiz = (data) => api.post('/join-quiz', data)
export const saveProgress = (data) => api.post('/save-progress', data)
export const getQuizStatus = (quizId) => api.get(`/quiz-status?quizId=${quizId}`)
export const getQuestions = (quizId) => api.get(`/questions?quizId=${quizId}`)
export const submitQuiz = (data) => api.post('/submit', data)
export const getLeaderboard = (quizId) => api.get(`/leaderboard?quizId=${quizId}`)

export default api
