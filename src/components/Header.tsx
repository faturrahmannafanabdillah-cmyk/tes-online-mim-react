import React from 'react';
import { Clock } from 'lucide-react';

interface HeaderProps {
  timerSeconds: number;
  showTimer: boolean;
  stageName?: string;
}

export const Header: React.FC<HeaderProps> = ({ timerSeconds, showTimer, stageName }) => {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isWarning = timerSeconds <= 300 && timerSeconds > 0;

  return (
    <header className="bg-white sticky top-0 z-[1000] border-b-[3px] border-[#0056b3] shadow-[0_2px_12px_rgba(0,86,179,0.1)] px-4 sm:px-6 py-3 flex justify-between items-center transition-all">
      <div className="flex items-center gap-3">
        <img
          src="https://media.licdn.com/dms/image/v2/C560BAQHQkiCjDXGmtA/company-logo_200_200/company-logo_200_200/0/1644484395981?e=2147483647&v=beta&t=ucg2kJaAuU2aluaQ-jYwjJCfl4kJpAARLKl85Q5kJ38"
          alt="Logo PT MIM"
          className="h-10 sm:h-11 w-auto rounded-md object-contain shadow-sm border border-slate-100"
          onError={(e) => {
            // Fallback if network blocks external LinkedIn CDN image
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div>
          <h1 className="font-extrabold text-[15px] sm:text-[17px] text-[#0056b3] leading-tight tracking-tight">
            PT Multi Indomandiri
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-semibold uppercase tracking-wider">
            WINGS Group {stageName ? `• ${stageName}` : ''}
          </p>
        </div>
      </div>

      {showTimer && (
        <div
          className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-sm sm:text-base text-white shadow-md transition-colors ${
            isWarning
              ? 'bg-[#dc3545] animate-timer-shake'
              : 'bg-[#0056b3]'
          }`}
          title="Sisa Waktu Pengerjaan"
        >
          <Clock className="w-4 h-4 animate-pulse" />
          <span className="font-mono text-[15px] sm:text-lg tracking-wider">{formattedTime}</span>
        </div>
      )}
    </header>
  );
};
