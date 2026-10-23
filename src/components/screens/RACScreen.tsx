import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, Clock, Zap, ArrowLeft, ArrowRight } from 'lucide-react';
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
  const [timeLeft, setTimeLeft] = useState(120); // 2 Menit = 120 Detik
  const timerRef = useRef<any>(null);

  const answeredCount = Object.keys(answers).length;
  const currentQ = questions[activeIdx] || questions[0];

  // 120s Countdown Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          alert('⏳ WAKTU 2 MENIT HABIS! Seluruh jawaban Tahap 3 Anda akan langsung dikirim.');
          onFinishRAC();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

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

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = timeLeft <= 30;

  return (
    <div className="max-w-[760px] mx-auto py-5 px-3 sm:px-4 animate-fade-in space-y-4">
      {/* Title & Speed Warning */}
      <div className="bg-[#e8f0fb] rounded-xl p-4 text-center border border-blue-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
          <div className="text-left">
            <h2 className="text-[#0056b3] font-extrabold text-base sm:text-lg tracking-tight">
              Tahap 3
            </h2>
            <p className="text-xs text-slate-500">
              40 Soal • Alokasi Waktu: 2 Menit (120 Detik)
            </p>
          </div>
        </div>

        {/* 2-Minute Countdown Display */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-base text-white shadow-md transition-colors ${
            isUrgent ? 'bg-[#dc3545] animate-timer-shake' : 'bg-[#0056b3]'
          }`}
        >
          <Clock className="w-5 h-5 animate-pulse" />
          <span className="font-mono text-xl">{formattedTime}</span>
        </div>
      </div>

      {/* Progress Counter & Question Navigator Grid */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.07)] border border-slate-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-slate-600">
            Progres Jawaban:
          </span>
          <span className="text-xs font-extrabold text-[#0056b3]">
            {answeredCount} / {questions.length} Terjawab ({Math.round((answeredCount / questions.length) * 100)}%)
          </span>
        </div>

        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-[#16a34a] rounded-full transition-all duration-200"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>

        {/* Quick Grid Navigator (40 mini buttons) */}
        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
          {questions.map((q, idx) => {
            const hasAnswer = !!answers[q.id];
            const isCurrent = idx === activeIdx;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`w-7 h-7 rounded text-[11px] font-bold border transition ${
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

      {/* Question Card (Focus view) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.08)] border border-slate-200 text-center">
        <div className="flex justify-between items-center mb-6">
          <span className="bg-[#e8f0fb] text-[#0056b3] font-black text-sm px-4 py-1.5 rounded-full">
            Soal {currentQ.nomor} dari 40
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={activeIdx === 0}
              onClick={() => setActiveIdx((prev) => Math.max(0, prev - 1))}
              className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-30 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button
              type="button"
              disabled={activeIdx === questions.length - 1}
              onClick={() => setActiveIdx((prev) => Math.min(questions.length - 1, prev + 1))}
              className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-30 hover:bg-slate-50"
            >
              <ArrowRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Comparison Columns (Kolom A vs Kolom B) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-5 sm:p-6 shadow-inner flex flex-col justify-center min-h-[110px]">
            <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider block mb-2 text-center">
              Kolom A
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-800 break-all select-none flex items-center justify-center">
              {currentQ.tipeVisual === 'simbol' && currentQ.simbolAId ? (
                <RACSymbolRenderer simbolId={currentQ.simbolAId} />
              ) : (
                currentQ.kolomA
              )}
            </div>
          </div>

          <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-5 sm:p-6 shadow-inner flex flex-col justify-center min-h-[110px]">
            <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider block mb-2 text-center">
              Kolom B
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-800 break-all select-none flex items-center justify-center">
              {currentQ.tipeVisual === 'simbol' && currentQ.simbolBId ? (
                <RACSymbolRenderer simbolId={currentQ.simbolBId} />
              ) : (
                currentQ.kolomB
              )}
            </div>
          </div>
        </div>

        {/* Large Ergonomic Action Buttons */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-lg mx-auto">
          <button
            type="button"
            onClick={() => handleAnswer('SAMA')}
            className={`py-5 sm:py-6 px-4 rounded-2xl font-black text-lg sm:text-xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
              answers[currentQ.id] === 'SAMA'
                ? 'bg-[#16a34a] text-white ring-4 ring-emerald-300 shadow-emerald-700/30'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              <span>SAMA (V)</span>
            </div>
            <span className="text-[11px] font-normal opacity-80">(Tekan S atau ←)</span>
          </button>

          <button
            type="button"
            onClick={() => handleAnswer('TIDAK SAMA')}
            className={`py-5 sm:py-6 px-4 rounded-2xl font-black text-lg sm:text-xl flex flex-col items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
              answers[currentQ.id] === 'TIDAK SAMA'
                ? 'bg-[#dc3545] text-white ring-4 ring-red-300 shadow-red-700/30'
                : 'bg-[#dc3545] hover:bg-red-700 text-white shadow-red-600/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-6 h-6" />
              <span>BERBEDA (X)</span>
            </div>
            <span className="text-[11px] font-normal opacity-80">(Tekan T atau →)</span>
          </button>
        </div>
      </div>

      {/* Final Submit Button */}
      <div className="pt-2 pb-10">
        <button
          type="button"
          onClick={onFinishRAC}
          disabled={isSubmitting}
          className="w-full py-4 px-6 bg-[#0056b3] hover:bg-[#003d80] text-white rounded-xl font-bold text-base sm:text-lg transition shadow-lg shadow-[#0056b3]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:bg-slate-300"
        >
          {isSubmitting ? (
            'Mengirimkan Seluruh Hasil Ujian...'
          ) : (
            <span>Selesai Ujian & Kirim Jawaban Akhir ✓</span>
          )}
        </button>
      </div>
    </div>
  );
};
