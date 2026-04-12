import { useState } from 'react';
import { useQuiz } from '../context/QuizContext';
import { joinQuiz } from '../api/quizApi';
import toast from 'react-hot-toast';
import Beams from '../components/beams';

// Modular UI Components
import RegistrationHeader from '../components/Registration/RegistrationHeader';
import RegistrationForm from '../components/Registration/RegistrationForm';

export default function RegistrationPage() {
  const { goToWaiting, goToQuiz } = useQuiz();

  const [form, setForm] = useState({ name: '', quizId: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'quizId') {
      // Remove all non-alphanumeric characters
      let raw = value.replace(/[^A-Za-z0-9]/g, '');
      // Format as XXX-XXX (only insert hyphen if longer than 3 characters)
      if (raw.length > 3) {
        value = `${raw.slice(0, 3)}-${raw.slice(3, 6)}`;
      } else {
        value = raw;
      }
    }
    
    setForm(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handles the secure student join request.
   * Logic: Join → Determine State (Waiting | Active | Expired) → Navigate
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (!form.quizId.trim()) return toast.error('Session Code is required');
    if (!form.name.trim()) return toast.error('Full Name is required');

    setLoading(true);

    // Logic for Multi-User Testing/Reconnection support:
    // 1. Check if we already have a student identity saved
    const savedStudent = JSON.parse(localStorage.getItem('quiz_student') || 'null');
    const savedId = localStorage.getItem('clubquiz_session_id');
    
    let finalStudentId;
    
    // If they are joining with the same name and quizId as before, reuse the ID (Reconnection)
    if (savedStudent && savedStudent.name === form.name.trim() && savedStudent.quizId === form.quizId.replace(/[^A-Za-z0-9]/g, '').toUpperCase()) {
      finalStudentId = savedStudent.studentId;
    } else {
      // If name is different or no saved student, generate a FRESH ID (New Student/Tester)
      finalStudentId = 'STU_' + Math.random().toString(36).substr(2, 9).toUpperCase();
      localStorage.setItem('clubquiz_session_id', finalStudentId);
    }

    const studentData = {
      name: form.name.trim(),
      studentId: finalStudentId,
      quizId: form.quizId.replace(/[^A-Za-z0-9]/g, '').toUpperCase(),
    };

    try {
      const data = await joinQuiz(studentData);

      // Scenario 1: Reconnecting/Late Joiner - Quiz is already running
      if (data.quizState === 'active') {
        const remainingMs = (data.startTime + data.duration * 60 * 1000) - Date.now();

        if (remainingMs <= 0) {
          toast.error('Quiz time has already ended. Redirecting...');
          goToWaiting(studentData);
          setTimeout(() => { window.location.href = '/leaderboard' }, 500);
          return;
        }

        toast.success('Quiz is live! Entering session...');
        goToQuiz(studentData, {
          questions: data.questions,
          startTime: data.startTime,
          duration: data.duration,
          allowTabSwitching: data.allowTabSwitching,
        }, data.savedAnswers || {});

      } 
      // Scenario 2: Admin stopped or time's up
      else if (data.quizState === 'expired') {
        toast.error('This quiz session is no longer active.');
        goToWaiting(studentData);
        setTimeout(() => { window.location.href = '/leaderboard' }, 500);
      } 
      // Scenario 3: Lobby - Waiting for Admin to start
      else {
        toast.success('Joined successfully! Waiting for host to start...');
        goToWaiting(studentData);
      }

    } catch (err) {
      toast.error(err.message || 'Failed to authenticate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 bg-[#0F0F0F] overflow-hidden">
      {/* Premium Background Layer */}
      <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
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

      {/* Main Container */}
      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg scale-[0.9] sm:scale-100">
        <RegistrationHeader />
        
        <RegistrationForm 
          form={form} 
          onChange={handleChange} 
          onSubmit={handleSubmit} 
          loading={loading} 
        />

        {/* Simplified Footer attribution */}
        <p className="mt-8 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
          Innovixus Secure Portal
        </p>
      </main>
    </div>
  );
}
