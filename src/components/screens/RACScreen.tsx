import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, Zap, ArrowLeft, ArrowRight } from 'lucide-react';
import { RACQuestionItem } from '../../types';
import { DEFAULT_RAC_QUESTIONS } from '../../data/mockData';
import { RACSymbolRenderer } from './RACSymbolRenderer';

interface RACScreenProps {
  questions?: RACQuestionItem[];
  answers: Record<string, 'SAMA' | 'TIDAK SAMA'>;
  onSelectAnswer: (questionId: string, answer: 'SAMA' | 'TIDAK SAMA') => void;
  onFinishRAC: () => void;
  isSubmitting?: boolean;
}

export const RACScreen: React.FC<RACScreenProps> = ({
  questions = DEFAULT_RAC_QUESTIONS,
  answers,
  onSelectAnswer,
  onFinishRAC,
  isSubmitting,
}) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 Menit = 120 Detik (Blind Timer)
  const timerRef = useRef<any>(null);

  const answeredCount = Object.keys(answers).length;
  const currentQ = questions[activeIdx] || questions[0];

  // 120s Blind Background Countdown Timer & Auto-Submit
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          console.log('[RAC] Blind timer 120 detik selesai. Menjalankan auto-submit...');
          onFinishRAC();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [onFinishRAC]);

  // Keyboard shortcut listener (S for SAMA, T for TIDAK SAMA, Left/Right arrow)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === 'S' || e.key === 'ArrowLeft') {
        handleAnswer('SAMA');
      } else if (key === 'T' || e.key === 'ArrowRight') {
        handleAnswer('TIDAK SAMA');
      } else if (e.key === 'ArrowDown' && activeIdx < questions.length - 1) {
        setActiveIdx((prev) => prev + 1);
      } else if (e.key === 'ArrowUp' && activeIdx > 0) {
        setActiveIdx((prev) => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIdx, questions]);

  const handleAnswer = (choice: 'SAMA' | 'TIDAK SAMA') => {
    if (!currentQ) return;
    onSelectAnswer(currentQ.id, choice);

    // Auto advance to next question
    if (activeIdx < questions.length - 1) {
      setActiveIdx((prev) => prev + 1);
    }
  };

  const [showGridModal, setShowGridModal] = useState(false);

  return (
    <div className="max-w-[760px] mx-auto py-3 sm:py-5 px-3 sm:px-4 animate-fade-in space-y-3 sm:space-y-4 safe-bottom-area">
      {/* Title Header (Blind Timer - Waktu hitung mundur berjalan diam-diam di background) */}
      <div className="bg-[#e8f0fb] rounded-xl p-3 sm:p-4 text-center border border-blue-100 shadow-sm flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Zap className="w-5 h-5 text-amber-500 fill-amber-500 shrink-0" />
          <div className="text-left min-w-0">
            <h2 className="text-[#0056b3] font-extrabold text-sm sm:text-lg tracking-tight truncate">
              Tahap 3
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate">
              40 Soal
            </p>
          </div>
        </div>

        <div className="text-xs font-bold bg-[#0056b3] text-white px-3 py-1.5 rounded-full shadow-sm shrink-0">
          Soal {activeIdx + 1} / {questions.length}
        </div>
      </div>

      {/* Progress Counter & Compact Mobile Navigator */}
      <div className="bg-white rounded-xl p-3 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-200">
        <div className="flex justify-between items-center mb-1.5">
          <button
            type="button"
            onClick={() => setShowGridModal(!showGridModal)}
            className="text-xs font-bold text-[#0056b3] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{showGridModal ? '▲ Sembunyikan Grid' : '▼ Daftar 40 Soal'}</span>
          </button>
          <span className="text-xs font-extrabold text-[#0056b3]">
            {answeredCount} / {questions.length} ({Math.round((answeredCount / questions.length) * 100)}%)
          </span>
        </div>

        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-[#16a34a] rounded-full transition-all duration-200"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>

        {/* Collapsible Grid on mobile / Visible when opened */}
        {showGridModal ? (
          <div className="pt-2 border-t border-slate-100 animate-fade-in">
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 max-h-48 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const hasAnswer = !!answers[q.id];
                const isCurrent = idx === activeIdx;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setActiveIdx(idx);
                      setShowGridModal(false);
                    }}
                    className={`h-8 rounded-lg text-xs font-bold border transition ${
                      isCurrent
                        ? 'ring-2 ring-[#0056b3] border-[#0056b3] bg-blue-50 text-[#0056b3]'
                        : hasAnswer
                        ? 'bg-[#16a34a] border-[#16a34a] text-white'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Mobile horizontal mini scroll preview */
          <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {questions.map((q, idx) => {
              const hasAnswer = !!answers[q.id];
              const isCurrent = idx === activeIdx;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`w-7 h-7 shrink-0 rounded text-[11px] font-bold border transition ${
                    isCurrent
                      ? 'ring-2 ring-[#0056b3] border-[#0056b3] bg-blue-50 text-[#0056b3]'
                      : hasAnswer
                      ? 'bg-[#16a34a] border-[#16a34a] text-white'
                      : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Question Card (Focus view optimized for mobile thumb ergonomics) */}
      <div className="bg-white rounded-2xl p-4 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.07)] border border-slate-200 text-center">
        <div className="flex justify-between items-center mb-3 sm:mb-5">
          <span className="bg-[#e8f0fb] text-[#0056b3] font-black text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-full">
            Soal {currentQ.nomor} dari 40
          </span>
          <div className="flex gap-1.5 sm:gap-2">
            <button
              type="button"
              disabled={activeIdx === 0}
              onClick={() => setActiveIdx((prev) => Math.max(0, prev - 1))}
              className="p-1.5 sm:p-2 rounded-lg border border-slate-300 disabled:opacity-30 hover:bg-slate-50"
              title="Soal Sebelumnya"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button
              type="button"
              disabled={activeIdx === questions.length - 1}
              onClick={() => setActiveIdx((prev) => Math.min(questions.length - 1, prev + 1))}
              className="p-1.5 sm:p-2 rounded-lg border border-slate-300 disabled:opacity-30 hover:bg-slate-50"
              title="Soal Selanjutnya"
            >
              <ArrowRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Comparison Columns (Kolom A vs Kolom B) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-slate-50 border-2 border-slate-300 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-inner flex flex-col justify-center min-h-[85px] sm:min-h-[110px]">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1 text-center">
              Kolom A
            </span>
            <div className="text-lg sm:text-2xl font-black font-mono text-slate-800 break-all select-none flex items-center justify-center">
              {currentQ.tipeVisual === 'simbol' && currentQ.simbolAId ? (
                <RACSymbolRenderer simbolId={currentQ.simbolAId} />
              ) : (
                currentQ.kolomA
              )}
            </div>
          </div>

          <div className="bg-slate-50 border-2 border-slate-300 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-inner flex flex-col justify-center min-h-[85px] sm:min-h-[110px]">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1 text-center">
              Kolom B
            </span>
            <div className="text-lg sm:text-2xl font-black font-mono text-slate-800 break-all select-none flex items-center justify-center">
              {currentQ.tipeVisual === 'simbol' && currentQ.simbolBId ? (
                <RACSymbolRenderer simbolId={currentQ.simbolBId} />
              ) : (
                currentQ.kolomB
              )}
            </div>
          </div>
        </div>

        {/* Large Ergonomic Thumb Action Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-lg mx-auto">
          <button
            type="button"
            onClick={() => handleAnswer('SAMA')}
            className={`py-4 sm:py-6 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-xl flex flex-col items-center justify-center gap-1 transition-all shadow-md active:scale-95 cursor-pointer touch-manipulation min-h-[58px] sm:min-h-[72px] ${
              answers[currentQ.id] === 'SAMA'
                ? 'bg-[#16a34a] text-white ring-4 ring-emerald-300 shadow-emerald-700/30'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>SAMA (V)</span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-normal opacity-85 hidden sm:inline">(Tekan S atau ←)</span>
          </button>

          <button
            type="button"
            onClick={() => handleAnswer('TIDAK SAMA')}
            className={`py-4 sm:py-6 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-xl flex flex-col items-center justify-center gap-1 transition-all shadow-md active:scale-95 cursor-pointer touch-manipulation min-h-[58px] sm:min-h-[72px] ${
              answers[currentQ.id] === 'TIDAK SAMA'
                ? 'bg-[#dc3545] text-white ring-4 ring-red-300 shadow-red-700/30'
                : 'bg-[#dc3545] hover:bg-red-700 text-white shadow-red-600/20'
            }`}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>BERBEDA (X)</span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-normal opacity-85 hidden sm:inline">(Tekan T atau →)</span>
          </button>
        </div>
      </div>

      {/* Mobile-first ergonomic footer indicator (Auto-Submit aktif) */}
      <div className="text-center py-2 pb-6 sm:pb-8">
        <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
          Jawaban langsung tersimpan otomatis setiap Anda memilih.
        </p>
      </div>
    </div>
  );
};
