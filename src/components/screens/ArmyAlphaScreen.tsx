import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, CheckCircle } from 'lucide-react';
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
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [boardActive, setBoardActive] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [alphaAnswers, setAlphaAnswers] = useState<Record<string, AlphaAnswerItem>>({});

  // Dynamic input states for the current question
  const [inputs, setInputs] = useState<string[]>([]);
  const [strikethroughList, setStrikethroughList] = useState<(number | string)[]>([]);
  const [underlineList, setUnderlineList] = useState<(number | string)[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [irisanInputs, setIrisanInputs] = useState<Record<string, string>>({});

  // Modal / inline input popover for SVG click on Soal 5 & 6
  const [activeSvgArea, setActiveSvgArea] = useState<{ id: string; x: number; y: number } | null>(null);
  const [svgInputValue, setSvgInputValue] = useState('');
  const svgInputRef = useRef<HTMLInputElement>(null);

  // Synchronized refs to guarantee zero stale closure when audio.onended triggers
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const inputsRef = useRef<string[]>([]);
  const strikethroughRef = useRef<(number | string)[]>([]);
  const underlineRef = useRef<(number | string)[]>([]);
  const selectedRouteRef = useRef<string>('');
  const irisanInputsRef = useRef<Record<string, string>>({});
  const alphaAnswersRef = useRef<Record<string, AlphaAnswerItem>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    inputsRef.current = inputs;
  }, [inputs]);

  useEffect(() => {
    strikethroughRef.current = strikethroughList;
  }, [strikethroughList]);

  useEffect(() => {
    underlineRef.current = underlineList;
  }, [underlineList]);

  useEffect(() => {
    selectedRouteRef.current = selectedRoute;
  }, [selectedRoute]);

  useEffect(() => {
    irisanInputsRef.current = irisanInputs;
  }, [irisanInputs]);

  const currentQuestion = questions[currentIndex];

  const saveCurrentQuestionAnswers = () => {
    const q = questions[currentIndexRef.current];
    if (!q) return alphaAnswersRef.current;

    const itemAnswer: AlphaAnswerItem = {
      nomor: q.nomor,
      tipe: q.tipe,
      inputan: [...inputsRef.current],
      dicoret: [...strikethroughRef.current],
      garisBawah: [...underlineRef.current],
      jalurTerpilih: selectedRouteRef.current,
      irisan: { ...irisanInputsRef.current },
    };

    const updated = {
      ...alphaAnswersRef.current,
      [q.id]: itemAnswer,
    };
    alphaAnswersRef.current = updated;
    setAlphaAnswers(updated);
    return updated;
  };

  // Putar file MP3 audio resmi yang sudah berisi durasi instruksi, jeda Mulai, hingga Stop
  const playAudioForCurrentQuestion = () => {
    const q = questions[currentIndexRef.current];
    if (!q) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audioSrc = q.audio || `/audio/army_alpha/soal_${q.nomor}.mp3`;
    const audio = new Audio(audioSrc);
    audioRef.current = audio;

    setIsPlayingAudio(true);
    setBoardActive(true);
    setAutoplayBlocked(false);

    // 3. AUTO-NEXT BERDASARKAN AUDIO (.onended)
    // Ketika file audio selesai terputar penuh, otomatis simpan dan render soal berikutnya
    audio.onended = () => {
      console.log(`[ArmyAlpha] Audio soal ${q.nomor} selesai (.onended). Auto-next ke soal berikutnya.`);
      setIsPlayingAudio(false);
      setBoardActive(false);
      setActiveSvgArea(null);

      const updated = saveCurrentQuestionAnswers();

      // Transisi otomatis ke soal berikutnya tanpa tombol Lanjut
      setTimeout(() => {
        if (currentIndexRef.current + 1 < questions.length) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          onFinishAlpha(updated);
        }
      }, 350);
    };

    audio.onerror = (e) => {
      console.warn(`[ArmyAlpha] Audio soal ${q.nomor} gagal dimuat:`, e);
      setIsPlayingAudio(false);
      setBoardActive(true);
    };

    audio.play().catch((err) => {
      console.warn(`[ArmyAlpha] Autoplay audio nomor ${q.nomor} memerlukan interaksi awal browser:`, err);
      setAutoplayBlocked(true);
      setIsPlayingAudio(false);
      setBoardActive(true);
    });
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!currentQuestion) return;

    currentIndexRef.current = currentIndex;
    setActiveSvgArea(null);
    setSvgInputValue('');

    const existing = alphaAnswersRef.current[currentQuestion.id] || {
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

    inputsRef.current = existing.inputan || [];
    strikethroughRef.current = existing.dicoret || [];
    underlineRef.current = existing.garisBawah || [];
    selectedRouteRef.current = existing.jalurTerpilih || '';
    irisanInputsRef.current = existing.irisan || {};

    // Otomatis putar audio soal yang sedang aktif
    playAudioForCurrentQuestion();
  }, [currentIndex, currentQuestion?.id]);

  // Focus floating input when clicking SVG area
  useEffect(() => {
    if (activeSvgArea && svgInputRef.current) {
      svgInputRef.current.focus();
    }
  }, [activeSvgArea]);

  const handleInputArray = (idx: number, val: string, maxLen?: number) => {
    const next = [...inputs];
    while (next.length <= idx) next.push('');
    next[idx] = maxLen ? val.toUpperCase().slice(-maxLen) : val.toUpperCase();
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

  // SVG Area click handler for Soal 5 & 6
  const handleSvgAreaClick = (areaId: string, clickX: number, clickY: number) => {
    if (!boardActive) return;
    setActiveSvgArea({ id: areaId, x: clickX, y: clickY });
    setSvgInputValue(irisanInputs[areaId] || '');
  };

  const handleSaveSvgInput = (val: string) => {
    if (!activeSvgArea) return;
    const clean = val.trim().toUpperCase().slice(0, 1);
    const next = { ...irisanInputs };
    if (clean) {
      next[activeSvgArea.id] = clean;
    } else {
      delete next[activeSvgArea.id];
    }
    setIrisanInputs(next);
    setActiveSvgArea(null);
    setSvgInputValue('');
  };

  if (!currentQuestion) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <CheckCircle className="w-16 h-16 text-[#16a34a] mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-slate-800">Tahap 1 Selesai!</h3>
      </div>
    );
  }

  return (
    <div className="max-w-[760px] mx-auto py-5 px-3 sm:px-4 animate-fade-in space-y-4">
      {/* Top Header - NO test name mentioned */}
      <div className="bg-[#e8f0fb] rounded-xl p-3.5 text-center border border-blue-100 shadow-sm flex items-center justify-between">
        <span className="font-extrabold text-sm sm:text-base text-[#0056b3] tracking-tight">
          Tahap 1
        </span>
        <span className="text-xs font-bold bg-[#0056b3] text-white px-3 py-1 rounded-full shadow-sm">
          Nomor {currentQuestion.nomor} / {questions.length}
        </span>
      </div>

      {/* Main Board Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.07)] border border-slate-200 text-center relative overflow-hidden min-h-[340px] flex flex-col justify-between">
        {/* Tombol Play cadangan jika autoplay dicegah oleh kebijakan browser */}
        {autoplayBlocked && (
          <div className="my-4 max-w-sm mx-auto">
            <button
              type="button"
              onClick={playAudioForCurrentQuestion}
              className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm sm:text-base bg-[#0056b3] hover:bg-[#003d80] text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>▶️ Putar Audio Nomor {currentQuestion.nomor}</span>
            </button>
          </div>
        )}

        {/* Banner Status Audio (Tanpa angka hitung mundur / timer visual) */}
        {isPlayingAudio && (
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50/80 border border-blue-200 py-1.5 px-4 rounded-full max-w-fit mx-auto my-2 animate-pulse">
            <Volume2 className="w-4 h-4 text-blue-600 animate-bounce" />
            <span>Mendengarkan instruksi penguji...</span>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VISUAL LEMBAR SOAL (100% POLOS SESUAI KERTAS ASLI) */}
        {/* ------------------------------------------------------------- */}
        <div
          className={`py-6 px-2 my-auto transition-all duration-300 flex flex-col justify-center items-center ${
            boardActive ? 'pointer-events-auto' : 'pointer-events-none opacity-80'
          }`}
        >
          {/* NOMOR 1: 5 LINGKARAN */}
          {currentQuestion.tipe === 'SOAL_1_LINGKARAN' && (
            <div className="flex justify-center items-center gap-2 sm:gap-4 flex-wrap">
              {[0, 1, 2, 3, 4].map((i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="characters"
                  spellCheck="false"
                  maxLength={1}
                  disabled={!boardActive}
                  value={inputs[i] || ''}
                  onChange={(e) => handleInputArray(i, e.target.value, 1)}
                  className="alpha-input shape-circle text-center font-bold text-xl sm:text-2xl shadow-sm focus:border-[#0056b3]"
                />
              ))}
            </div>
          )}

          {/* NOMOR 2: 9 LINGKARAN BERNOMOR 1 s/d 9 */}
          {currentQuestion.tipe === 'SOAL_2_JALUR_NOMOR' && (
            <div className="space-y-6 w-full max-w-xl">
              <div className="relative py-6 px-2 overflow-x-auto">
                <div className="flex justify-between items-center gap-2 min-w-[480px] relative z-10">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <div
                      key={num}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-slate-900 bg-white flex items-center justify-center font-bold text-lg text-slate-900"
                    >
                      {num}
                    </div>
                  ))}
                </div>

                {selectedRoute && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                    {selectedRoute === 'bawah4_atas5' && (
                      <path
                        d="M 145,55 C 180,95 210,95 250,55 C 290,15 320,15 355,55"
                        fill="none"
                        stroke="#0056b3"
                        strokeWidth="4"
                      />
                    )}
                    {selectedRoute === 'atas4_bawah5' && (
                      <path
                        d="M 145,55 C 180,15 210,15 250,55 C 290,95 320,95 355,55"
                        fill="none"
                        stroke="#0056b3"
                        strokeWidth="4"
                      />
                    )}
                    {selectedRoute === 'lurus' && (
                      <path
                        d="M 145,55 L 355,55"
                        fill="none"
                        stroke="#0056b3"
                        strokeWidth="4"
                      />
                    )}
                  </svg>
                )}
              </div>

              <div className="flex justify-center gap-3">
                <label
                  className={`px-4 py-2.5 rounded-xl border-2 cursor-pointer transition text-xs sm:text-sm font-bold ${
                    selectedRoute === 'bawah4_atas5'
                      ? 'border-[#0056b3] bg-blue-50 text-[#0056b3]'
                      : 'border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="route_generic"
                    value="bawah4_atas5"
                    checked={selectedRoute === 'bawah4_atas5'}
                    onChange={() => setSelectedRoute('bawah4_atas5')}
                    className="hidden"
                  />
                  <span>Jalur 1</span>
                </label>

                <label
                  className={`px-4 py-2.5 rounded-xl border-2 cursor-pointer transition text-xs sm:text-sm font-bold ${
                    selectedRoute === 'atas4_bawah5'
                      ? 'border-[#0056b3] bg-blue-50 text-[#0056b3]'
                      : 'border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="route_generic"
                    value="atas4_bawah5"
                    checked={selectedRoute === 'atas4_bawah5'}
                    onChange={() => setSelectedRoute('atas4_bawah5')}
                    className="hidden"
                  />
                  <span>Jalur 2</span>
                </label>

                <label
                  className={`px-4 py-2.5 rounded-xl border-2 cursor-pointer transition text-xs sm:text-sm font-bold ${
                    selectedRoute === 'lurus'
                      ? 'border-[#0056b3] bg-blue-50 text-[#0056b3]'
                      : 'border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="route_generic"
                    value="lurus"
                    checked={selectedRoute === 'lurus'}
                    onChange={() => setSelectedRoute('lurus')}
                    className="hidden"
                  />
                  <span>Jalur 3</span>
                </label>
              </div>
            </div>
          )}

          {/* NOMOR 3: 3 LINGKARAN POLOS + YA & TIDAK */}
          {currentQuestion.tipe === 'SOAL_3_KOMA_CORET' && (
            <div className="flex justify-center items-center gap-4 sm:gap-8 flex-wrap">
              <div className="flex gap-2 sm:gap-3">
                {[0, 1, 2].map((i) => (
                  <input
                    key={i}
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="characters"
                    spellCheck="false"
                    maxLength={1}
                    disabled={!boardActive}
                    value={inputs[i] || ''}
                    onChange={(e) => handleInputArray(i, e.target.value, 1)}
                    className="alpha-input shape-circle text-center font-bold text-xl sm:text-2xl"
                  />
                ))}
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                {['Ya', 'Tidak'].map((kata) => {
                  const isCoret = strikethroughList.includes(kata);
                  return (
                    <button
                      key={kata}
                      type="button"
                      onClick={() => toggleStrike(kata)}
                      disabled={!boardActive}
                      className={`text-lg sm:text-xl font-bold px-3.5 sm:px-4 py-2 rounded-lg border-2 transition-all min-h-[44px] ${
                        isCoret
                          ? 'border-red-500 bg-red-50 text-red-600 line-through'
                          : 'border-slate-300 bg-white text-slate-800'
                      }`}
                    >
                      {kata}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* NOMOR 4: 5 LINGKARAN POLOS (PERBAIKAN SEJAJAR TANPA TITIK PERUSAK ALIGNMENT) */}
          {currentQuestion.tipe === 'SOAL_4_HARI_MINGGU' && (
            <div className="flex justify-center items-center gap-2 sm:gap-4 flex-wrap">
              {[0, 1, 2, 3, 4].map((i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="characters"
                  spellCheck="false"
                  maxLength={1}
                  disabled={!boardActive}
                  value={inputs[i] || ''}
                  onChange={(e) => handleInputArray(i, e.target.value, 1)}
                  className="alpha-input shape-circle text-center font-bold text-xl sm:text-2xl shadow-sm"
                />
              ))}
            </div>
          )}

          {/* NOMOR 5: IRISAN SEGITIGA & LINGKARAN (CLICKABLE MURNI TANPA BOX PERMANEN) */}
          {currentQuestion.tipe === 'SOAL_5_SEGITIGA_LINGKARAN' && (
            <div className="relative w-72 h-56 mx-auto border border-slate-300 rounded-2xl bg-white p-2 flex items-center justify-center">
              <svg viewBox="0 0 200 150" className="w-full h-full select-none">
                <defs>
                  <clipPath id="circle-clip">
                    <circle cx="90" cy="75" r="50" />
                  </clipPath>
                  <clipPath id="triangle-clip">
                    <polygon points="120,20 185,130 55,130" />
                  </clipPath>
                </defs>

                {/* Area 1: Lingkaran Luar Segitiga */}
                <circle
                  cx="90"
                  cy="75"
                  r="50"
                  fill={activeSvgArea?.id === 'lingkaran_luar' ? '#dbeafe' : '#f8fafc'}
                  stroke="#1e293b"
                  strokeWidth="3"
                  className="cursor-pointer hover:fill-blue-50 transition-colors"
                  onClick={() => handleSvgAreaClick('lingkaran_luar', 65, 75)}
                />

                {/* Segitiga Dasar */}
                <polygon
                  points="120,20 185,130 55,130"
                  fill={activeSvgArea?.id === 'segitiga_luar' ? '#dbeafe' : '#f8fafc'}
                  stroke="#1e293b"
                  strokeWidth="3"
                  className="cursor-pointer hover:fill-blue-50 transition-colors"
                  onClick={() => handleSvgAreaClick('segitiga_luar', 150, 100)}
                />

                {/* Area 2: Irisan Tengah (Intersection) */}
                <polygon
                  points="120,20 185,130 55,130"
                  clipPath="url(#circle-clip)"
                  fill={activeSvgArea?.id === 'irisan' ? '#bfdbfe' : '#e2e8f0'}
                  stroke="#1e293b"
                  strokeWidth="3"
                  className="cursor-pointer hover:fill-blue-100 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSvgAreaClick('irisan', 105, 80);
                  }}
                />

                {/* Teks Huruf/Tanda yang Sudah Diisi Peserta (Tampil Bersih di SVG) */}
                {irisanInputs['lingkaran_luar'] && (
                  <text
                    x="65"
                    y="75"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-black text-2xl fill-slate-900 pointer-events-none"
                  >
                    {irisanInputs['lingkaran_luar']}
                  </text>
                )}

                {irisanInputs['irisan'] && (
                  <text
                    x="105"
                    y="80"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-black text-2xl fill-slate-900 pointer-events-none"
                  >
                    {irisanInputs['irisan']}
                  </text>
                )}

                {irisanInputs['segitiga_luar'] && (
                  <text
                    x="150"
                    y="100"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-black text-2xl fill-slate-900 pointer-events-none"
                  >
                    {irisanInputs['segitiga_luar']}
                  </text>
                )}
              </svg>

              {/* Floating Input Box muncul saat area diklik */}
              {activeSvgArea && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center rounded-2xl z-20">
                  <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-lg border border-slate-300 flex items-center gap-2">
                    <input
                      ref={svgInputRef}
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="characters"
                      spellCheck="false"
                      maxLength={1}
                      value={svgInputValue}
                      onChange={(e) => setSvgInputValue(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveSvgInput(svgInputValue);
                        if (e.key === 'Escape') setActiveSvgArea(null);
                      }}
                      className="w-12 h-12 text-center text-2xl font-black border-2 border-[#0056b3] rounded-lg outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveSvgInput(svgInputValue)}
                      className="px-3.5 py-3 bg-[#0056b3] text-white rounded-lg text-xs font-bold min-h-[44px]"
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSvgArea(null)}
                      className="px-2.5 py-3 text-slate-500 text-xs font-bold hover:text-slate-800 min-h-[44px]"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* NOMOR 6: LINGKARAN, KOTAK, SEGITIGA (CLICKABLE MURNI TANPA BOX PERMANEN) */}
          {currentQuestion.tipe === 'SOAL_6_LINGKARAN_KOTAK_SEGITIGA' && (
            <div className="relative w-80 h-56 mx-auto border border-slate-300 rounded-2xl bg-white p-2 flex items-center justify-center">
              <svg viewBox="0 0 200 150" className="w-full h-full select-none">
                {/* Bujur Sangkar Dasar */}
                <rect
                  x="75"
                  y="45"
                  width="65"
                  height="65"
                  fill={activeSvgArea?.id === 'kotak_segitiga_non_lingkaran' ? '#dbeafe' : '#f8fafc'}
                  stroke="#1e293b"
                  strokeWidth="2.5"
                  className="cursor-pointer hover:fill-blue-50 transition-colors"
                  onClick={() => handleSvgAreaClick('kotak_segitiga_non_lingkaran', 120, 65)}
                />

                {/* Lingkaran */}
                <circle
                  cx="80"
                  cy="75"
                  r="45"
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth="2.5"
                  className="cursor-pointer"
                  onClick={() => handleSvgAreaClick('lingkaran_area', 55, 75)}
                />

                {/* Segitiga */}
                <polygon
                  points="120,25 185,135 55,135"
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth="2.5"
                  className="cursor-pointer"
                  onClick={() => handleSvgAreaClick('segitiga_non_kotak', 160, 115)}
                />

                {/* Text entries rendered inside shapes */}
                {irisanInputs['segitiga_non_kotak'] && (
                  <text
                    x="160"
                    y="115"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-black text-2xl fill-slate-900 pointer-events-none"
                  >
                    {irisanInputs['segitiga_non_kotak']}
                  </text>
                )}

                {irisanInputs['kotak_segitiga_non_lingkaran'] && (
                  <text
                    x="120"
                    y="65"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-black text-2xl fill-slate-900 pointer-events-none"
                  >
                    {irisanInputs['kotak_segitiga_non_lingkaran']}
                  </text>
                )}

                {irisanInputs['lingkaran_area'] && (
                  <text
                    x="55"
                    y="75"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-black text-2xl fill-slate-900 pointer-events-none"
                  >
                    {irisanInputs['lingkaran_area']}
                  </text>
                )}
              </svg>

              {/* Floating Input Box muncul saat area diklik */}
              {activeSvgArea && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center rounded-2xl z-20">
                  <div className="bg-white p-3.5 sm:p-4 rounded-xl shadow-lg border border-slate-300 flex items-center gap-2">
                    <input
                      ref={svgInputRef}
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="characters"
                      spellCheck="false"
                      maxLength={1}
                      value={svgInputValue}
                      onChange={(e) => setSvgInputValue(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveSvgInput(svgInputValue);
                        if (e.key === 'Escape') setActiveSvgArea(null);
                      }}
                      className="w-12 h-12 text-center text-2xl font-black border-2 border-[#0056b3] rounded-lg outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveSvgInput(svgInputValue)}
                      className="px-3.5 py-3 bg-[#0056b3] text-white rounded-lg text-xs font-bold min-h-[44px]"
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSvgArea(null)}
                      className="px-2.5 py-3 text-slate-500 text-xs font-bold hover:text-slate-800 min-h-[44px]"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* NOMOR 7: HURUF A s/d P POLOS */}
          {currentQuestion.tipe === 'SOAL_7_HURUF_GARIS_CORET' && (
            <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
              {[
                'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
                'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'
              ].map((huruf) => {
                const isUnderlined = underlineList.includes(huruf);
                const isStriked = strikethroughList.includes(huruf);

                return (
                  <div
                    key={huruf}
                    className="flex flex-col items-center p-1 border border-slate-200 rounded-lg min-w-[38px] bg-slate-50"
                  >
                    <span
                      className={`text-xl font-black font-mono py-0.5 ${
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
                        disabled={!boardActive}
                        className={`text-[10px] px-1 py-0.5 rounded font-bold ${
                          isUnderlined ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        _
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStrike(huruf)}
                        disabled={!boardActive}
                        className={`text-[10px] px-1 py-0.5 rounded font-bold ${
                          isStriked ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* NOMOR 8: KAPAL, MUATAN, GUDANG POLOS */}
          {currentQuestion.tipe === 'SOAL_8_KATA_LINGKARAN' && (
            <div className="space-y-6">
              <div className="flex justify-center items-center gap-8 text-lg sm:text-xl font-black tracking-widest text-slate-800">
                <span>KAPAL</span>
                <span>MUATAN</span>
                <span>GUDANG</span>
              </div>

              <div className="flex justify-center items-center gap-4 sm:gap-6">
                {[0, 1, 2].map((i) => (
                  <input
                    key={i}
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="characters"
                    spellCheck="false"
                    maxLength={1}
                    disabled={!boardActive}
                    value={inputs[i] || ''}
                    onChange={(e) => handleInputArray(i, e.target.value, 1)}
                    className="alpha-input shape-circle text-center font-bold text-xl sm:text-2xl shadow-sm"
                  />
                ))}
              </div>
            </div>
          )}

          {/* NOMOR 9: DERET BILANGAN POLOS */}
          {currentQuestion.tipe === 'SOAL_9_DERET_30_40' && (
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-xl mx-auto">
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
                    disabled={!boardActive}
                    className={`alpha-click border border-slate-300 font-mono text-lg sm:text-xl font-bold py-2 px-3 rounded-lg transition min-h-[44px] ${
                      isCoret ? 'dicoret' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    {angka}
                  </button>
                );
              })}
            </div>
          )}

          {/* NOMOR 10: 5 PETAK (HAPUS BATASAN MAXLENGTH={1} AGAR BISA KETIK >1 ANGKA) */}
          {currentQuestion.tipe === 'SOAL_10_KOTAK_5_BAGIAN' && (
            <div className="flex justify-center border-2 border-slate-900 rounded-lg overflow-x-auto p-1 bg-white max-w-xl mx-auto scrollbar-none">
              {[
                { id: 0, width: 'w-14 sm:w-16' },
                { id: 1, width: 'w-16 sm:w-28' },
                { id: 2, width: 'w-24 sm:w-44' },
                { id: 3, width: 'w-14 sm:w-16' },
                { id: 4, width: 'w-28 sm:w-48' },
              ].map((part) => (
                <div
                  key={part.id}
                  className={`border-r last:border-r-0 border-slate-900 p-1 sm:p-2 flex items-center justify-center shrink-0 ${part.width}`}
                >
                  <input
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="characters"
                    spellCheck="false"
                    disabled={!boardActive}
                    value={inputs[part.id] || ''}
                    onChange={(e) => handleInputArray(part.id, e.target.value)}
                    className="w-10 sm:w-12 h-10 border-2 border-slate-800 text-center font-bold text-base sm:text-lg rounded bg-white shadow-sm"
                  />
                </div>
              ))}
            </div>
          )}

          {/* NOMOR 11: 9 BENTUK GEOMETRIS (BENTUK TERAKHIR ADALAH SEGITIGA BERISI ANGKA 1) */}
          {currentQuestion.tipe === 'SOAL_11_BENTUK_GANJIL_GENAP' && (
            <div className="flex flex-wrap justify-center items-center gap-3 max-w-2xl mx-auto">
              {[
                { id: 0, bentuk: 'circle', teks: '6A' },
                { id: 1, bentuk: 'square', teks: '5' },
                { id: 2, bentuk: 'triangle', teks: '7' },
                { id: 3, bentuk: 'circle', teks: '9' },
                { id: 4, bentuk: 'triangle', teks: '8' },
                { id: 5, bentuk: 'square', teks: '2F' },
                { id: 6, bentuk: 'circle', teks: '5P' },
                { id: 7, bentuk: 'square', teks: '3' },
                { id: 8, bentuk: 'triangle', teks: '1' }, // Pastikan bentuk terakhir adalah segitiga berisi angka 1
              ].map((item) => {
                const isCoret = strikethroughList.includes(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleStrike(item.id)}
                    disabled={!boardActive}
                    className="relative cursor-pointer transition p-1 hover:opacity-80"
                  >
                    {item.bentuk === 'circle' && (
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-slate-900 flex items-center justify-center font-black text-sm sm:text-base ${
                          isCoret ? 'bg-red-50 text-red-600' : 'bg-white text-slate-900'
                        }`}
                      >
                        {item.teks}
                      </div>
                    )}

                    {item.bentuk === 'square' && (
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 border-2 border-slate-900 flex items-center justify-center font-black text-sm sm:text-base ${
                          isCoret ? 'bg-red-50 text-red-600' : 'bg-white text-slate-900'
                        }`}
                      >
                        {item.teks}
                      </div>
                    )}

                    {item.bentuk === 'triangle' && (
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          <polygon
                            points="50,10 90,90 10,90"
                            fill={isCoret ? '#fef2f2' : '#ffffff'}
                            stroke="#0f172a"
                            strokeWidth="5"
                          />
                        </svg>
                        <span
                          className={`absolute top-7 font-black text-sm sm:text-base ${
                            isCoret ? 'text-red-600' : 'text-slate-900'
                          }`}
                        >
                          {item.teks}
                        </span>
                      </div>
                    )}

                    {/* Strikethrough line */}
                    {isCoret && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-full h-1 bg-red-600 rotate-45" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* NOMOR 12: ANGKA 1 s/d 9 POLOS */}
          {currentQuestion.tipe === 'SOAL_12_LOGIKA_ANGKA' && (
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-xl mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((angka) => {
                const isCoret = strikethroughList.includes(angka);
                const isUnderlined = underlineList.includes(angka);

                return (
                  <div
                    key={angka}
                    className="flex flex-col items-center p-2 rounded-lg border border-slate-200 min-w-[48px] bg-white"
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
                        disabled={!boardActive}
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          isUnderlined ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        _
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStrike(angka)}
                        disabled={!boardActive}
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          isCoret ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
