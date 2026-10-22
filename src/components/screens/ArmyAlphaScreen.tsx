import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, CheckCircle, ArrowRight, CornerDownRight, HelpCircle } from 'lucide-react';
import { ArmyAlphaQuestion, AlphaAnswerItem } from '../../types';
import { DEFAULT_ALPHA_QUESTIONS } from '../../data/mockData';

interface ArmyAlphaScreenProps {
  questions?: ArmyAlphaQuestion[];
  onFinishAlpha: (answers: Record<string, AlphaAnswerItem>) => void;
  onSkipAlpha?: () => void;
}

export const ArmyAlphaScreen: React.FC<ArmyAlphaScreenProps> = ({
  questions = DEFAULT_ALPHA_QUESTIONS,
  onFinishAlpha,
  onSkipAlpha,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [boardActive, setBoardActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [alphaAnswers, setAlphaAnswers] = useState<Record<string, AlphaAnswerItem>>({});

  // Dynamic input states for the current question
  const [inputs, setInputs] = useState<string[]>([]);
  const [strikethroughList, setStrikethroughList] = useState<(number | string)[]>([]);
  const [underlineList, setUnderlineList] = useState<(number | string)[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [irisanInputs, setIrisanInputs] = useState<Record<string, string>>({});

  const timerIntervalRef = useRef<any>(null);
  const currentQuestion = questions[currentIndex];

  // Initialize state when switching question
  useEffect(() => {
    if (!currentQuestion) return;

    clearInterval(timerIntervalRef.current);
    setBoardActive(false);
    setIsPlayingAudio(false);
    setTimerSeconds(null);

    const existing = alphaAnswers[currentQuestion.id] || {
      nomor: currentQuestion.nomor,
      tipe: currentQuestion.tipe,
      inputan: [],
      dicoret: [],
      garisBawah: [],
      jalurTerpilih: '',
      irisan: {},
    };

    setInputs(existing.inputan || []);
    setStrikethroughList(existing.dicoret || []);
    setUnderlineList(existing.garisBawah || []);
    setSelectedRoute(existing.jalurTerpilih || '');
    setIrisanInputs(existing.irisan || {});
  }, [currentIndex, currentQuestion]);

  // Voice Instruction using Web Speech API (Indonesian) or Simulation
  const speakInstruction = (text: string, onEnd: () => void) => {
    const fullSpeechText = `${text} ... Mulai!`;

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(fullSpeechText);
        utterance.lang = 'id-ID';
        utterance.rate = 0.95; // Clear natural pacing
        utterance.pitch = 1.0;

        utterance.onend = () => onEnd();
        utterance.onerror = () => onEnd();
        window.speechSynthesis.speak(utterance);
        return;
      } catch (e) {
        // Fallback simulation
      }
    }

    // Fallback simulation (approx 3.5 seconds)
    setTimeout(() => onEnd(), 3500);
  };

  const handleStartInstruction = () => {
    if (isPlayingAudio || boardActive) return;
    setIsPlayingAudio(true);

    const onAudioEnded = () => {
      setIsPlayingAudio(false);
      setBoardActive(true);

      const duration = currentQuestion.waktu;
      setTimerSeconds(duration);

      let sisa = duration;
      timerIntervalRef.current = setInterval(() => {
        sisa -= 1;
        setTimerSeconds(sisa);

        if (sisa <= 0) {
          clearInterval(timerIntervalRef.current);
          handleTimeExpired();
        }
      }, 1000);
    };

    speakInstruction(currentQuestion.instruksi, onAudioEnded);
  };

  const saveCurrentQuestionAnswers = () => {
    const itemAnswer: AlphaAnswerItem = {
      nomor: currentQuestion.nomor,
      tipe: currentQuestion.tipe,
      inputan: inputs,
      dicoret: strikethroughList,
      garisBawah: underlineList,
      jalurTerpilih: selectedRoute,
      irisan: irisanInputs,
    };

    const updated = {
      ...alphaAnswers,
      [currentQuestion.id]: itemAnswer,
    };
    setAlphaAnswers(updated);
    return updated;
  };

  const handleTimeExpired = () => {
    setBoardActive(false);
    const updated = saveCurrentQuestionAnswers();

    // Play "Stop" notice
    if ('speechSynthesis' in window) {
      try {
        const stopUtterance = new SpeechSynthesisUtterance('Stop!');
        stopUtterance.lang = 'id-ID';
        window.speechSynthesis.speak(stopUtterance);
      } catch (e) {}
    }

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onFinishAlpha(updated);
      }
    }, 1200);
  };

  const handleNextManual = () => {
    clearInterval(timerIntervalRef.current);
    setBoardActive(false);
    const updated = saveCurrentQuestionAnswers();

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onFinishAlpha(updated);
    }
  };

  const handleInputArray = (idx: number, val: string, maxLen = 1) => {
    const next = [...inputs];
    while (next.length <= idx) next.push('');
    next[idx] = val.toUpperCase().slice(-maxLen);
    setInputs(next);
  };

  const toggleStrike = (item: number | string) => {
    if (!boardActive) return;
    setStrikethroughList((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleUnderline = (item: number | string) => {
    if (!boardActive) return;
    setUnderlineList((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  if (!currentQuestion) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <CheckCircle className="w-16 h-16 text-[#16a34a] mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-slate-800">Tes Army Alpha Selesai!</h3>
        <p className="text-slate-500 text-sm mt-2">Seluruh jawaban Anda pada 12 nomor telah terekam.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto py-5 px-3 sm:px-4 animate-fade-in space-y-4">
      {/* Header Info Banner */}
      <div className="bg-[#e8f0fb] rounded-xl p-4 text-center border border-blue-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          <span className="font-extrabold text-base sm:text-lg text-[#0056b3] tracking-tight">
            TES ARMY ALPHA (12 NOMOR)
          </span>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Dengarkan instruksi dengan seksama sebelum waktu berjalan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold bg-[#0056b3] text-white px-3 py-1.5 rounded-full shadow-sm">
            Nomor {currentQuestion.nomor} / {questions.length}
          </span>
        </div>
      </div>

      {/* Main Question Board */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.07)] border border-slate-200 text-center relative overflow-hidden">
        {/* Timing badge */}
        <div className="flex justify-center mb-3">
          <span className="bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs px-3 py-1 rounded-full">
            Alokasi Pengerjaan: <b>{currentQuestion.waktu} Detik</b>
          </span>
        </div>

        {/* Audio / Voice Start Button */}
        {!boardActive && timerSeconds === null && (
          <div className="my-5 max-w-md mx-auto space-y-3">
            <button
              type="button"
              onClick={handleStartInstruction}
              disabled={isPlayingAudio}
              className={`w-full py-4 px-6 rounded-2xl font-extrabold text-base sm:text-lg transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer ${
                isPlayingAudio
                  ? 'bg-amber-500 text-white cursor-wait animate-pulse'
                  : 'bg-[#0056b3] hover:bg-[#003d80] text-white active:scale-95 shadow-[#0056b3]/20'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Volume2 className="w-6 h-6 animate-bounce" />
                  <span>🔊 Mendengarkan Instruksi Suara...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>▶️ Putar Instruksi Nomor {currentQuestion.nomor}</span>
                </>
              )}
            </button>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tekan tombol di atas untuk mendengarkan arahan penguji. Setelah aba-aba <b>"Mulai!"</b>, lembar soal akan terbuka dan waktu otomatis berjalan.
            </p>
          </div>
        )}

        {/* Countdown Timer */}
        {timerSeconds !== null && (
          <div className="text-2xl sm:text-3xl font-black text-[#dc3545] my-3 animate-pulse">
            {timerSeconds > 0 ? `⏳ Sisa Waktu: ${timerSeconds} Detik` : '⏰ WAKTU HABIS! STOP!'}
          </div>
        )}

        {/* Instruction Guidance Text Box */}
        {boardActive && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-700 font-medium mb-5 text-left leading-relaxed shadow-sm">
            <span className="font-bold text-[#0056b3] flex items-center gap-1.5 mb-1">
              <HelpCircle className="w-4 h-4" /> Instruksi Soal Nomor {currentQuestion.nomor}:
            </span>
            {currentQuestion.instruksi}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* INTERACTIVE WORK AREA (Locked until audio ends) */}
        {/* ------------------------------------------------------------- */}
        <div
          className={`py-4 px-2 transition-all duration-300 min-h-[160px] flex flex-col justify-center items-center ${
            boardActive
              ? 'opacity-100 pointer-events-auto filter-none'
              : 'opacity-35 pointer-events-none filter blur-[1px]'
          }`}
        >
          {/* ========================================================= */}
          {/* NOMOR 1: 5 LINGKARAN */}
          {/* ========================================================= */}
          {currentQuestion.tipe === 'SOAL_1_LINGKARAN' && (
            <div className="space-y-4">
              <div className="flex justify-center items-center gap-3 sm:gap-4 flex-wrap">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <input
                      type="text"
                      maxLength={1}
                      disabled={!boardActive}
                      value={inputs[i] || ''}
                      onChange={(e) => handleInputArray(i, e.target.value)}
                      placeholder=""
                      className="alpha-input shape-circle text-center font-bold text-2xl shadow-sm focus:border-[#0056b3]"
                    />
                    <span className="text-[11px] font-bold text-slate-400">Ke-{i + 1}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 italic">
                *Ketik simbol/huruf langsung di dalam lingkaran.
              </p>
            </div>
          )}

          {/* ========================================================= */}
          {/* NOMOR 2: 9 LINGKARAN BERNOMOR & TARIK GARIS DARI 3 KE 6 */}
          {/* ========================================================= */}
          {currentQuestion.tipe === 'SOAL_2_JALUR_NOMOR' && (
            <div className="space-y-5 w-full max-w-2xl">
              {/* Visual 9 Lingkaran Bernomor */}
              <div className="relative py-8 px-2 overflow-x-auto">
                <div className="flex justify-between items-center gap-2 min-w-[500px] relative z-10">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <div
                      key={num}
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center font-black text-base sm:text-lg transition-all ${
                        num === 3 || num === 6
                          ? 'border-[#0056b3] bg-blue-50 text-[#0056b3] ring-2 ring-blue-300'
                          : 'border-slate-800 bg-white text-slate-800'
                      }`}
                    >
                      {num}
                    </div>
                  ))}
                </div>

                {/* SVG Curve Route Display */}
                {selectedRoute && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                    {selectedRoute === 'bawah4_atas5' && (
                      <path
                        d="M 145,55 C 180,95 210,95 250,55 C 290,15 320,15 355,55"
                        fill="none"
                        stroke="#0056b3"
                        strokeWidth="4"
                        strokeDasharray="6,4"
                        className="animate-pulse"
                      />
                    )}
                    {selectedRoute === 'atas4_bawah5' && (
                      <path
                        d="M 145,55 C 180,15 210,15 250,55 C 290,95 320,95 355,55"
                        fill="none"
                        stroke="#dc3545"
                        strokeWidth="3"
                      />
                    )}
                  </svg>
                )}
              </div>

              {/* Route options selection */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 text-left">
                <div className="text-xs font-bold text-slate-700 mb-2">
                  Pilih Alur Penarikan Garis dari Lingkaran 3 ke 6:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                  <label
                    className={`p-3 rounded-lg border-2 cursor-pointer transition flex items-center gap-2.5 ${
                      selectedRoute === 'bawah4_atas5'
                        ? 'border-[#0056b3] bg-blue-50 font-bold text-[#0056b3]'
                        : 'border-slate-200 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rute_alp_2"
                      value="bawah4_atas5"
                      checked={selectedRoute === 'bawah4_atas5'}
                      onChange={() => setSelectedRoute('bawah4_atas5')}
                      className="accent-[#0056b3]"
                    />
                    <span>Garis lewat di <b>BAWAH</b> lingkaran 4 dan di <b>ATAS</b> lingkaran 5</span>
                  </label>

                  <label
                    className={`p-3 rounded-lg border-2 cursor-pointer transition flex items-center gap-2.5 ${
                      selectedRoute === 'atas4_bawah5'
                        ? 'border-[#0056b3] bg-blue-50 font-bold text-[#0056b3]'
                        : 'border-slate-200 hover:bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rute_alp_2"
                      value="atas4_bawah5"
                      checked={selectedRoute === 'atas4_bawah5'}
                      onChange={() => setSelectedRoute('atas4_bawah5')}
                      className="accent-[#0056b3]"
                    />
                    <span>Garis lewat di <b>ATAS</b> lingkaran 4 dan di <b>BAWAH</b> lingkaran 5</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* NOMOR 3: 3 LINGKARAN + KATA "YA" DAN "TIDAK" */}
          {/* ========================================================= */}
          {currentQuestion.tipe === 'SOAL_3_KOMA_CORET' && (
            <div className="space-y-4">
              <div className="flex justify-center items-center gap-4 sm:gap-6 flex-wrap">
                <div className="flex gap-2.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <input
                        type="text"
                        maxLength={1}
                        disabled={!boardActive}
                        value={inputs[i] || ''}
                        onChange={(e) => handleInputArray(i, e.target.value)}
                        placeholder={i === 0 ? ',' : ''}
                        className="alpha-input shape-circle text-center font-bold text-2xl"
                      />
                      <span className="text-[10px] text-slate-400 font-bold">Lingkaran {i + 1}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 border-l-2 border-slate-200 pl-4 sm:pl-6">
                  {['Ya', 'Tidak'].map((kata) => {
                    const isCoret = strikethroughList.includes(kata);
                    return (
                      <button
                        key={kata}
                        type="button"
                        onClick={() => toggleStrike(kata)}
                        disabled={!boardActive}
                        className={`text-lg sm:text-xl font-bold px-4 py-2.5 rounded-xl border-2 transition-all ${
                          isCoret
                            ? 'border-red-500 bg-red-50 text-red-600 line-through'
                            : 'border-slate-300 bg-slate-50 hover:bg-white text-slate-800'
                        }`}
                      >
                        {kata}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Ketik koma (,) di dalam lingkaran dan klik kata untuk mencoret.
              </p>
            </div>
          )}

          {/* ========================================================= */}
          {/* NOMOR 4: 5 LINGKARAN (PERTANYAAN 1 MINGGU) */}
          {/* ========================================================= */}
          {currentQuestion.tipe === 'SOAL_4_HARI_MINGGU' && (
            <div className="space-y-4">
              <div className="flex justify-center items-center gap-3 sm:gap-4 flex-wrap">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <input
                      type="text"
                      maxLength={1}
                      disabled={!boardActive}
                      value={inputs[i] || ''}
                      onChange={(e) => handleInputArray(i, e.target.value)}
                      className={`alpha-input shape-circle text-center font-bold text-2xl ${
                        i === 3 ? 'border-dashed' : ''
                      }`}
                    />
                    <span className="text-[11px] font-bold text-slate-400">
                      Ke-{i + 1} {i === 3 ? '(Kosongkan)' : ''}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 italic">
                *Ketik angka jawaban pada lingkaran ke-3 dan ke-5 sesuai instruksi suara.
              </p>
            </div>
          )}

          {/* ========================================================= */}
          {/* NOMOR 5: IRISAN SEGITIGA DAN LINGKARAN */}
          {/* ========================================================= */}
          {currentQuestion.tipe === 'SOAL_5_SEGITIGA_LINGKARAN' && (
            <div className="space-y-4 max-w-lg mx-auto">
              {/* SVG Graphic corresponding to Page 4 & 5 */}
              <div className="relative w-64 h-48 mx-auto border border-slate-200 rounded-2xl bg-white p-2 shadow-inner">
                <svg viewBox="0 0 200 150" className="w-full h-full">
                  {/* Lingkaran */}
                  <circle cx="90" cy="75" r="50" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" />
                  {/* Segitiga */}
                  <polygon points="120,20 185,130 55,130" fill="none" stroke="#1e293b" strokeWidth="3" />
                </svg>

                {/* Input markers overlaying the geometrical areas */}
                <div className="absolute top-10 left-10">
                  <input
                    type="text"
                    maxLength={1}
                    value={irisanInputs['lingkaran_luar'] || ''}
                    onChange={(e) =>
                      setIrisanInputs({ ...irisanInputs, lingkaran_luar: e.target.value.toUpperCase() })
                    }
                    placeholder="?"
                    className="w-10 h-10 border-2 border-slate-800 rounded-full text-center font-black text-lg bg-white/90"
                    title="Dalam Lingkaran, Luar Segitiga"
                  />
                </div>

                <div className="absolute top-16 left-28">
                  <input
                    type="text"
                    maxLength={1}
                    value={irisanInputs['irisan'] || ''}
                    onChange={(e) =>
                      setIrisanInputs({ ...irisanInputs, irisan: e.target.value.toUpperCase() })
                    }
                    placeholder="?"
                    className="w-10 h-10 border-2 border-[#0056b3] rounded-full text-center font-black text-lg bg-blue-50/90 text-[#0056b3]"
                    title="Dalam Lingkaran DAN Dalam Segitiga"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-left bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Dalam Lingkaran (Luar Segitiga):
                  </label>
                  <input
                    type="text"
                    maxLength={1}
                    value={irisanInputs['lingkaran_luar'] || ''}
                    onChange={(e) =>
                      setIrisanInputs({ ...irisanInputs, lingkaran_luar: e.target.value.toUpperCase() })
                    }
                    placeholder="Isi simbol (X)"
                    className="w-full p-2 border rounded-lg text-center font-bold text-base bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Dalam Lingkaran & Segitiga:
                  </label>
                  <input
                    type="text"
                    maxLength={1}
                    value={irisanInputs['irisan'] || ''}
                    onChange={(e) =>
                      setIrisanInputs({ ...irisanInputs, irisan: e.target.value.toUpperCase() })
                    }
                    placeholder="Isi huruf (A)"
                    className="w-full p-2 border rounded-lg text-center font-bold text-base bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* NOMOR 6: LINGKARAN, BUJUR SANGKAR, DAN SEGITIGA */}
          {/* ========================================================= */}
          {currentQuestion.tipe === 'SOAL_6_LINGKARAN_KOTAK_SEGITIGA' && (
            <div className="space-y-4 max-w-lg mx-auto">
              <div className="relative w-64 h-48 mx-auto border border-slate-200 rounded-2xl bg-white p-2 shadow-inner">
                <svg viewBox="0 0 200 150" className="w-full h-full">
                  <circle cx="80" cy="75" r="45" fill="none" stroke="#1e293b" strokeWidth="2.5" />
                  <rect x="75" y="45" width="65" height="65" fill="none" stroke="#1e293b" strokeWidth="2.5" />
                  <polygon points="120,25 185,135 55,135" fill="none" stroke="#1e293b" strokeWidth="2.5" />
                </svg>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-left bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Dalam Segitiga, Luar Bujur Sangkar:
                  </label>
                  <input
                    type="text"
                    maxLength={1}
                    value={irisanInputs['segitiga_non_kotak'] || ''}
                    onChange={(e) =>
                      setIrisanInputs({ ...irisanInputs, segitiga_non_kotak: e.target.value.toUpperCase() })
                    }
                    placeholder="Isi huruf (X)"
                    className="w-full p-2 border rounded-lg text-center font-bold text-base bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Dalam Bujur Sangkar & Segitiga, Luar Lingkaran:
                  </label>
                  <input
                    type="text"
                    maxLength={1}
                    value={irisanInputs['kotak_segitiga_non_lingkaran'] || ''}
                    onChange={(e) =>
                      setIrisanInputs({
                        ...irisanInputs,
                        kotak_segitiga_non_lingkaran: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="Isi huruf (Y)"
                    className="w-full p-2 border rounded-lg text-center font-bold text-base bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* NOMOR 7: HURUF A s/d P (GARIS BAWAH DAN CORET MELINTANG) */}
          {/* ========================================================= */}
          {currentQuestion.tipe === 'SOAL_7_HURUF_GARIS_CORET' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
                  'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'
                ].map((huruf) => {
                  const isUnderlined = underlineList.includes(huruf);
                  const isStriked = strikethroughList.includes(huruf);

                  return (
                    <div
                      key={huruf}
                      className="flex flex-col items-center bg-slate-50 p-2 rounded-xl border border-slate-200 min-w-[48px]"
                    >
                      <span
                        className={`text-xl sm:text-2xl font-black font-mono transition-all py-1 ${
                          isUnderlined ? 'underline underline-offset-4 decoration-blue-600 decoration-4 text-blue-700' : ''
                        } ${
                          isStriked ? 'line-through decoration-red-600 decoration-4 text-red-600' : ''
                        }`}
                      >
                        {huruf}
                      </span>
                      <div className="flex gap-1 mt-1">
                        <button
                          type="button"
                          onClick={() => toggleUnderline(huruf)}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition ${
                            isUnderlined ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                          title="Beri Garis Bawah"
                        >
                          _
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStrike(huruf)}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition ${
                            isStriked ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                          title="Coret Melintang"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400">
                Gunakan tombol <b>_</b> untuk garis bawah dan tombol <b>✕</b> untuk garis melintang.
              </p>
            </div>
          )}

          {/* ========================================================= */}
          {/* NOMOR 8: KAPAL, MUATAN, GUDANG */}
          {/* ========================================================= */}
          {currentQuestion.tipe === 'SOAL_8_KATA_LINGKARAN' && (
            <div className="space-y-5">
              <div className="flex justify-center items-center gap-6 text-base sm:text-xl font-black tracking-widest text-slate-700">
                <span className="bg-slate-100 px-3 py-1.5 rounded-lg border">K A P A L</span>
                <span className="bg-slate-100 px-3 py-1.5 rounded-lg border">M U A T A N</span>
                <span className="bg-slate-100 px-3 py-1.5 rounded-lg border">G U D A N G</span>
              </div>

              <div className="flex justify-center items-center gap-6">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <input
                      type="text"
                      maxLength={1}
                      disabled={!boardActive}
                      value={inputs[i] || ''}
                      onChange={(e) => handleInputArray(i, e.target.value)}
                      placeholder=""
                      className="alpha-input shape-circle text-center font-bold text-2xl shadow-sm"
                    />
                    <span className="text-[11px] font-bold text-slate-400">
                      Lingkaran {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* NOMOR 9: DERET BILANGAN 30 SAMPAI 40 */}
          {/* ========================================================= */}
          {currentQuestion.tipe === 'SOAL_9_DERET_30_40' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {[
                  '45', '87', '54', '33', '66', '78', '81', '49',
                  '36', '41', '71', '99', '17', '82', '64', '89'
                ].map((angka) => {
                  const isCoret = strikethroughList.includes(angka);
                  return (
                    <button
                      key={angka}
                      type="button"
                      onClick={() => toggleStrike(angka)}
                      className={`alpha-click border border-slate-300 font-mono text-lg sm:text-xl font-bold py-2 px-3.5 rounded-xl transition ${
                        isCoret ? 'dicoret' : 'bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      {angka}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400">
                Klik pada angka untuk mencoret / membatalkan coretan.
              </p>
            </div>
          )}

          {/* ========================================================= */}
          {/* NOMOR 10: GAMBAR TERBAGI 5 BAGIAN */}
          {/* ========================================================= */}
          {currentQuestion.tipe === 'SOAL_10_KOTAK_5_BAGIAN' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="flex justify-center border-2 border-slate-800 rounded-lg overflow-x-auto p-1 bg-slate-50">
                {[
                  { id: 0, label: 'Kecil 1', width: 'w-14 sm:w-16' },
                  { id: 1, label: 'Sedang', width: 'w-20 sm:w-28' },
                  { id: 2, label: 'Hampir Paling Besar', width: 'w-32 sm:w-44' },
                  { id: 3, label: 'Kecil 2', width: 'w-14 sm:w-16' },
                  { id: 4, label: 'Paling Besar', width: 'w-36 sm:w-48' },
                ].map((part) => (
                  <div
                    key={part.id}
                    className={`border-r last:border-r-0 border-slate-800 p-2 flex flex-col items-center justify-center ${part.width}`}
                  >
                    <input
                      type="text"
                      maxLength={1}
                      disabled={!boardActive}
                      value={inputs[part.id] || ''}
                      onChange={(e) => handleInputArray(part.id, e.target.value)}
                      placeholder=""
                      className="w-10 h-10 border-2 border-slate-700 text-center font-bold text-xl rounded bg-white shadow-sm"
                    />
                    <span className="text-[9px] text-slate-500 font-bold mt-1 text-center whitespace-nowrap">
                      {part.label}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400">
                Ketik angka sesuai instruksi pada petak berukuran kecil dan hampir paling besar.
              </p>
            </div>
          )}

          {/* ========================================================= */}
          {/* NOMOR 11: 9 BENTUK GEOMETRIS GANJIL/GENAP */}
          {/* ========================================================= */}
          {currentQuestion.tipe === 'SOAL_11_BENTUK_GANJIL_GENAP' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex flex-wrap justify-center items-center gap-3">
                {[
                  { id: 0, bentuk: 'circle', teks: '6A' },
                  { id: 1, bentuk: 'square', teks: '5' },
                  { id: 2, bentuk: 'triangle', teks: '7' },
                  { id: 3, bentuk: 'circle', teks: '9' },
                  { id: 4, bentuk: 'triangle', teks: '8' },
                  { id: 5, bentuk: 'square', teks: '2F' },
                  { id: 6, bentuk: 'circle', teks: '5P' },
                  { id: 7, bentuk: 'square', teks: '3' },
                  { id: 8, bentuk: 'triangle', teks: '1' },
                ].map((item) => {
                  const isCoret = strikethroughList.includes(item.id);
                  let shapeClasses = 'border-2 border-slate-800 bg-white';
                  if (item.bentuk === 'circle') shapeClasses += ' rounded-full';
                  if (item.bentuk === 'square') shapeClasses += ' rounded-none';
                  if (item.bentuk === 'triangle') shapeClasses += ' border-slate-800 rounded-sm';

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleStrike(item.id)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center font-black text-sm sm:text-base cursor-pointer transition ${shapeClasses} ${
                        isCoret ? 'bg-red-50 border-red-500 text-red-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      {item.teks}
                      {isCoret && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-full h-1 bg-red-600 rotate-45" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400">
                Klik bentuk untuk mencoret sesuai instruksi angka ganjil/genap.
              </p>
            </div>
          )}

          {/* ========================================================= */}
          {/* NOMOR 12: DERET ANGKA 1 SAMPAI 9 */}
          {/* ========================================================= */}
          {currentQuestion.tipe === 'SOAL_12_LOGIKA_ANGKA' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((angka) => {
                  const isCoret = strikethroughList.includes(angka);
                  const isUnderlined = underlineList.includes(angka);

                  return (
                    <div
                      key={angka}
                      className="flex flex-col items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200 min-w-[50px]"
                    >
                      <span
                        className={`text-2xl font-black font-mono py-1 ${
                          isUnderlined ? 'underline underline-offset-4 decoration-blue-600 decoration-4 text-blue-700' : ''
                        } ${
                          isCoret ? 'line-through decoration-red-600 decoration-4 text-red-600' : ''
                        }`}
                      >
                        {angka}
                      </span>
                      <div className="flex gap-1 mt-1">
                        <button
                          type="button"
                          onClick={() => toggleUnderline(angka)}
                          className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${
                            isUnderlined ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                          title="Garis Bawah"
                        >
                          _
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStrike(angka)}
                          className={`text-[10px] px-2 py-0.5 rounded font-bold transition ${
                            isCoret ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                          title="Coret"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-400">
                Pilih aksi coret (✕) atau garis bawah (_) pada angka yang sesuai.
              </p>
            </div>
          )}
        </div>

        {/* Next question manual button when active */}
        {boardActive && (
          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleNextManual}
              className="py-2.5 px-6 bg-[#0056b3] hover:bg-[#003d80] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shadow-md active:scale-95"
            >
              <span>{currentIndex + 1 < questions.length ? 'Simpan & Lanjut Soal Berikutnya' : 'Selesai Tes Army Alpha'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Skip button fallback */}
      {onSkipAlpha && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onSkipAlpha}
            className="text-xs text-slate-400 hover:text-slate-600 underline font-medium"
          >
            Lewati Tes Army Alpha & Lanjut ke Tahap Berhitung
          </button>
        </div>
      )}
    </div>
  );
};
