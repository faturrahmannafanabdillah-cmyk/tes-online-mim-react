import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, PlayCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface InstructionScreenProps {
  tahapNumber: number;
  subTitle?: string;
  instructionText: string[];
  examples?: { soal: string; jawaban: string }[];
  onStart: () => void;
  nextButtonLabel?: string;
}

export const InstructionScreen: React.FC<InstructionScreenProps> = ({
  tahapNumber,
  subTitle,
  instructionText,
  examples,
  onStart,
  nextButtonLabel = 'Mulai Mengerjakan',
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);

  const fullTextToSpeak = instructionText.join(' ') + (examples ? ' Silakan perhatikan contoh soal berikut.' : '') + ' Jika sudah paham silahkan klik mulai untuk mengerjakan tes.';

  const playTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(fullTextToSpeak);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const stopTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  useEffect(() => {
    // Autoplay voice instructions when screen mounts
    playTTS();

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [tahapNumber]);

  const handleStart = () => {
    stopTTS();
    onStart();
  };

  return (
    <div className="max-w-[780px] mx-auto py-6 px-3 sm:px-4 animate-fade-in space-y-5">
      {/* Stage Banner (No test names, just Tahap X) */}
      <div className="bg-[#e8f0fb] rounded-2xl p-4 sm:p-5 border border-blue-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-[#0056b3] font-black text-lg sm:text-xl tracking-tight">
            Petunjuk Pelaksanaan Tahap {tahapNumber}
          </h2>
          {subTitle && (
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {subTitle}
            </p>
          )}
        </div>

        {/* Audio control button */}
        <button
          type="button"
          onClick={isPlayingAudio ? stopTTS : playTTS}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition shadow-sm cursor-pointer ${
            isPlayingAudio
              ? 'bg-amber-500 text-white animate-pulse'
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
          }`}
          title={isPlayingAudio ? 'Hentikan Audio' : 'Putar Ulang Audio'}
        >
          {isPlayingAudio ? (
            <>
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">Audio Aktif</span>
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4 text-[#0056b3]" />
              <span className="hidden sm:inline">Putar Penjelasan</span>
            </>
          )}
        </button>
      </div>

      {/* Main Instructions Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.07)] border border-slate-200 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-slate-700 font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-[#0056b3]" />
          <span>Bacalah dan dengarkan petunjuk berikut dengan seksama:</span>
        </div>

        {/* Paragraphs */}
        <div className="space-y-3 text-slate-700 text-sm sm:text-base leading-relaxed">
          {instructionText.map((p, idx) => (
            <p key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              {p}
            </p>
          ))}
        </div>

        {/* Examples (for Tahap 3) */}
        {examples && examples.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h4 className="font-extrabold text-sm text-[#0056b3] mb-3">
              Contoh Cara Menjawab:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
              {examples.map((ex, i) => (
                <div key={i} className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex justify-between items-center">
                  <span className="font-mono font-bold text-slate-800">{ex.soal}</span>
                  <span className={`font-black px-2.5 py-1 rounded-lg ${
                    ex.jawaban.includes('SAMA') ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {ex.jawaban}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 text-xs text-slate-400 text-center">
          *Pastikan Anda telah memahami petunjuk sebelum menekan tombol mulai di bawah.
        </div>

        {/* Start button */}
        <div className="pt-3">
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-4 px-6 bg-[#0056b3] hover:bg-[#003d80] text-white rounded-xl font-extrabold text-base sm:text-lg transition-all shadow-md shadow-[#0056b3]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <span>{nextButtonLabel}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
