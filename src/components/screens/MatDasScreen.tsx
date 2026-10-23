import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, AlertCircle, Calculator, Layers, RefreshCw } from 'lucide-react';
import { QuestionItem } from '../../types';
import { apiService } from '../../services/api';

interface MatDasScreenProps {
  questions?: QuestionItem[];
  answers: Record<string, string>;
  onSelectAnswer: (questionId: string, answer: string) => void;
  onFinishStage: () => void;
  unansweredList: number[];
  isSubmitting?: boolean;
  initialPaketName?: string;
  onQuestionsUpdated?: (questions: QuestionItem[], packageName: string) => void;
}

export const MatDasScreen: React.FC<MatDasScreenProps> = ({
  questions = [],
  answers,
  onSelectAnswer,
  onFinishStage,
  unansweredList,
  isSubmitting,
  initialPaketName,
  onQuestionsUpdated,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeQuestions, setActiveQuestions] = useState<QuestionItem[]>(questions);
  const [availablePacks, setAvailablePacks] = useState<string[]>(['Paket A', 'Paket B', 'Paket C']);
  const [selectedPaket, setSelectedPaket] = useState<string>(initialPaketName || 'Paket A');
  const [isFetchingPaket, setIsFetchingPaket] = useState<boolean>(false);

  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Fetch dynamic questions from GAS on component mount
  useEffect(() => {
    let isMounted = true;

    const loadDynamicQuestions = async () => {
      setIsLoading(true);
      try {
        const res = await apiService.fetchMatDasQuestions(initialPaketName);
        if (isMounted) {
          if (res.questions && res.questions.length > 0) {
            setActiveQuestions(res.questions);
            setSelectedPaket(res.paketTerpilih);
            setAvailablePacks(res.paketList.length > 0 ? res.paketList : ['Paket A', 'Paket B', 'Paket C']);
            onQuestionsUpdated?.(res.questions, res.paketTerpilih);
          } else if (questions.length > 0) {
            setActiveQuestions(questions);
          }
        }
      } catch (err) {
        console.warn('Gagal memuat soal dinamis, menggunakan cache lokal:', err);
        if (isMounted && questions.length > 0) {
          setActiveQuestions(questions);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDynamicQuestions();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter or switch package dynamically
  const handleSwitchPaket = async (targetPaket: string) => {
    if (targetPaket === selectedPaket || isFetchingPaket) return;
    setIsFetchingPaket(true);
    setSelectedPaket(targetPaket);

    try {
      const res = await apiService.fetchMatDasQuestions(targetPaket);
      if (res.questions && res.questions.length > 0) {
        setActiveQuestions(res.questions);
        onQuestionsUpdated?.(res.questions, targetPaket);
      }
    } catch (err) {
      console.warn('Switch paket fallback:', err);
    } finally {
      setIsFetchingPaket(false);
    }
  };

  const displayQuestions: QuestionItem[] = activeQuestions;

  const answeredCount = displayQuestions.filter(
    (q) => answers[q.id] && answers[q.id] !== '-'
  ).length;
  const totalCount = displayQuestions.length || 18;
  const progressPercent = Math.round((answeredCount / totalCount) * 100);

  const scrollToQuestion = (questionId: string) => {
    const el = questionRefs.current[questionId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Helper to format option with A-E label prefix if needed
  const getOptionLetter = (index: number) => {
    const letters = ['A', 'B', 'C', 'D', 'E'];
    return letters[index] || `${index + 1}`;
  };

  // -------------------------------------------------------------
  // SKELETON LOADING STATE
  // -------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="max-w-[820px] mx-auto py-5 px-3 sm:px-4 animate-fade-in space-y-4">
        {/* Skeleton Title Header */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-40 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-6 w-20 bg-blue-100 rounded-full animate-pulse" />
        </div>

        {/* Skeleton Progress Bar */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-200 w-1/3 animate-pulse rounded-full" />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Skeleton Questions Cards (Render 3 placeholder cards) */}
        <div className="space-y-4 pt-1">
          {[1, 2, 3].map((cardIdx) => (
            <div
              key={cardIdx}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="h-6 w-16 bg-blue-100 rounded-full" />
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
              </div>
              <div className="h-3.5 w-1/2 bg-slate-100 rounded ml-1" />

              {/* 5 Radio button skeletons */}
              <div className="space-y-2.5 pt-2">
                {[0, 1, 2, 3, 4].map((optIdx) => (
                  <div
                    key={optIdx}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50"
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-200 shrink-0" />
                    <div className="h-4 w-2/5 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Loading status indicator text */}
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-[#0056b3] text-xs font-bold border border-blue-100">
            <RefreshCw className="w-4 h-4 animate-spin text-[#0056b3]" />
            <span>Menarik soal dinamis dari server backend...</span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN LOADED CONTENT
  // -------------------------------------------------------------
  return (
    <div className="max-w-[820px] mx-auto py-5 px-3 sm:px-4 animate-fade-in space-y-4">
      {/* Title Card with Package Badge & Selector Filter */}
      <div className="bg-[#e8f0fb] rounded-xl p-4 border border-blue-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#0056b3] text-white flex items-center justify-center shadow-sm">
            <Calculator className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h2 className="text-[#0056b3] font-black text-base sm:text-lg tracking-tight">
              Tahap 2
            </h2>
            <p className="text-xs text-slate-500">
              {displayQuestions.length} Butir Soal • Batas Waktu 25 Menit
            </p>
          </div>
        </div>

        {/* State Filter: Active Package Pill / Selection */}
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-blue-200 shadow-sm">
          <Layers className="w-4 h-4 text-[#0056b3]" />
          <span className="text-xs font-bold text-slate-700 mr-1">Versi:</span>
          {availablePacks.map((packName) => {
            const isSelected = selectedPaket === packName;
            return (
              <button
                key={packName}
                type="button"
                onClick={() => handleSwitchPaket(packName)}
                disabled={isFetchingPaket}
                className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0056b3] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {packName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress & Navigator Sticky Bar */}
      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.07)] border border-slate-200 sticky top-[68px] z-20">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm font-bold text-slate-600">
            Progres Jawaban:
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-[#0056b3]">
            {answeredCount} / {displayQuestions.length} terjawab ({progressPercent}%)
          </span>
        </div>

        {/* Progress Track */}
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-[#0056b3] to-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Navigator Grid */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-24 overflow-y-auto pr-1">
          {displayQuestions.map((q, idx) => {
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
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Unanswered questions alert */}
      {unansweredList.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs sm:text-sm text-[#dc3545] flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>
            Masih ada <b>{unansweredList.length} soal</b> yang belum diisi (Nomor:{' '}
            {unansweredList.join(', ')}). Silakan lengkapi sebelum lanjut ke Tahap 3.
          </span>
        </div>
      )}

      {/* Questions list with 5 Single Choice Radio Buttons (A-E) */}
      <div className="space-y-4 pt-1">
        {displayQuestions.map((q, idx) => {
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

              {/* 5 Radio Button Options (A, B, C, D, E) */}
              <div className="space-y-2.5">
                {q.opsi.map((opt, optIdx) => {
                  const letterLabel = getOptionLetter(optIdx);
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
                      <div className="flex items-center gap-2 text-sm sm:text-base text-slate-700 leading-normal">
                        <span className="font-extrabold text-[#0056b3] w-5 shrink-0">
                          {letterLabel}.
                        </span>
                        <span>{opt.replace(/^[A-E]\.\s*/, '')}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion button */}
      <div className="pt-4 pb-12">
        <button
          type="button"
          onClick={onFinishStage}
          disabled={isSubmitting}
          className="w-full py-4 px-6 bg-[#0056b3] hover:bg-[#003d80] text-white rounded-xl font-bold text-base sm:text-lg transition-all shadow-lg shadow-[#0056b3]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:bg-slate-300"
        >
          {isSubmitting ? (
            'Memproses Jawaban...'
          ) : (
            <>
              <span>Selesai Tahap 2 & Lanjut ke Tahap 3</span>
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
