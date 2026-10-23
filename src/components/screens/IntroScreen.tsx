import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle2, AlertCircle, FileCheck, ShieldAlert, Sparkles, Smartphone } from 'lucide-react';
import { CandidateInfo } from '../../types';

interface IntroScreenProps {
  positions: string[];
  initialToken?: string;
  isWebView: boolean;
  isStorageSupported: boolean;
  onStartExam: (candidateData: CandidateInfo) => void;
  isLoading: boolean;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({
  positions,
  initialToken = '',
  isWebView,
  isStorageSupported,
  onStartExam,
  isLoading,
}) => {
  const [agreed, setAgreed] = useState(false);
  const [token, setToken] = useState(initialToken);
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [posisi, setPosisi] = useState('');
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [selfieError, setSelfieError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialToken && !token) {
      setToken(initialToken.toUpperCase().replace(/[^A-Z0-9-]/g, ''));
    }
  }, [initialToken]);

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    setToken(clean);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Gagal membaca file foto.'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Gagal memproses gambar foto.'));
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 720;
            const scale = Math.min(1, MAX_WIDTH / img.width);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Canvas context tidak tersedia'));
              return;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
            resolve(dataUrl);
          } catch (err) {
            reject(err);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSelfieChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelfieError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 15 * 1024 * 1024) {
      setSelfieError('⚠️ Ukuran foto terlalu besar. Coba ambil ulang dengan resolusi lebih rendah.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setIsCompressing(true);
      const compressed = await compressImage(file);
      setSelfieDataUrl(compressed);
    } catch (err: any) {
      setSelfieError('❌ Gagal memproses foto. Pastikan memori browser mencukupi atau coba browser Google Chrome.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleTriggerSelfie = () => {
    if (!agreed) return;
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;

    if (!token.trim() || !nama.trim() || !email.trim() || !posisi) {
      alert('Harap lengkapi semua data diri dan token ujian!');
      return;
    }

    if (!selfieDataUrl) {
      alert('Wajib mengambil foto selfie verifikasi wajah sebelum memulai ujian!');
      return;
    }

    onStartExam({
      token: token.trim(),
      nama: nama.trim(),
      email: email.trim(),
      posisi,
      fotoBase64: selfieDataUrl,
    });
  };

  const isFormComplete = agreed && token.trim() && nama.trim() && email.trim() && posisi && selfieDataUrl;

  return (
    <div className="max-w-[820px] mx-auto py-6 px-4 animate-fade-in space-y-5">
      {/* Persyaratan Teknis Banner */}
      <div className="bg-[#fffbeb] border border-[#fde68a] rounded-xl p-4 text-xs sm:text-sm text-[#92400e] leading-relaxed flex items-start gap-3 shadow-sm">
        <Smartphone className="w-5 h-5 text-[#b45309] shrink-0 mt-0.5" />
        <div>
          <b>📱 Persyaratan Teknis:</b> Buka link ini menggunakan <b>Google Chrome</b>. Pastikan <b>memori HP tidak penuh</b> (minimal 500MB kosong). Matikan aplikasi lain yang berjalan di background agar ujian lancar tanpa kendala reload.
        </div>
      </div>

      {/* Warnings */}
      {isWebView && (
        <div className="bg-red-50 border-l-4 border-[#dc3545] p-4 rounded-xl text-xs sm:text-sm text-[#dc3545] flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm mb-1">⚠️ Terdeteksi Browser Dalam Aplikasi</h4>
            <p>Anda membuka link dari aplikasi (WhatsApp / Instagram / dsb). <b>Disarankan buka link ini langsung di aplikasi Google Chrome browser</b>.</p>
          </div>
        </div>
      )}

      {!isStorageSupported && (
        <div className="bg-amber-50 border-l-4 border-[#f59e0b] p-4 rounded-xl text-xs sm:text-sm text-amber-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm mb-1">⚠️ Mode Penyimpanan Terbatas</h4>
            <p>Penyimpanan sesi lokal tidak aktif. Disarankan keluar dari mode Incognito/Private agar progres jawaban tersimpan aman.</p>
          </div>
        </div>
      )}

      {/* Rules Card */}
      <div className="bg-white rounded-xl p-5 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.07)] border border-slate-200 border-l-4 border-l-[#f59e0b]">
        <h2 className="text-[#0056b3] text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-[#0056b3]" />
          Tata Tertib & Aturan Ujian PT Multi Indomandiri
        </h2>

        <div className="bg-[#f8fafc] border border-dashed border-slate-300 rounded-lg p-4 sm:p-5 text-xs sm:text-sm text-slate-700 leading-relaxed mb-5 space-y-3">
          <div>
            <h4 className="font-bold text-[#0056b3] mb-1">1. Aturan Umum Pelaksanaan</h4>
            <p>Kerjakan ujian ini secara mandiri, jujur, dan tanpa bantuan orang lain maupun alat pencari eksternal.</p>
          </div>
          <div>
            <h4 className="font-bold text-[#0056b3] mb-1">2. Sistem Pengawasan & Proctoring Aktif</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Token Ujian bersifat <b>Sekali Pakai (Single-use)</b>.</li>
              <li>Verifikasi Wajah (Selfie) wajib dilakukan sebelum memulai.</li>
              <li><b>Dilarang keras me-refresh atau menutup halaman</b> selama ujian berjalan.</li>
              <li>Terdeteksi beralih tab / membuka aplikasi lain sebanyak <b>3 kali</b> akan mengakibatkan <b>OTOMATIS DISKUALIFIKASI</b>.</li>
            </ul>
          </div>
        </div>

        {/* Checkbox agreement */}
        <label className="flex items-center gap-3.5 cursor-pointer bg-[#fff5f5] border-[1.5px] border-[#fca5a5] rounded-xl p-4 text-xs sm:text-sm font-bold text-[#dc3545] select-none hover:bg-red-50 transition-colors">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-5 h-5 rounded border-red-300 text-[#dc3545] focus:ring-red-400 accent-[#dc3545] cursor-pointer shrink-0"
          />
          <span>SAYA TELAH MEMBACA DAN MENYETUJUI SEMUA ATURAN DI ATAS.</span>
        </label>
      </div>

      {/* Candidate Data & Selfie Card */}
      <form
        onSubmit={handleSubmit}
        className={`bg-white rounded-xl p-5 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.07)] border border-slate-200 transition-all duration-300 ${
          agreed ? 'opacity-100 pointer-events-auto' : 'opacity-40 pointer-events-none'
        }`}
      >
        <h3 className="font-bold text-base sm:text-lg text-slate-800 mb-1">
          Data Diri & Verifikasi Wajah Kandidat
        </h3>
        <p className="text-xs text-[#dc3545] mb-5 font-medium flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          Pastikan koneksi internet stabil sebelum menekan tombol mulai ujian.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Token Ujian <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={token}
              onChange={handleTokenChange}
              disabled={!agreed}
              inputMode="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck="false"
              placeholder="Contoh: MIM-XXXX-XXXX"
              className="w-full px-3.5 py-2.5 sm:py-3 border-[1.5px] border-slate-300 rounded-lg text-sm sm:text-base font-mono font-bold tracking-wider uppercase focus:outline-none focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/20 disabled:bg-slate-100 disabled:text-slate-400 transition min-h-[46px]"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Token diberikan oleh tim Rekrutmen PT MIM melalui email/undangan.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Nama Lengkap (Sesuai KTP) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              disabled={!agreed}
              inputMode="text"
              autoCapitalize="words"
              autoCorrect="off"
              spellCheck="false"
              placeholder="Masukkan nama lengkap Anda"
              className="w-full px-3.5 py-2.5 sm:py-3 border-[1.5px] border-slate-300 rounded-lg text-sm sm:text-base focus:outline-none focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/20 disabled:bg-slate-100 transition min-h-[46px]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Alamat Email Aktif <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!agreed}
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              placeholder="contoh: nama.kandidat@gmail.com"
              className="w-full px-3.5 py-2.5 sm:py-3 border-[1.5px] border-slate-300 rounded-lg text-sm sm:text-base focus:outline-none focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/20 disabled:bg-slate-100 transition min-h-[46px]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Posisi Yang Dilamar <span className="text-red-500">*</span>
            </label>
            <select
              value={posisi}
              onChange={(e) => setPosisi(e.target.value)}
              disabled={!agreed}
              className="w-full px-3.5 py-2.5 sm:py-3 border-[1.5px] border-slate-300 rounded-lg text-sm sm:text-base focus:outline-none focus:border-[#0056b3] focus:ring-2 focus:ring-[#0056b3]/20 disabled:bg-slate-100 bg-white transition cursor-pointer"
              required
            >
              <option value="">-- Pilih Posisi --</option>
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          {/* Selfie Section */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              Verifikasi Wajah / Foto Selfie (Wajib) <span className="text-red-500">*</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="user"
              onChange={handleSelfieChange}
              disabled={!agreed}
              className="hidden"
            />

            {selfieDataUrl ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border-2 border-[#16a34a] max-w-sm mx-auto shadow-sm">
                  <img
                    src={selfieDataUrl}
                    alt="Preview Selfie Kandidat"
                    className="w-full h-48 sm:h-56 object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 text-white text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Wajah Terverifikasi untuk Proctoring
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleTriggerSelfie}
                    className="text-xs text-[#0056b3] font-semibold underline hover:text-[#003d80]"
                  >
                    Ambil Ulang Foto Selfie
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleTriggerSelfie}
                disabled={!agreed || isCompressing}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition shadow-sm ${
                  agreed
                    ? 'bg-[#16a34a] hover:bg-emerald-700 text-white cursor-pointer active:scale-[0.99]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Camera className="w-5 h-5" />
                {isCompressing ? '⏳ Mengompresi Foto...' : '📸 Ambil Foto Selfie (Kamera / Unggah)'}
              </button>
            )}

            {selfieError && (
              <div className="mt-3 bg-red-50 border border-red-200 text-[#dc3545] p-3 rounded-lg text-xs leading-relaxed">
                {selfieError}
              </div>
            )}

            <p className="text-[11px] text-slate-400 text-center mt-2.5 leading-normal">
              *Foto digunakan oleh HRD PT Multi Indomandiri sebagai validasi kehadiran peserta tes proctoring.
            </p>
          </div>

          {/* Action button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={!isFormComplete || isLoading}
              className={`w-full py-3.5 sm:py-4 px-6 rounded-xl font-extrabold text-base sm:text-lg transition-all shadow-md flex items-center justify-center gap-2 ${
                isFormComplete && !isLoading
                  ? 'bg-[#0056b3] hover:bg-[#003d80] text-white cursor-pointer shadow-[#0056b3]/25 hover:shadow-lg active:scale-[0.99]'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Token ke Server...</span>
                </>
              ) : !selfieDataUrl ? (
                'Ambil Foto Selfie Terlebih Dahulu'
              ) : (
                '🚀 Verifikasi Token & Mulai Ujian'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
