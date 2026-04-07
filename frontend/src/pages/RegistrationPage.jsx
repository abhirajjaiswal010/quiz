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

  const [form, setForm] = useState({ name: '', roll: '', quizId: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handles the secure student join request.
   * Logic: Join → Determine State (Waiting | Active | Expired) → Navigate
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (!form.quizId.trim()) return toast.error('Quiz ID is required');
    if (!form.name.trim()) return toast.error('Full Name is required');
    if (!form.roll.trim()) return toast.error('Roll Number is required');

    setLoading(true);

    const studentData = {
      name: form.name.trim(),
      roll: form.roll.trim().toUpperCase(),
      quizId: form.quizId.trim().toUpperCase(),
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
