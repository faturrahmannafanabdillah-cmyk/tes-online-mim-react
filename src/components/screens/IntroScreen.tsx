import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle2, AlertCircle, FileCheck, ShieldAlert, Smartphone, Video, Lock, RotateCcw, X } from 'lucide-react';
import { CandidateInfo } from '../../types';
import { cameraProctoringService } from '../../services/cameraProctoring';
import { apiService } from '../../services/api';

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

  // Modal Camera Proctoring Assistant untuk kandidat gaptek
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraStep, setCameraStep] = useState<'pre_guide' | 'streaming' | 'blocked' | 'error'>('pre_guide');
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const liveVideoRef = useRef<HTMLVideoElement>(null);

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

  const handleOpenLiveCamera = () => {
    if (!agreed) return;
    setIsCameraModalOpen(true);
    setCameraStep('pre_guide');
    setSelfieError(null);
  };

  const handleRequestCameraPermission = async () => {
    setIsStartingCamera(true);
    console.log('[IntroScreen] Meminta akses kamera...');
    const res = await cameraProctoringService.requestCamera();
    setIsStartingCamera(false);

    if (res.success && res.stream) {
      setCameraStep('streaming');
      setTimeout(() => {
        if (liveVideoRef.current && res.stream) {
          liveVideoRef.current.setAttribute('playsinline', 'true');
          liveVideoRef.current.setAttribute('webkit-playsinline', 'true');
          liveVideoRef.current.muted = true;
          liveVideoRef.current.autoplay = true;
          liveVideoRef.current.srcObject = res.stream;
          liveVideoRef.current.play().catch((playErr) => {
            console.warn('[IntroScreen] liveVideoRef.play() warning:', playErr);
          });
        }
      }, 100);
    } else {
      console.warn('[IntroScreen] Gagal membuka kamera:', res);
      // Kirim beacon error ke backend HRD agar tercatat
      apiService.sendCameraErrorBeacon({
        token: token.trim(),
        nama: nama.trim(),
        stageKey: '01_Init_Camera',
        errorType: res.errorType === 'PERMISSION_DENIED' ? 'CAMERA_MISSING_OR_DENIED' : 'CAMERA_BLOCKED_OR_ERROR',
      });

      if (res.errorType === 'PERMISSION_DENIED') {
        setCameraStep('blocked');
      } else {
        setCameraStep('error');
        setSelfieError(res.errorMessage || 'Kamera tidak dapat diakses.');
      }
    }
  };

  const handleSnapFromLiveCamera = () => {
    const snap = cameraProctoringService.captureSnapshot(0.65);
    if (snap && snap !== 'CAMERA_BLOCKED_OR_ERROR') {
      setSelfieDataUrl(snap);
      setIsCameraModalOpen(false);
    } else {
      alert('Gagal mengambil foto. Pastikan wajah terlihat jelas di kamera atau coba izinkan akses kamera.');
    }
  };

  const handleTriggerSelfie = () => {
    handleOpenLiveCamera();
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
      fotoSelfie: selfieDataUrl,
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
                  <div className="absolute bottom-2 left-2 right-2 bg-slate-900/85 text-white text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Wajah & Kamera Terverifikasi</span>
                  </div>
                </div>

                <div className="flex justify-center gap-3 text-center">
                  <button
                    type="button"
                    onClick={handleTriggerSelfie}
                    className="text-xs text-[#0056b3] font-bold underline hover:text-[#003d80] cursor-pointer"
                  >
                    🔄 Ambil Ulang Foto Wajah
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleOpenLiveCamera}
                  disabled={!agreed}
                  className={`w-full py-4 px-4 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 transition shadow-sm touch-manipulation min-h-[52px] ${
                    agreed
                      ? 'bg-[#16a34a] hover:bg-emerald-700 text-white cursor-pointer active:scale-[0.99] shadow-emerald-700/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Camera className="w-5 h-5 shrink-0" />
                  <span>📸 Aktifkan Kamera & Foto Wajah</span>
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!agreed}
                    className="text-[11px] text-slate-400 hover:text-slate-600 underline font-medium cursor-pointer"
                  >
                    Kendala kamera otomatis? Klik di sini untuk unggah foto manual
                  </button>
                </div>
              </div>
            )}

            {selfieError && (
              <div className="mt-3 bg-red-50 border border-red-200 text-[#dc3545] p-3 rounded-lg text-xs leading-relaxed">
                {selfieError}
              </div>
            )}

            <p className="text-[11px] text-slate-400 text-center mt-2.5 leading-normal">
              *Foto dan kamera proctoring digunakan untuk verifikasi kehadiran dan integritas tes oleh HRD PT Multi Indomandiri.
            </p>
          </div>

          {/* Action button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={!isFormComplete || isLoading}
              className={`w-full py-3.5 sm:py-4 px-6 rounded-xl font-extrabold text-base sm:text-lg transition-all shadow-md flex items-center justify-center gap-2 touch-manipulation min-h-[52px] ${
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
                'Ambil Foto Wajah Terlebih Dahulu'
              ) : (
                '🚀 Verifikasi Token & Mulai Ujian'
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ------------------------------------------------------------- */}
      {/* MODAL PANDUAN IZIN KAMERA KHUSUS KANDIDAT GAPTEK */}
      {/* ------------------------------------------------------------- */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative overflow-hidden space-y-4">
            {/* Close modal button */}
            <button
              type="button"
              onClick={() => {
                cameraProctoringService.stopCamera();
                setIsCameraModalOpen(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* STEP 1: PRE-PERMISSION GUIDANCE (PANDUAN SEBELUM POP-UP) */}
            {cameraStep === 'pre_guide' && (
              <div className="text-center space-y-4 pt-2">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-[#16a34a] shadow-inner">
                  <Video className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    Langkah 1: Izinkan Akses Kamera
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Ujian ini menggunakan kamera depan untuk memastikan Anda mengerjakan secara mandiri (anti-joki).
                  </p>
                </div>

                {/* Ilustrasi Pop-up agar kandidat tidak kaget */}
                <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl p-3.5 text-left text-xs text-slate-700 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#0056b3]">
                    <Smartphone className="w-4 h-4 shrink-0" />
                    <span>Petunjuk Mudah:</span>
                  </div>
                  <p className="leading-normal">
                    Setelah tombol hijau di bawah ditekan, layar HP Anda akan menampilkan kotak izin browser. Silakan ketuk tombol:
                  </p>
                  <div className="bg-white border border-slate-300 rounded-lg p-2 text-center font-black text-emerald-600 shadow-sm">
                    [ IZINKAN ] atau [ ALLOW ]
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRequestCameraPermission}
                  disabled={isStartingCamera}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#16a34a] hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 min-h-[48px]"
                >
                  {isStartingCamera ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Membuka Kamera...</span>
                    </>
                  ) : (
                    <span>Saya Siap, Buka Kamera Sekarang 📸</span>
                  )}
                </button>
              </div>
            )}

            {/* STEP 2: LIVE STREAMING & CAPTURE */}
            {cameraStep === 'streaming' && (
              <div className="space-y-4 text-center">
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-[#0056b3] shadow-md aspect-[4/3] flex items-center justify-center">
                  <video
                    ref={liveVideoRef}
                    autoPlay
                    playsInline
                    muted
                    {...({ 'webkit-playsinline': 'true' } as any)}
                    className="w-full h-full object-cover -scale-x-100"
                  />
                  {/* Oval Face Guide Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-44 h-56 border-2 border-dashed border-white/80 rounded-[50%] shadow-lg" />
                  </div>
                  <div className="absolute bottom-2 inset-x-2 bg-slate-900/80 text-white text-[11px] py-1 rounded text-center">
                    Posisikan wajah Anda tepat di dalam bingkai
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSnapFromLiveCamera}
                  className="w-full py-4 px-6 rounded-xl bg-[#0056b3] hover:bg-[#003d80] text-white font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-900/25 cursor-pointer active:scale-95 min-h-[52px]"
                >
                  <Camera className="w-5 h-5" />
                  <span>Jepret Foto Wajah Sekarang 🔘</span>
                </button>
              </div>
            )}

            {/* STEP 3: BLOCKED RESCUE GUIDE (JIKA KANDIDAT KEPENCET TOLAK) */}
            {cameraStep === 'blocked' && (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto text-[#dc3545]">
                  <Lock className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800">
                    Kamera Terblokir di HP Anda
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Jangan khawatir! Ikuti 3 langkah mudah berikut untuk mengizinkan kembali:
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-left text-xs text-slate-700 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#0056b3] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <span>Ketuk ikon <b>Gembok 🔒</b> di pojok kiri atas samping alamat web browser.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#0056b3] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <span>Pilih menu <b>Izin Situs (Permissions)</b> atau <b>Kamera</b>.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#0056b3] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <span>Ubah dari <b>"Blokir"</b> menjadi <b>"Izinkan / Allow"</b>.</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleRequestCameraPermission}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#0056b3] hover:bg-[#003d80] text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Sudah Saya Ubah, Coba Buka Kamera Lagi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCameraModalOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-bold underline"
                  >
                    Atau Unggah Foto Selfie Manual dari Galeri
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: GENERAL ERROR */}
            {cameraStep === 'error' && (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Kamera Tidak Merespons</h3>
                  <p className="text-xs text-slate-500 mt-1">{selfieError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCameraModalOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#0056b3] text-white text-xs font-bold"
                >
                  Gunakan Pengambilan Foto Manual
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
