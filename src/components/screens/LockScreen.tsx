import React from 'react';
import { RefreshCw, CheckCircle2, AlertOctagon, AlertTriangle, Clock } from 'lucide-react';

interface LockScreenProps {
  status: 'submitting' | 'success' | 'disqualified' | 'error';
  retryCount: number;
  onRetry: () => void;
  candidateName?: string;
  candidateEmail?: string;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  status,
  retryCount,
  onRetry,
  candidateName,
  candidateEmail,
}) => {
  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center animate-fade-in">
      <div className="bg-white rounded-2xl p-7 sm:p-9 shadow-[0_4px_25px_rgba(0,0,0,0.08)] border border-slate-200">
        {/* Status Icon */}
        <div className="mb-5 flex justify-center">
          {status === 'submitting' && (
            <div className="w-20 h-20 rounded-full bg-blue-50 text-[#0056b3] flex items-center justify-center animate-pulse">
              <Clock className="w-10 h-10 animate-spin" />
            </div>
          )}

          {status === 'success' && (
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-[#16a34a] flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>
          )}

          {status === 'disqualified' && (
            <div className="w-20 h-20 rounded-full bg-red-100 text-[#dc3545] flex items-center justify-center shadow-inner">
              <AlertOctagon className="w-12 h-12" />
            </div>
          )}

          {status === 'error' && (
            <div className="w-20 h-20 rounded-full bg-amber-50 text-[#f59e0b] flex items-center justify-center shadow-inner">
              <AlertTriangle className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* Status Title */}
        <h2
          className={`text-2xl sm:text-3xl font-extrabold mb-3 tracking-tight ${
            status === 'success'
              ? 'text-[#16a34a]'
              : status === 'disqualified'
              ? 'text-[#dc3545]'
              : status === 'error'
              ? 'text-[#f59e0b]'
              : 'text-[#0056b3]'
          }`}
        >
          {status === 'submitting' && 'Mengirimkan Jawaban...'}
          {status === 'success' && 'UJIAN SELESAI'}
          {status === 'disqualified' && 'DISKUALIFIKASI'}
          {status === 'error' && 'Gagal Mengirim'}
        </h2>

        {/* Candidate Badge */}
        {candidateName && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mb-4 text-xs text-slate-600">
            Kandidat: <b className="text-slate-800">{candidateName}</b>
            {candidateEmail && <span className="text-slate-400"> ({candidateEmail})</span>}
          </div>
        )}

        {/* Description Message */}
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
          {status === 'submitting' &&
            'Harap tunggu sebentar, jangan refresh atau tutup halaman ini.'}
          {status === 'success' &&
            'Terima kasih telah mengikuti tahapan seleksi tes online PT Multi Indomandiri (WINGS Group). Jawaban Anda telah berhasil tersimpan dan akan diproses oleh tim Rekrutmen.'}
          {status === 'disqualified' &&
            'Anda terdeteksi melanggar aturan pengawasan proctoring sebanyak 3 kali. Sesi ujian dihentikan dan catatan pelanggaran telah direkam ke sistem PT MIM.'}
          {status === 'error' &&
            `Koneksi internet bermasalah saat mengirim jawaban (percobaan ke-${retryCount}). Seluruh jawaban Anda tetap AMAN tersimpan di perangkat. Silakan klik tombol di bawah untuk mencoba mengirim ulang.`}
        </p>

        {/* Action Button */}
        {status === 'error' && (
          <button
            type="button"
            onClick={onRetry}
            className="w-full py-3.5 px-6 bg-[#0056b3] hover:bg-[#003d80] text-white rounded-xl font-bold text-sm sm:text-base transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>🔄 Coba Kirim Ulang</span>
          </button>
        )}

        {status === 'success' && (
          <div className="pt-2 text-xs text-slate-400">
            Anda dapat menutup halaman browser ini dengan aman.
          </div>
        )}
      </div>
    </div>
  );
};
