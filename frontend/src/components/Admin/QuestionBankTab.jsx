import React from 'react';
import { Pencil, Trash2, CheckCircle2, BookOpen, FileJson, Upload, LayoutPanelLeft } from 'lucide-react';

const QuestionBankTab = ({
  questions, qForm, setQForm, handleSaveQuestion, 
  editingId, setEditingId, handleDeleteQuestion, 
  handleBulkUpload, loading
}) => {

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        handleBulkUpload(json);
      } catch (err) {
        alert('Invalid JSON file format. See hint for reference.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-up">
      {/* Left Column: Form & Bulk Import */}
      <div className="lg:col-span-4 space-y-8">
        <form onSubmit={handleSaveQuestion} className="card p-8 sticky top-10 ">
          <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest">{editingId ? 'Update' : 'Create'} Question</h3>
          <div className="space-y-4">
            <div>
              <label className="label uppercase tracking-widest text-[10px] text-slate-500 font-bold mb-1.5">Question Content</label>
              <textarea 
                value={qForm.question} 
                onChange={e => setQForm({ ...qForm, question: e.target.value })} 
                className="input-field h-28 resize-none bg-white/5 border-white/10 text-white rounded-xl focus:border-[#4fb3ff]" 
                placeholder="What is the output of..." 
                required 
              />
            </div>
            {qForm.options.map((opt, i) => (
              <div key={i}>
                <label className="label uppercase tracking-widest text-[10px] text-slate-500 font-bold mb-1.5 flex justify-between">
                   Option {String.fromCharCode(65 + i)}
                   {qForm.answer && opt && qForm.answer === opt && <span className="text-emerald-400">Correct</span>}
                </label>
                <input 
                  type="text" 
                  value={opt} 
                  onChange={e => {
                    const opts = [...qForm.options];
                    opts[i] = e.target.value;
                    setQForm({ ...qForm, options: opts });
                  }} 
                  className={`input-field bg-white/5 border-white/10 text-white rounded-xl focus:border-[#4fb3ff] transition-all ${qForm.answer && opt && qForm.answer === opt ? 'border-emerald-500/30' : ''}`} 
                  placeholder={`Option ${i + 1}`}
                  required 
                />
              </div>
            ))}
            <div>
              <label className="label uppercase tracking-widest text-[10px] text-slate-500 font-bold mb-1.5">Set Key Answer</label>
              <select 
                value={qForm.answer} 
                onChange={e => setQForm({ ...qForm, answer: e.target.value })} 
                className="input-field bg-white/5 border-white/10 text-white rounded-xl focus:border-[#4fb3ff] appearance-none" 
                required
              >
                <option value="" className="bg-[#0f0f0f]">Select Target Option</option>
                {qForm.options.filter(o => o.trim()).map((o, i) => (
                  <option key={i} value={o} className="bg-[#0f0f0f]">{o}</option>
                ))}
              </select>
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full py-4 uppercase tracking-[0.2em] font-black flex items-center justify-center gap-2 bg-[#4FB3FF] text-[#0f0f0f] rounded-xl  active:scale-95 transition-all mt-4"
            >
              <CheckCircle2 size={18} />
              {editingId ? 'Refactor' : 'Save'} Question
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); setQForm({ question: '', options: ['', '', '', ''], answer: '' }) }} 
                className="w-full py-2 text-[10px] opacity-40 uppercase font-black tracking-[0.3em] hover:opacity-100 transition-opacity"
              >
                Discard Edits
              </button>
            )}
          </div>
        </form>

        {!editingId && (
          <div className="card p-8 bg-[#4fb3ff]/5 border-[#4fb3ff]/10">
            <div className="flex items-center gap-4 mb-5 pb-4 border-b border-white/5">
              <div className="bg-[#4fb3ff]/20 p-2.5 rounded-xl text-[#4fb3ff]">
                <FileJson size={24} />
              </div>
              <div>
                <h4 className="text-white font-black text-sm uppercase tracking-widest">Bulk Import</h4>
                <p className="text-[10px] text-slate-500 font-bold">Fast-track CSV/JSON setup</p>
              </div>
            </div>
            <div className="relative group overflow-hidden">
               <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-white/10 rounded-2xl hover:border-[#4fb3ff]/50 hover:bg-[#4fb3ff]/10 transition-all cursor-pointer">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                     <Upload className="w-10 h-10 mb-3 text-slate-600 group-hover:text-[#4fb3ff] transition-all group-hover:-translate-y-1" />
                     <p className="text-xs font-black text-slate-500 group-hover:text-white uppercase tracking-widest">Inject JSON Pool</p>
                     <p className="text-[9px] text-slate-600 mt-2 uppercase font-black opacity-50 tracking-tighter">Click to browse system</p>
                  </div>
                  <input type="file" accept=".json" className="hidden" onChange={handleFileSelect} />
               </label>
            </div>
            <div className="mt-6">
              <pre className="text-[9px] bg-black/60 p-4 rounded-xl text-[#4fb3ff]/60 font-mono border border-white/5 overflow-x-auto select-none">
                {`[`} <br/>
                {`  {`} <br/>
                {`    "question": "Sample?",`} <br/>
                {`    "options": ["A", "B", "C", "D"],`} <br/>
                {`    "answer": "A"`} <br/>
                {`  }`} <br/>
                {`]`}
              </pre>
            </div>
          </div>
        )}
      </div>
      
      {/* Right Column: Question List View */}
      <div className="lg:col-span-8">
        <div className="card min-h-[600px] border-white/5 shadow-2xl">
           <div className="p-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0f0f0f]/90 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                 <LayoutPanelLeft className="text-[#4fb3ff]" size={24} />
                 <h3 className="text-2xl font-black text-white tracking-widest uppercase">Question Vault</h3>
              </div>
              <div className="bg-[#4fb3ff]/10 px-4 py-1.5 rounded-xl border border-[#4fb3ff]/20 text-[10px] font-black text-[#4fb3ff] uppercase tracking-[0.2em]">
                {questions.length} ACTIVE ITEMS
              </div>
           </div>
           <div className="divide-y divide-white/5 max-h-[850px] overflow-y-auto custom-scrollbar">
              {questions.length > 0 ? (
                questions.map((q, idx) => (
                  <div key={q._id} className="p-8 hover:bg-white/[0.04] transition-all group">
                    <div className="flex justify-between items-start gap-8">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                           <span className="w-8 h-[2px] bg-[#4fb3ff]/30" />
                           <span className="text-[10px] font-black text-[#4fb3ff] uppercase tracking-[0.3em]">
                             QUERY_INDEX_{idx + 1}
                           </span>
                        </div>
                        <h4 className="text-white font-bold text-lg leading-relaxed mb-6 group-hover:text-[#4fb3ff] transition-colors">{q.question}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {q.options.map((opt, i) => (
                             <div key={i} className={`px-5 py-3 rounded-xl text-[11px] font-bold border transition-all ${opt === q.answer ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                                {String.fromCharCode(65 + i)} <span className="opacity-30 mx-2">|</span> {opt}
                             </div>
                           ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button 
                          onClick={() => {
                            setEditingId(q._id)
                            setQForm({ question: q.question, options: q.options, answer: q.answer })
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }} 
                          className="p-3 bg-[#4fb3ff]/10 text-[#4fb3ff] rounded-xl border border-[#4fb3ff]/30 hover:bg-[#4fb3ff] hover:text-white hover:scale-110 active:scale-90 transition-all shadow-xl"
                          title="Edit Blueprint"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteQuestion(q._id)} 
                          className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/30 hover:bg-red-500 hover:text-white hover:scale-110 active:scale-90 transition-all shadow-xl"
                          title="Purge Item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-40 text-center">
                   <BookOpen size={80} className="mb-6 text-slate-800 animate-pulse" />
                   <h4 className="text-white/30 font-black uppercase tracking-[0.5em] text-xl">The Vault is Offline</h4>
                   <p className="text-slate-700 text-xs mt-4 font-bold tracking-widest max-w-[250px] mx-auto uppercase">Awaiting manual entry or bulk JSON injection to initialize database</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionBankTab;
