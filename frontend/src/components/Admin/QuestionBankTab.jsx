import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, CheckCircle2, BookOpen, FileJson, Upload, LayoutPanelLeft, Plus, X, Code2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const QuestionModal = ({
  isOpen, onClose, qForm, setQForm, handleSaveQuestion, editingId, loading
}) => {
  const [isJsonMode, setIsJsonMode] = useState(false);
  const [tempJson, setTempJson] = useState('');

  // Sync tempJson when entering JSON mode
  useEffect(() => {
    if (isJsonMode) {
      setTempJson(JSON.stringify(qForm, null, 2));
    }
  }, [isJsonMode, qForm]);

  const toggleMode = () => {
    if (isJsonMode) {
      try {
        const parsed = JSON.parse(tempJson);
        setQForm(parsed);
        setIsJsonMode(false);
      } catch (e) {
        alert('Invalid JSON format. Please fix it before switching back.');
      }
    } else {
      setIsJsonMode(true);
    }
  };

  const handleModalSave = async (e) => {
    e.preventDefault();
    if (isJsonMode) {
      try {
        const parsed = JSON.parse(tempJson);
        setQForm(parsed);
        // We need to wait for state update or pass directly. 
        // Given React batching, we'll use a trick or just trust the next tick if handleSaveQuestion is async.
        // Actually, let's just use the parsed object if we can, but handleSaveQuestion uses state.
        // Better: Sync state and then trigger save in next tick.
        setTimeout(() => {
          handleSaveQuestion(e);
          onClose();
        }, 10);
      } catch (err) {
        alert('Invalid JSON format');
      }
    } else {
      handleSaveQuestion(e);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0  "
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-4">
              <div className="bg-white/5 p-3 rounded-full text-white border border-white/10">
                {editingId ? <Pencil size={18} strokeWidth={1.5} /> : <Plus size={18} strokeWidth={1.5} />}
              </div>
              <div>
                <h3 className="text-xl font-medium text-white uppercase tracking-wider leading-none">
                  {editingId ? 'Edit Blueprint' : 'New Question'}
                </h3>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] mt-2 font-light">Question Configuration Matrix</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleMode}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg border transition-all text-[9px] uppercase tracking-[0.2em] ${isJsonMode ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 text-white hover:text-white'}`}
              >
                {isJsonMode ? 'Text Mode' : 'Source Mode'}
              </button>
              <button onClick={onClose} className="p-1.5 text-white/20 hover:text-white transition-all">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div className="p-10 overflow-y-auto custom-scrollbar flex-1 space-y-10">
            {isJsonMode ? (
              <div className="space-y-4 h-full flex flex-col">
                <label className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-light">JSON Interface</label>
                <textarea
                  value={tempJson}
                  onChange={(e) => setTempJson(e.target.value)}
                  className="w-full flex-1 min-h-[400px] bg-white/[0.02] border border-white/5 rounded-xl p-8 font-mono text-[11px] text-white/80 focus:border-white/20 outline-none resize-none leading-relaxed"
                  spellCheck={false}
                  autoFocus
                />
              </div>
            ) : (
              <div className="space-y-12">
                <div>
                  <label className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-light mb-4 block">Question Schematic</label>
                  <textarea
                    value={qForm.question}
                    onChange={e => setQForm({ ...qForm, question: e.target.value })}
                    className="w-full h-32 bg-transparent border-b border-white/10 text-white focus:border-white py-2 text-base leading-relaxed outline-none transition-all placeholder:text-white/10"
                    placeholder="Enter the challenge text..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {qForm.options.map((opt, i) => (
                    <div key={i} className="space-y-3">
                      <label className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-light flex justify-between">
                        Vector {String.fromCharCode(65 + i)}
                        {qForm.answer === opt && opt !== '' && <span className="text-white">Active Key</span>}
                      </label>
                      <input
                        type="text"
                        value={opt}
                        onChange={e => {
                          const opts = [...qForm.options];
                          opts[i] = e.target.value;
                          setQForm({ ...qForm, options: opts });
                        }}
                        className={`w-full bg-transparent border-b transition-all py-2 text-sm outline-none ${qForm.answer === opt && opt !== '' ? 'border-white text-white' : 'border-white/10 text-white/60 focus:border-white'}`}
                        placeholder={`Option ${i + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-light mb-6 block">Designate Success Key</label>
                  <div className="flex flex-wrap gap-3">
                    {qForm.options.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        disabled={!opt || !opt.trim()}
                        onClick={() => setQForm({ ...qForm, answer: opt })}
                        className={`flex-1 py-3 px-4 rounded-lg border text-[10px] transition-all uppercase tracking-[0.2em] font-bold ${qForm.answer === opt && opt !== '' ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 text-white hover:border-white/30'}`}
                      >
                        {String.fromCharCode(65 + i)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-8 border-t border-white/5 bg-white/[0.01]">
            <button
              onClick={handleModalSave}
              disabled={loading}
              className="w-full py-5 text-[11px] uppercase tracking-[0.3em] font-medium border border-white/20 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 rounded-lg"
            >
              {loading ? 'Processing...' : (
                <>
                  <Save size={14} strokeWidth={1.5} />
                  {editingId ? 'Push Updates' : 'Inject Molecule'}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const QuestionBankTab = ({
  questions, qForm, setQForm, handleSaveQuestion,
  editingId, setEditingId, handleDeleteQuestion,
  handleBulkUpload, loading
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const openAddModal = () => {
    setEditingId(null);
    setQForm({ question: '', options: ['', '', '', ''], answer: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (q) => {
    setEditingId(q._id);
    setQForm({ question: q.question, options: q.options, answer: q.answer });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Header Utilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="bg-white/5 p-4 rounded-full text-white border border-white/10">
              <LayoutPanelLeft size={24} strokeWidth={1} />
            </div>
            <div>
              <h3 className="text-xl font-medium text-white uppercase tracking-wider">Vault Core</h3>
              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-2 font-light">{questions.length} Units Online</p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="px-6 py-3 border border-white/20 text-white rounded-lg text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-white hover:text-black transition-all"
          >
            Create Unit
          </button>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="bg-white/5 p-4 rounded-full text-white border border-white/10">
              <FileJson size={24} strokeWidth={1} />
            </div>
            <div>
              <h3 className="text-xl font-medium text-white uppercase tracking-wider">Mass Injection</h3>
              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mt-2 font-light">Transmission Protocol</p>
            </div>
          </div>
          <label className="px-6 py-3 bg-white/5 border border-white/10 text-white/60 rounded-lg text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-white/[0.08] hover:text-white cursor-pointer transition-all">
            Upload Base
            <input type="file" accept=".json" className="hidden" onChange={handleFileSelect} />
          </label>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden min-h-[600px]">
        <div className="divide-y divide-white/5 max-h-[850px] overflow-y-auto custom-scrollbar">
          {questions.length > 0 ? (
            questions.map((q, idx) => (
              <div key={q._id} className="p-10 hover:bg-white/[0.02] transition-all group relative">
                <div className="flex justify-between items-start gap-12">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-medium text-white/20 uppercase tracking-[0.3em]">
                        Sequence {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                    </div>
                    <h4 className="text-white font-medium text-xl leading-relaxed mb-8 group-hover:text-white transition-colors">{q.question}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {q.options.map((opt, i) => (
                        <div key={i} className={`px-5 py-3 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-3 ${opt === q.answer ? 'bg-white text-black border-white' : 'bg-transparent border-white/5 text-white/20'}`}>
                          <span className="opacity-30">{String.fromCharCode(65 + i)}</span>
                          <span className="truncate">{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 self-center">
                    <button
                      onClick={() => openEditModal(q)}
                      className="p-3 text-white/20 hover:text-white hover:bg-white/5 rounded-full transition-all"
                      title="Adjust Schematic"
                    >
                      <Pencil size={18} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q._id)}
                      className="p-3 text-white/10 hover:text-red-400 hover:bg-red-400/5 rounded-full transition-all"
                      title="Decommission"
                    >
                      <Trash2 size={18} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-40 text-center">
              <div className="bg-white/[0.02] p-10 rounded-full mb-8">
                <BookOpen size={48} strokeWidth={1} className="text-white/10" />
              </div>
              <h4 className="text-white/20 font-medium uppercase tracking-[0.4em] text-lg">Repository Void</h4>
              <p className="text-white/10 text-[10px] mt-6 font-light tracking-[0.2em] max-w-[300px] mx-auto uppercase leading-relaxed">System awaiting data injection</p>
            </div>
          )}
        </div>
      </div>

      {/* Modular Question Modal */}
      <QuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        qForm={qForm}
        setQForm={setQForm}
        handleSaveQuestion={handleSaveQuestion}
        editingId={editingId}
        loading={loading}
      />
    </div>
  );
};

export default QuestionBankTab;
