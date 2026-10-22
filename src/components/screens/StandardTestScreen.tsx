import React, { useRef } from 'react';
import { CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import { QuestionItem } from '../../types';

interface StandardTestScreenProps {
  stageNumber: number;
  stageTitle: string;
  questions: QuestionItem[];
  answers: Record<string, string>;
  onSelectAnswer: (questionId: string, answer: string) => void;
  onFinishStage: () => void;
  unansweredList: number[];
  isSubmitting?: boolean;
}

export const StandardTestScreen: React.FC<StandardTestScreenProps> = ({
  stageNumber,
  stageTitle,
  questions,
  answers,
  onSelectAnswer,
  onFinishStage,
  unansweredList,
  isSubmitting,
}) => {
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const answeredCount = questions.filter(
    (q) => answers[q.id] && answers[q.id] !== '-'
  ).length;
  const progressPercent = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  const scrollToQuestion = (questionId: string) => {
    const el = questionRefs.current[questionId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-[820px] mx-auto py-5 px-3 sm:px-4 animate-fade-in space-y-4">
      {/* Stage Title Card */}
      <div className="bg-[#e8f0fb] rounded-xl p-4 text-center border border-blue-100 shadow-sm">
        <h2 className="text-[#0056b3] font-extrabold text-base sm:text-lg tracking-tight">
          {stageTitle}
        </h2>
      </div>

      {/* Progress & Navigator Sticky Bar */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.07)] border border-slate-200 sticky top-[68px] z-20">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm font-bold text-slate-600">
            Progres Pengerjaan
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-[#0056b3]">
            {answeredCount} / {questions.length} terjawab ({progressPercent}%)
          </span>
        </div>

        {/* Progress Track */}
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-[#0056b3] to-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Navigator Grid */}
        <div>
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500 mb-2">
            Navigasi Nomor Soal:
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-24 overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] && answers[q.id] !== '-';
              const isFlagged = unansweredList.includes(idx + 1);

              let btnClasses = 'border-slate-300 bg-white text-slate-600 hover:border-[#0056b3]';
              if (isAnswered) {
                btnClasses = 'bg-[#16a34a] border-[#16a34a] text-white shadow-sm';
              } else if (isFlagged) {
                btnClasses = 'bg-[#fee2e2] border-[#dc3545] text-[#dc3545] font-black animate-pulse';
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => scrollToQuestion(q.id)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-xs font-bold border flex items-center justify-center transition-all ${btnClasses}`}
                  title={`Lompat ke Soal ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Unanswered questions warning alert */}
      {unansweredList.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs sm:text-sm text-[#dc3545] flex items-center gap-2.5 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>
            Masih ada <b>{unansweredList.length} soal</b> yang belum diisi (Nomor:{' '}
            {unansweredList.join(', ')}). Silakan lengkapi sebelum melanjutkan.
          </span>
        </div>
      )}

      {/* Question Cards */}
      <div className="space-y-4 pt-1">
        {questions.map((q, idx) => {
          const selectedAnswer = answers[q.id];

          return (
            <div
              key={q.id}
              ref={(el) => (questionRefs.current[q.id] = el)}
              className="bg-white rounded-xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.07)] border border-slate-200 scroll-mt-48 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="bg-[#e8f0fb] text-[#0056b3] font-black text-xs sm:text-sm px-3 py-1 rounded-full whitespace-nowrap shrink-0 mt-0.5">
                  Soal {idx + 1}
                </span>
                <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
                  {q.soal}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {q.opsi.map((opt, optIdx) => {
                  const isSelected = selectedAnswer === opt;

                  return (
                    <label
                      key={optIdx}
                      className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl border-[1.5px] cursor-pointer transition-all select-none ${
                        isSelected
                          ? 'bg-[#e8f0fb] border-[#0056b3] shadow-sm ring-1 ring-[#0056b3]'
                          : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={isSelected}
                        onChange={() => onSelectAnswer(q.id, opt)}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-[#0056b3] focus:ring-[#0056b3] accent-[#0056b3] cursor-pointer shrink-0"
                      />
                      <span className="text-sm sm:text-base text-slate-700 leading-normal">
                        {opt}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Completion Button */}
      <div className="pt-4 pb-12">
        <button
          type="button"
          onClick={onFinishStage}
          disabled={isSubmitting}
          className="w-full py-4 px-6 bg-[#0056b3] hover:bg-[#003d80] text-white rounded-xl font-bold text-base sm:text-lg transition-all shadow-lg shadow-[#0056b3]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:bg-slate-300"
        >
          {isSubmitting ? (
            'Memproses Jawaban...'
          ) : stageNumber === 1 ? (
            <>
              <span>Selesai Tahap 1 & Lanjut ke Tahap 2: Tes Army Alpha</span>
              <ChevronRight className="w-5 h-5" />
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Selesai & Kirim Jawaban Ujian ✓</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
