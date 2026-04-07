import { useState } from 'react';
import { useAdminData } from '../hooks/useAdminData';
import AdminDashboard from './AdminDashboard';
import AdminLogin from '../components/Admin/AdminLogin';

/**
 * AdminPanel Orchestrator.
 * Separates Administrative Logic (useAdminData hook) from the Dashboard and Login views.
 * Strictly maintains original UI/UX while improving core maintainability.
 */
export default function AdminPanel() {
  const [showKey, setShowKey] = useState(false);
  
  // Custom hook containing all admin state and methods
  const adminManager = useAdminData();

  // Scenario 1: Authorization required
  if (!adminManager.isAuthorized) {
    return (
      <AdminLogin 
        handleLogin={adminManager.handleLogin} 
        loading={adminManager.loading} 
        showKey={showKey} 
        setShowKey={setShowKey} 
      />
    );
  }

  // Scenario 2: Active Authorized Session
  return (
    <AdminDashboard
      tab={adminManager.tab}
      setTab={adminManager.setTab}
      quizId={adminManager.quizId}
      setQuizId={adminManager.setQuizId}
      fetchStatus={adminManager.fetchStatus}
      handleCreate={adminManager.handleCreate}
      handleStart={adminManager.handleStart}
      handleStop={adminManager.handleStop}
      duration={adminManager.duration}
      setDuration={adminManager.setDuration}
      allowTabSwitching={adminManager.allowTabSwitching}
      setAllowTabSwitching={adminManager.setAllowTabSwitching}
      loading={adminManager.loading}
      status={adminManager.status}
      participantCount={adminManager.participantCount}
      participants={adminManager.participants}
      sessionInfo={adminManager.sessionInfo}
      leaderboard={adminManager.leaderboard}
      handleLogout={adminManager.handleLogout}
      questions={adminManager.questions}
      quizzes={adminManager.quizzes}
      fetchQuizzes={adminManager.fetchQuizzes}
      qForm={adminManager.qForm}
      setQForm={adminManager.setQForm}
      handleSaveQuestion={adminManager.handleSaveQuestion}
      editingId={adminManager.editingId}
      setEditingId={adminManager.setEditingId}
      handleDeleteQuestion={adminManager.handleDeleteQuestion}
      handleDeleteQuiz={adminManager.handleDeleteQuiz}
      handleBulkUpload={adminManager.handleBulkUpload}
    />
  );
}
