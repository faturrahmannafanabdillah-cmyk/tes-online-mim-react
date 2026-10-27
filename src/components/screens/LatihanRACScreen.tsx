import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, HelpCircle, Sparkles } from 'lucide-react';

interface LatihanRACScreenProps {
  onFinishLatihan: () => void;
}

const LATIHAN_ITEMS = [
  {
    id: 1,
    label: "Contoh a",
    kolomA: "drab",
    kolomB: "drab",
    kunci: "SAMA",
    penjelasan: "Karakter pada Kolom A persis sama dengan Kolom B.",
  },
  {
    id: 2,
    label: "Contoh b",
    kolomA: "9 5 4 3 7",
    kolomB: "9 4 5 3 7",
    kunci: "BERBEDA",
    penjelasan: "Urutan angka berbeda (Kolom A adalah 5 4, Kolom B adalah 4 5).",
  },
  {
    id: 3,
    label: "Contoh c",
    kolomA: "= + + = + =",
    kolomB: "= + = + =",
    kunci: "BERBEDA",
    penjelasan: "Jumlah dan susunan tanda simbol pada kedua kolom berbeda.",
  },
  {
    id: 4,
    label: "Contoh d",
    kolomA: "PT. SCARR",
    kolomB: "P.T. SCAR",
    kunci: "BERBEDA",
    penjelasan: "Penulisan PT dan jumlah huruf R berbeda (PT. SCARR vs P.T. SCAR).",
  },
];

export const LatihanRACScreen: React.FC<LatihanRACScreenProps> = ({ onFinishLatihan }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  const currentItem = LATIHAN_ITEMS[activeIdx];
  const allAnswered = Object.keys(userAnswers).length === LATIHAN_ITEMS.length;

  const handleAnswer = (choice: 'SAMA' | 'BERBEDA') => {
    const isCorrect = choice === currentItem.kunci;
    setUserAnswers((prev) => ({ ...prev, [currentItem.id]: choice }));
    setFeedback({
      isCorrect,
      text: isCorrect
        ? `Benar! ${currentItem.penjelasan}`
        : `Belum tepat. Jawaban yang benar adalah ${currentItem.kunci} (${currentItem.penjelasan})`,
    });
  };

  const handleNext = () => {
    setFeedback(null);
    if (activeIdx < LATIHAN_ITEMS.length - 1) {
      setActiveIdx((prev) => prev + 1);
    }
  };

  return (
    <div className="max-w-[760px] mx-auto py-6 px-3 sm:px-4 animate-fade-in space-y-5">
      {/* Header */}
      <div className="bg-[#e8f0fb] rounded-2xl p-4 sm:p-5 border border-blue-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-[#0056b3] font-black text-lg sm:text-xl tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Latihan Percobaan Tahap 3 (3 Soal Contoh)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Latihan ini untuk memastikan Anda memahami cara mencocokkan Kolom A dan Kolom B
          </p>
        </div>
        <span className="text-xs font-bold bg-[#0056b3] text-white px-3 py-1 rounded-full shadow-sm">
          Contoh {activeIdx + 1} / {LATIHAN_ITEMS.length}
        </span>
      </div>

      {/* Main Practice Question Box */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.07)] border border-slate-200 text-center space-y-6">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 flex items-center justify-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#0056b3]" />
          <span>Bandingkan kedua kolom berikut, apakah <b>SAMA (V)</b> atau <b>BERBEDA (X)</b>?</span>
        </div>

        {/* Columns comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-5 shadow-inner">
            <span className="text-[11px] font-extrabold uppercase text-slate-400 block mb-2">
              Kolom A
            </span>
            <div className="text-2xl font-black font-mono text-slate-800 break-all select-none">
              {currentItem.kolomA}
            </div>
          </div>

          <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-5 shadow-inner">
            <span className="text-[11px] font-extrabold uppercase text-slate-400 block mb-2">
              Kolom B
            </span>
            <div className="text-2xl font-black font-mono text-slate-800 break-all select-none">
              {currentItem.kolomB}
            </div>
          </div>
        </div>

        {/* Action Choice Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => handleAnswer('SAMA')}
            className={`py-4 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer touch-manipulation min-h-[54px] ${
              userAnswers[currentItem.id] === 'SAMA'
                ? 'bg-[#16a34a] text-white ring-4 ring-emerald-300'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>SAMA (V)</span>
          </button>

          <button
            type="button"
            onClick={() => handleAnswer('BERBEDA')}
            className={`py-4 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer touch-manipulation min-h-[54px] ${
              userAnswers[currentItem.id] === 'BERBEDA'
                ? 'bg-[#dc3545] text-white ring-4 ring-red-300'
                : 'bg-[#dc3545] hover:bg-red-700 text-white'
            }`}
          >
            <XCircle className="w-5 h-5 shrink-0" />
            <span>BERBEDA (X)</span>
          </button>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl border text-xs sm:text-sm font-semibold transition animate-fade-in ${
              feedback.isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Navigation between dummy questions */}
        <div className="pt-2 flex justify-between items-center border-t border-slate-100">
          <div className="flex gap-1.5">
            {LATIHAN_ITEMS.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveIdx(idx);
                  setFeedback(null);
                }}
                className={`w-7 h-7 rounded text-xs font-bold border transition ${
                  idx === activeIdx
                    ? 'border-[#0056b3] bg-blue-50 text-[#0056b3]'
                    : userAnswers[item.id]
                    ? 'bg-[#16a34a] text-white border-[#16a34a]'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {activeIdx < LATIHAN_ITEMS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="py-2.5 px-5 bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 hover:bg-black transition cursor-pointer"
            >
              <span>Contoh Berikutnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onFinishLatihan}
              className="py-3 px-6 bg-[#0056b3] hover:bg-[#003d80] text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition shadow-md cursor-pointer"
            >
              <span>Mulai Ujian Sebenarnya (40 Soal)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
