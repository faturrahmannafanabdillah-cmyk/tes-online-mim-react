import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface ViolationModalProps {
  isOpen: boolean;
  violationCount: number;
  maxViolations?: number;
  source: 'tab' | 'devtools' | 'keys';
  onDismiss: () => void;
  showBanner: boolean;
}

export const ViolationModal: React.FC<ViolationModalProps> = ({
  isOpen,
  violationCount,
  maxViolations = 3,
  source,
  onDismiss,
  showBanner,
}) => {
  const remaining = Math.max(0, maxViolations - violationCount);
  const isDisqualified = violationCount >= maxViolations;

  const getSourceText = () => {
    switch (source) {
      case 'devtools':
        return 'Terdeteksi membuka DevTools (Inspect Element).';
      case 'keys':
        return 'Terdeteksi kombinasi tombol yang dilarang.';
      case 'tab':
      default:
        return 'Anda terdeteksi keluar atau beralih dari layar ujian.';
    }
  };

  return (
    <>
      {/* Violation Top Toast Banner */}
      {showBanner && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-[#dc3545] text-white px-6 py-2.5 rounded-full font-bold text-sm z-[2000] shadow-[0_4px_15px_rgba(220,53,69,0.4)] whitespace-nowrap animate-bounce flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>🚨 PERINGATAN {violationCount}/{maxViolations}</span>
        </div>
      )}

      {/* Blur/Leave Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-[1500] bg-black/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-[0_10px_35px_rgba(0,0,0,0.4)] border border-red-100 animate-fade-in">
            <div className="w-16 h-16 bg-red-100 text-[#dc3545] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-[#dc3545] mb-2">
              {isDisqualified
                ? '🚨 Pelanggaran Batas Maksimum!'
                : `⚠️ Peringatan ${violationCount}/${maxViolations}`}
            </h3>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4">
              {getSourceText()}
            </p>

            {!isDisqualified && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-xs sm:text-sm text-red-700 font-medium">
                Sisa toleransi peringatan: <b>{remaining}x lagi</b> sebelum diskualifikasi otomatis dan jawaban dikunci.
              </div>
            )}

            {!isDisqualified ? (
              <button
                type="button"
                onClick={onDismiss}
                className="w-full py-3 px-6 bg-[#0056b3] hover:bg-[#003d80] text-white rounded-lg font-bold text-base transition-colors shadow-md"
              >
                ↩️ Kembali ke Ujian
              </button>
            ) : (
              <p className="text-xs text-red-500 font-bold uppercase tracking-wider">
                Sistem sedang memproses diskualifikasi...
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};
