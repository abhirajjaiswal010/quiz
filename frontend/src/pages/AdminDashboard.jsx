import React from 'react';

// Modular Layout Components
import AdminHeader from '../components/Admin/AdminHeader';
import AdminNav from '../components/Admin/AdminNav';

// Admin Tab Modules
// Admin Tab Modules (Lazy-loaded for efficiency)
const QuestionBankTab = React.lazy(() => import('../components/Admin/QuestionBankTab'));
const LeaderboardTab = React.lazy(() => import('../components/Admin/LeaderboardTab'));
const SessionHistoryTab = React.lazy(() => import('../components/Admin/SessionHistoryTab'));
import SessionControlTab from '../components/Admin/SessionControlTab';

/**
 * High-performance Admin Dashboard orchestrator.
 * Handles the state transitions between different management modules.
 */
export default function AdminDashboard({
  tab, setTab, quizId, setQuizId, fetchStatus, handleCreate, handleStart, handleStop,
  duration, setDuration, allowTabSwitching, setAllowTabSwitching,
  loading, status, participantCount, participants, sessionInfo, leaderboard, handleLogout,
  questions, quizzes, fetchQuizzes, qForm, setQForm, handleSaveQuestion, editingId, setEditingId, handleDeleteQuestion,
  handleDeleteQuiz, handleBulkUpload, socketConnected
}) {

  return (
    <div className="admin-root min-h-screen bg-[#0f0f0f] relative overflow-hidden text-white/90">
      {/* Premium Dashboard Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 animate-fade-in">

        {/* Top Header & Identity */}
        <AdminHeader handleLogout={handleLogout} fetchStatus={fetchStatus} quizId={quizId} />

        {/* Dynamic Navigation Bar */}
        <AdminNav tab={tab} setTab={setTab} fetchQuizzes={fetchQuizzes} />

        {/* Tab Orchestration Engine */}
        <main className="mt-4 pb-20">
          <React.Suspense fallback={<div className="py-20 text-center opacity-30 animate-pulse text-xs tracking-[0.3em] uppercase">Decoding Module...</div>}>
            {/* Tab: Session Control & Telemetry */}
            {tab === 'control' && (
              <SessionControlTab
                quizId={quizId} setQuizId={setQuizId} duration={duration} setDuration={setDuration}
                allowTabSwitching={allowTabSwitching} setAllowTabSwitching={setAllowTabSwitching}
                fetchStatus={fetchStatus} handleCreate={handleCreate} handleStart={handleStart} handleStop={handleStop}
                loading={loading} status={status} participantCount={participantCount} participants={participants}
                sessionInfo={sessionInfo} socketConnected={socketConnected}
              />
            )}

            {/* Tab: Global Rankings */}
            {tab === 'leaderboard' && (
              <LeaderboardTab leaderboard={leaderboard} quizId={quizId} />
            )}

            {/* Tab Master Vault */}
            {tab === 'questions' && (
              <QuestionBankTab
                questions={questions} qForm={qForm} setQForm={setQForm}
                handleSaveQuestion={handleSaveQuestion} editingId={editingId}
                setEditingId={setEditingId} handleDeleteQuestion={handleDeleteQuestion}
                handleBulkUpload={handleBulkUpload} loading={loading}
              />
            )}

            {/* Tab: Historical Archive */}
            {tab === 'history' && (
              <SessionHistoryTab
                quizzes={quizzes} fetchQuizzes={fetchQuizzes} setQuizId={setQuizId}
                setTab={setTab} fetchStatus={fetchStatus} handleDeleteQuiz={handleDeleteQuiz}
              />
            )}
          </React.Suspense>
        </main>
      </div>

      {/* Decorative Branding Watermark */}
      <div className="fixed bottom-10 right-10 pointer-events-none opacity-5 flex flex-col items-end">
        <h2 className="text-6xl font-normal uppercase tracking-tighter">Admin Panel</h2>
        <p className="text-[10px] font-light tracking-[0.4em] uppercase mt-2">V.1.0 Protocol Innovixus</p>
      </div>
    </div>
  );
}
