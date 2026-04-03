import { useState } from 'react'
import { useQuiz } from '../context/QuizContext'
import { joinQuiz } from '../api/quizApi'
import { Rocket, ShieldCheck, Timer } from 'lucide-react'
import logo from '../assets/logo.png'
import TargetCursor from '../components/targetCursor'
import Threads from '../components/thread'
import toast from 'react-hot-toast'

export default function RegistrationPage() {
  const { goToWaiting } = useQuiz()

  const [form, setForm] = useState({
    name: '',
    roll: '',
    quizId: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!form.quizId.trim()) return toast.error('Quiz ID is required')
    if (!form.name.trim()) return toast.error('Full Name is required')
    if (!form.roll.trim()) return toast.error('Roll Number is required')

    setLoading(true)

    try {
      await joinQuiz({
        name: form.name.trim(),
        roll: form.roll.trim().toUpperCase(),
        quizId: form.quizId.trim()
      })

      goToWaiting({
        name: form.name.trim(),
        roll: form.roll.trim().toUpperCase(),
        quizId: form.quizId.trim()
      })
      toast.success('Joined successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to join quiz.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-2 animate-fade-in bg-[#0F0F0F] relative overflow-hidden">
      <TargetCursor
        spinDuration={2}
        hideDefaultCursor
        parallaxOn
        hoverDuration={0.2}
      />

      {/* Dynamic Background Threads */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <Threads
          amplitude={1.2}
          distance={0.2}
          enableMouseInteraction
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md">
        <div className="text-center mb-1">
          <div className="inline-flex items-center justify-center mb-1">
            <img src={logo} alt="Innovixus Logo" className="w-20 h-20 object-contain" />
          </div>
          <div className="space-y-0">
            <span className="text-[15px] text-white-200 font-bold tracking-[0.2em] uppercase block mb-10">Platform by Innovixus</span>
            <h1 className="font-display text-4xl  text-[#4FB3FF] tracking-tight font-montserrat">
              Club Quiz
            </h1>
          </div>
          <p className="text-white-100 text-xs mt-1 font-medium tracking-wide">
            AUTHENTICATION & JOINING
          </p>
        </div>

        <div className="border border-white/20 rounded-xl max-w-md p-6 animate-slide-up bg-[#0F0F0F]/10 backdrop-blur shadow-2xl shadow-black/80 w-full mt-4">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-white uppercase tracking-wider">Join quiz</h2>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            <div>
              <label htmlFor="quizId" className="text-xs font-semibold text-white uppercase tracking-wider mb-1 block">Quiz ID</label>
              <input
                id="quizId"
                type="text"
                name="quizId"
                value={form.quizId}
                onChange={handleChange}
                placeholder="Enter unique quizId"
                className="input-field bg-[#0f0f0f]/20 border border-white/20 text-white py-2 text-sm focus:border-[#4FB3FF] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="name" className="text-xs font-semibold text-white uppercase tracking-wider mb-1 block">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Ravi Kumar"
                className="input-field bg-[#0f0f0f]/20 border border-white/20 text-white py-2 text-sm focus:border-[#4FB3FF] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="roll" className="text-xs font-semibold text-white uppercase tracking-wider mb-1 block">Roll Number</label>
              <input
                id="roll"
                type="text"
                name="roll"
                value={form.roll}
                onChange={handleChange}
                placeholder="e.g. 22CS001"
                className="input-field bg-[#0f0f0f]/20 border border-white/20 uppercase text-white py-2 text-sm focus:border-[#4FB3FF] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary cursor-target bg-[#4fb3ff] w-full  py-3 text-xl text-white flex items-center justify-center gap-2"
            >
              {loading ? 'Joining...' : (
                <>
                  <Rocket size={16} />
                  <span>Join Quiz</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center gap-3 text-[10px] text-slate-600">
            <span className="flex text-white items-center gap-1"><ShieldCheck size={12} /> 1 Attempt</span>
            <span>•</span>
            <span className="flex text-white items-center gap-1"><Timer size={12} /> Accuracy + Speed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
