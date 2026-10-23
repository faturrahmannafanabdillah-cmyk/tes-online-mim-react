import React, { useEffect, useState, useRef } from 'react';
import { Volume2, VolumeX, PlayCircle, PauseCircle, RotateCcw, ArrowRight, ShieldCheck } from 'lucide-react';

interface InstructionScreenProps {
  tahapNumber: number;
  subTitle?: string;
  instructionText: string[];
  examples?: { soal: string; jawaban: string }[];
  audioSrc?: string;
  onStart: () => void;
  nextButtonLabel?: string;
}

export const InstructionScreen: React.FC<InstructionScreenProps> = ({
  tahapNumber,
  subTitle,
  instructionText,
  examples,
  audioSrc,
  onStart,
  nextButtonLabel = 'Mulai Mengerjakan',
}) => {
  const defaultAudio = audioSrc || `/audio/instructions/instruksi_tahap_${tahapNumber}.mp3`;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(defaultAudio);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setAudioLoaded(true);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      setAudioLoaded(false);
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Try autoplay once mounted
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setHasStartedPlaying(true);
      })
      .catch(() => {
        // Autoplay blocked by browser policy without user gesture
        setIsPlaying(false);
      });

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
    };
  }, [tahapNumber, defaultAudio]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasStartedPlaying(true);
        })
        .catch(() => {});
    }
  };

  const restartAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        setHasStartedPlaying(true);
      })
      .catch(() => {});
  };

  const handleStart = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onStart();
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="max-w-[780px] mx-auto py-6 px-3 sm:px-4 animate-fade-in space-y-5">
      {/* Stage Banner (No test names, just Tahap X) */}
      <div className="bg-[#e8f0fb] rounded-2xl p-4 sm:p-5 border border-blue-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={togglePlay}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition shadow-sm cursor-pointer ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
            title={isPlaying ? 'Jeda Audio' : 'Putar Audio'}
          >
            {isPlaying ? (
              <>
                <PauseCircle className="w-4 h-4" />
                <span>Audio Sedang Berjalan</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 text-[#0056b3]" />
                <span>{hasStartedPlaying ? 'Lanjutkan Audio' : 'Dengarkan Audio'}</span>
              </>
            )}
          </button>

          {hasStartedPlaying && (
            <button
              type="button"
              onClick={restartAudio}
              className="p-2 bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 rounded-full transition cursor-pointer"
              title="Putar Ulang Dari Awal"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Audio Progress Bar Card */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200 shadow-sm flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="p-2 rounded-full bg-[#0056b3] text-white hover:bg-[#003d80] transition shrink-0 cursor-pointer shadow-sm"
        >
          {isPlaying ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
        </button>

        <div className="flex-1">
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 mb-1">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[#0056b3]" />
              Rekaman Suara Penguji Resmi
            </span>
            <span className="font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-[#0056b3] to-[#003d80] transition-all duration-200 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
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
          *Pastikan Anda telah mendengarkan dan memahami petunjuk sebelum menekan tombol mulai di bawah.
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
