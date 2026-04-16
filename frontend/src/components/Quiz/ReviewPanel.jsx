import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Trophy, ArrowRight, Loader2, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logo from '../../assets/logo.png';

const renderQuestionContent = (text) => {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('```')) {
      const inner = part.slice(3, -3);
      const newlineIdx = inner.indexOf('\n');
      const lang = newlineIdx > 0 ? inner.slice(0, newlineIdx).trim() : '';
      const code = newlineIdx > 0 ? inner.slice(newlineIdx + 1) : inner;
      return (
        <div key={idx} className="my-2 rounded-lg overflow-hidden border border-white/5 bg-black/40">
          {lang && (
            <div className="px-3 py-1 bg-white/5 border-b border-white/5 text-[7px] uppercase tracking-wider text-white/30 font-mono">
              {lang}
            </div>
          )}
          <pre className="p-3 overflow-x-auto text-[11px] leading-relaxed m-0 custom-scrollbar">
            <code className="font-mono text-emerald-400/80 whitespace-pre">{code}</code>
          </pre>
        </div>
      );
    }
    return part ? <span key={idx} className="whitespace-pre-wrap">{part}</span> : null;
  });
};

const ReviewPanel = ({ questions, answers, result, student, onFinish }) => {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const pdfRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDownloadPDF = async () => {
    if (isGeneratingPDF) return;
    setIsGeneratingPDF(true);
    
    try {
      const template = document.getElementById('custom-pdf-template');
      template.style.display = 'block';
      template.style.visibility = 'visible';
      template.style.opacity = '1';
      await new Promise(r => setTimeout(r, 500));

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let currentY = margin;

      const addBlockToPDF = async (selector) => {
        const el = document.getElementById(selector);
        if (!el) return;
        
        const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#FFFFFF' });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pdfWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if block fits on current page
        if (currentY + imgHeight > pdfHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 5; // Add a small gap between blocks
      };

      // 1. Add Header, Candidate Info, Stats
      await addBlockToPDF('pdf-header');
      await addBlockToPDF('pdf-candidate');
      await addBlockToPDF('pdf-stats');

      // 2. Add Questions Individually with page-break logic
      for (let i = 0; i < questions.length; i++) {
        await addBlockToPDF(`pdf-q-${i}`);
      }

      pdf.save(`Innovixus_Report_${result.name || 'Student'}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setIsGeneratingPDF(false);
      const template = document.getElementById('custom-pdf-template');
      if (template) {
        template.style.display = 'none';
        template.style.visibility = 'hidden';
      }
    }
  };

  if (!result) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="animate-spin text-white/20" size={32} />
      <p className="text-white/40 text-sm uppercase tracking-widest">Generative Analysis...</p>
    </div>
  );

  const { score, correctAnswers, timeTaken } = result;

  const [sortBy, setSortBy] = useState('default'); 

  const sortedQuestions = useMemo(() => {
    const list = [...questions];
    if (sortBy === 'default') return list;
    
    return list.sort((a, b) => {
      const qIdA = String(a._id);
      const qIdB = String(b._id);
      
      const getStatusRank = (id) => {
        const uA = answers[id];
        const cA = result.correctAnswersMap?.[id] || result.correctAnswers?.[id];
        if (!uA) return 3; 
        return (String(uA).trim() === String(cA).trim()) ? 1 : 2; 
      };

      const rankA = getStatusRank(qIdA);
      const rankB = getStatusRank(qIdB);
      
      const targetRank = sortBy === 'correct' ? 1 : sortBy === 'incorrect' ? 2 : 3;
      
      if (rankA === targetRank && rankB !== targetRank) return -1;
      if (rankA !== targetRank && rankB === targetRank) return 1;
      return rankA - rankB;
    });
  }, [questions, answers, result, sortBy]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-24"
    >
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <button
          onClick={onFinish}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all border border-white/5 font-normal"
        >
          <Trophy size={14} /> Back to Leaderboard
        </button>

        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all border border-blue-500/20 font-normal disabled:opacity-50"
        >
          {isGeneratingPDF ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          {isGeneratingPDF ? 'Generating...' : 'Download Report'}
        </button>
      </div>

      <div ref={pdfRef} className="space-y-8">
        {/* Performance Metric Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/5 p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="text-left">
              <h2 className="text-[10px] uppercase tracking-[0.4em] text-white mb-2 font-normal">Session Outcome</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-normal text-white">{result.correctAnswers}</span>
                <span className="text-sm text-white font-normal">/ {result.total} Solutions</span>
              </div>
              <p className="text-blue-400 text-[9px] uppercase tracking-[0.2em] font-normal mt-1">Score: {score.toLocaleString()} PTS</p>
            </div>

            <div className="h-px md:h-12 w-full md:w-px bg-white/5" />

            <div className="grid grid-cols-3 gap-6 flex-1 w-full max-w-sm">
              <div className="text-center">
                <p className="text-2xl font-normal text-blue-400">{result.correctAnswers}</p>
                <p className="text-[8px] uppercase tracking-widest text-white">Correct</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-normal text-red-500">{result.wrongAnswers}</p>
                <p className="text-[8px] uppercase tracking-widest text-white">Wrong</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-normal text-yellow-500">
                  {result.total - (result.correctAnswers + result.wrongAnswers)}
                </p>
                <p className="text-[8px] uppercase tracking-widest text-white">Skipped</p>
              </div>
            </div>

            <div className="h-px md:h-12 w-full md:w-px bg-white/5" />

            <div className="text-right hidden md:block">
              <p className="text-3xl font-light text-white font-mono">
                {result.total > 0 ? Math.round((result.correctAnswers / result.total) * 100) : 0}%
              </p>
              <p className="text-[8px] uppercase tracking-widest text-white mt-1">Total Accuracy</p>
            </div>
          </div>
        </div>

        {/* Matrix View */}
        <div className="bg-[#0F0F0F] rounded-2xl p-4">
          <h3 className="text-[9px] uppercase tracking-[0.4em] text-white mb-4 text-center">Review Matrix</h3>
          <div className="flex flex-wrap justify-center gap-1.5 max-w-xl mx-auto">
            {questions.map((q, idx) => {
              const qId = String(q._id);
              const uAns = answers[qId];
              const cAns = result.correctAnswersMap?.[qId] || result.correctAnswers?.[qId];
              const isCor = uAns && uAns === cAns;
              
              let colorClass = "bg-white/5 text-white/20";
              if (isCor) colorClass = "bg-blue-500/10 text-blue-400";
              else if (!uAns) colorClass = "bg-yellow-500/10 text-yellow-500";
              else colorClass = "bg-red-500/10 text-red-400";

              return (
                <button
                  key={qId}
                  onClick={() => document.getElementById(`q-${qId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-normal transition-all hover:scale-110 active:scale-95 ${colorClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* List View */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 mb-4">
            <h3 className="text-[10px] uppercase tracking-[0.5em] text-white font-normal">Assessment Transcript</h3>
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar">
              {['default', 'correct', 'incorrect', 'skipped'].map(pill => (
                <button
                  key={pill}
                  onClick={() => setSortBy(pill)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-[9px] uppercase tracking-widest font-normal transition-all ${
                    sortBy === pill ? 'bg-white text-black' : 'text-white/30 hover:text-white/60'
                  }`}
                >
                  {pill.charAt(0).toUpperCase() + pill.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {sortedQuestions.map((q, idx) => {
            const qId = String(q._id);
            const originalIndex = questions.findIndex(origQ => String(origQ._id) === qId);
            const userAnswer = answers[qId];
            const correctAnswer = result.correctAnswersMap?.[qId] || result.correctAnswers?.[qId];
            const isCorrect = userAnswer && userAnswer === correctAnswer;

            return (
              <motion.div 
                id={`q-${qId}`}
                key={qId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-5 rounded-xl border transition-all bg-[#0F0F0F] ${
                  isCorrect ? 'border-blue-500/10' : !userAnswer ? 'border-yellow-500/10' : 'border-red-500/10'
                }`}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[9px] text-white/40 uppercase tracking-widest font-normal">
                        Question {originalIndex + 1}
                      </span>
                      {isCorrect ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[7px] uppercase font-normal">Correct</span>
                      ) : !userAnswer ? (
                        <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[7px] uppercase font-normal">Skipped</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[7px] uppercase font-normal">Incorrect</span>
                      )}
                    </div>
                    <div className="text-white text-base font-normal leading-relaxed opacity-90">
                      {renderQuestionContent(q.question)}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 md:w-80 shrink-0">
                    {q.options.map((opt, i) => {
                      const isThisCorrect = correctAnswer && String(opt).trim() === String(correctAnswer).trim();
                      const isThisUserChoice = userAnswer && String(opt).trim() === String(userAnswer).trim();
                      let styleClass = "border-white/5 text-white/30";
                      if (isThisCorrect) styleClass = "border-blue-500/40 bg-blue-500/5 text-blue-400 font-normal";
                      else if (isThisUserChoice) styleClass = "border-red-500/40 bg-red-500/5 text-red-400";
                      return (
                        <div key={i} className={`px-3 py-2 rounded-lg border text-[12px] ${styleClass}`}>
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="flex flex-col items-center gap-4 pt-8">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-[10px] uppercase tracking-widest text-white/40 mb-4">Back to Top ↑</button>
        <button onClick={onFinish} className="px-10 py-5 bg-white text-black rounded-full font-normal uppercase tracking-[0.2em] text-[11px] hover:scale-105 transition-all">View Leaderboard</button>
      </motion.div>

      {/* ── Custom PDF Template (Innovixus Club Branding) ── */}
      <div 
        id="custom-pdf-template" 
        className="absolute top-0 left-[-9999px] w-[850px] bg-white text-slate-800 p-16 z-[-100] visibility-hidden font-sans"
        style={{ display: 'none' }}
      >
        <div id="pdf-header" className="flex justify-between items-center border-b-[1px] border-blue-200 pb-8 mb-10">
           <div className="flex items-center gap-4">
              <div className="w-16 h-16 flex items-center justify-center rounded-full overflow-hidden">
                <img src={logo} alt="Innovixus Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                 <h1 className="text-2xl font-normal uppercase tracking-widest text-blue-900">Innovixus Club</h1>
                 <p className="text-[10px] uppercase font-normal text-blue-400 mt-1">Technical Assessment Report</p>
              </div>
           </div>
           <div className="text-right text-[10px] font-normal text-black uppercase tracking-widest">
              <p>Date: {new Date().toLocaleDateString('en-GB')}</p>
              <p>Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
           </div>
        </div>

        <div id="pdf-candidate" className="mb-12 grid grid-cols-2 gap-8 border-[1px] border-blue-50 p-6 rounded-lg bg-blue-50/20">
           <div>
              <p className="text-xs font-semibold uppercase font-normal text-blue mb-1">Candidate Name</p>
              <p className="text-lg font-normal text-blue-900">{result.name}</p>
           </div>
           <div>
              <p className="text-xs font-semibold uppercase font-normal text-blue mb-1">Session ID</p>
              <p className="text-lg font-normal text-blue-900 uppercase tracking-tighter font-mono">{student?.quizId || 'N/A'}</p>
           </div>
        </div>

        <div id="pdf-stats" className="grid grid-cols-4 gap-4 mb-14">
           {[
             { label: 'Total Score', value: result.score.toLocaleString(), unit: 'pts' },
             { label: 'Correct Output', value: result.correctAnswers, unit: 'items' },
             { label: 'Accuracy Index', value: `${result.total > 0 ? Math.round((result.correctAnswers / result.total) * 100) : 0}%`, unit: 'percentage' },
             { label: 'Duration Taken', value: `${Math.round(result.timeTaken / 60)}m`, unit: 'minutes' }
           ].map((m, i) => (
             <div key={i} className="bg-white border-[1px] border-black p-4 rounded-md">
                <p className="text-lg font-normal text-blue-600 leading-none">{m.value}</p>
                <p className="text-xs uppercase font-normal text-black mt-2">{m.label}</p>
             </div>
           ))}
        </div>

        <div className="space-y-10">
           <h2 className="text-lg font-normal uppercase tracking-[0.3em] text-black mb-6 pb-2 border-b-[1px] border-blue-50">Detailed Assessment Transcript</h2>
           {questions.map((q, idx) => {
              const uAns = answers[q._id];
              const cAns = result.correctAnswersMap?.[q._id] || result.correctAnswers?.[q._id];
              const isCor = uAns && String(uAns).trim() === String(cAns).trim();
              return (
                 <div key={idx} id={`pdf-q-${idx}`} className="pb-8 break-inside-avoid shadow-sm rounded-lg overflow-hidden">
                    <div className="bg-blue-50/50 p-5 border-l-2 border-blue-600 mb-4 rounded-r-md">
                       <p className="text-[9px] font-normal text-blue-400 mb-2 uppercase tracking-widest">Question {idx + 1}</p>
                       <p className="text-sm font-normal text-blue-900">{q.question}</p>
                    </div>
                    <div className="ml-6 space-y-1.5 border-l border-slate-100 pl-4">
                       {q.options.map((opt, i) => {
                          const isCorrectOpt = String(opt).trim() === String(cAns).trim();
                          const isUserOpt = String(opt).trim() === String(uAns).trim();
                          return (
                             <div key={i} className={`text-[10px] p-2 rounded flex justify-between ${isCorrectOpt ? 'bg-blue-50 text-blue-700' : isUserOpt ? 'bg-red-50 text-slate-400' : 'text-slate-400'}`}>
                                <span>{String.fromCharCode(65+i)}. {opt}</span>
                                {isCorrectOpt && <span className="text-[7px] uppercase text-blue-600">Correct Key</span>}
                                {isUserOpt && !isCor && <span className="text-[7px] uppercase text-red-500">Your Selection</span>}
                             </div>
                          );
                       })}
                    </div>
                 </div>
              );
           })}
        </div>

        <div className="mt-20 pt-10 border-t-[1px] border-blue-50 text-center">
           <p className="text-[8px] uppercase font-normal text-slate-300 tracking-[0.3em]">Innovixus Club Neural Assessment System</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ReviewPanel;
