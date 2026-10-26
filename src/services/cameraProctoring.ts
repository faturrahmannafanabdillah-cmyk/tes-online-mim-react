/**
 * Service Proctoring Kamera Ramah HP Kentang & Hemat Baterai
 * Resolusi: 320x240 px, Frame-rate minimal (5 fps), Kompresi JPEG 50% (~15-25 KB).
 */

class CameraProctoringService {
  private activeStream: MediaStream | null = null;
  private offscreenVideo: HTMLVideoElement | null = null;
  private offscreenCanvas: HTMLCanvasElement | null = null;

  /**
   * Meminta izin dan mengaktifkan stream kamera depan dengan resolusi hemat memori.
   */
  async requestCamera(): Promise<{ success: boolean; stream?: MediaStream; errorType?: string; errorMessage?: string }> {
    console.log('[PROCTORING-CAMERA] Meminta akses kamera depan (resolusi hemat mobile)...');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('[PROCTORING-CAMERA] API getUserMedia tidak didukung pada browser ini.');
        return {
          success: false,
          errorType: 'UNSUPPORTED',
          errorMessage: 'Browser ini tidak mendukung akses kamera langsung. Mohon gunakan Google Chrome atau Safari.',
        };
      }

      // Hentikan stream lama jika ada
      this.stopCamera();

      // Constraint hemat baterai & RAM untuk HP entry-level
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: 320, max: 640 },
          height: { ideal: 240, max: 480 },
          frameRate: { ideal: 5, max: 15 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.activeStream = stream;
      const videoTracks = stream.getVideoTracks();
      console.log('[PROCTORING-CAMERA] Stream kamera berhasil didapatkan:', {
        id: stream.id,
        tracksCount: videoTracks.length,
        trackLabel: videoTracks[0]?.label,
        trackSettings: videoTracks[0]?.getSettings(),
      });

      // 1. ELEMEN VIDEO EKSPLISIT: playsinline, autoplay, muted agar OS mobile tidak membekukannya
      if (!this.offscreenVideo) {
        this.offscreenVideo = document.createElement('video');
        this.offscreenVideo.setAttribute('playsinline', 'true');
        this.offscreenVideo.setAttribute('webkit-playsinline', 'true');
        this.offscreenVideo.setAttribute('autoplay', 'true');
        this.offscreenVideo.setAttribute('muted', 'true');
        this.offscreenVideo.playsInline = true;
        this.offscreenVideo.autoplay = true;
        this.offscreenVideo.muted = true;

        // Lampirkan ke DOM (tersembunyi) agar decoder iOS/Android tidak menonaktifkan rendering pipeline
        this.offscreenVideo.style.position = 'fixed';
        this.offscreenVideo.style.width = '1px';
        this.offscreenVideo.style.height = '1px';
        this.offscreenVideo.style.opacity = '0.001';
        this.offscreenVideo.style.pointerEvents = 'none';
        this.offscreenVideo.style.zIndex = '-99999';
        this.offscreenVideo.style.top = '0';
        this.offscreenVideo.style.left = '0';
        if (typeof document !== 'undefined' && document.body) {
          document.body.appendChild(this.offscreenVideo);
        }
      }

      this.offscreenVideo.srcObject = stream;
      await this.offscreenVideo.play().catch((playErr) => {
        console.warn('[PROCTORING-CAMERA] Autoplay promise caught (akan diputar ulang saat capture):', playErr);
      });
      console.log('[PROCTORING-CAMERA] Elemen video siap, readyState:', this.offscreenVideo.readyState);

      return { success: true, stream };
    } catch (err: any) {
      console.error('[PROCTORING-CAMERA] getUserMedia gagal atau ditolak:', err);
      let errorType = 'UNKNOWN';
      let errorMessage = 'Gagal mengakses kamera depan.';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorType = 'PERMISSION_DENIED';
        errorMessage = 'Izin kamera ditolak oleh pengguna.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorType = 'NO_CAMERA';
        errorMessage = 'Kamera depan tidak ditemukan pada perangkat ini.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorType = 'CAMERA_BUSY';
        errorMessage = 'Kamera sedang digunakan oleh aplikasi lain (seperti WhatsApp atau Zoom).';
      }

      return { success: false, errorType, errorMessage };
    }
  }

  /**
   * Mengambil satu foto snapshot (resolusi 320x240, JPEG kualitas hemat ~15-25 KB).
   * GRACEFUL FALLBACK (KHUSUS IOS/SAFARI):
   * Jika stream terputus, mati, atau permission dicabut oleh OS saat transisi,
   * tangkap semua error tanpa alert atau crash, dan return "CAMERA_BLOCKED_OR_ERROR".
   */
  captureSnapshot(quality: number = 0.5): string {
    console.log('[PROCTORING-SNAP] Memulai pengambilan snapshot proctoring...');
    try {
      if (!this.activeStream || !this.offscreenVideo) {
        console.warn('[PROCTORING-SNAP] activeStream atau offscreenVideo null, fallback ke CAMERA_BLOCKED_OR_ERROR');
        return 'CAMERA_BLOCKED_OR_ERROR';
      }

      // Validasi liveness video tracks (mendeteksi jika iOS mematikan background track)
      const tracks = this.activeStream.getVideoTracks();
      if (!tracks || tracks.length === 0) {
        console.warn('[PROCTORING-SNAP] Tidak ada video track ditemukan.');
        return 'CAMERA_BLOCKED_OR_ERROR';
      }

      const track = tracks[0];
      if (track.readyState === 'ended') {
        console.warn('[PROCTORING-SNAP] Track state sudah ENDED (kamera dimatikan oleh sistem operasi mobile).');
        return 'CAMERA_BLOCKED_OR_ERROR';
      }

      const video = this.offscreenVideo;

      // Pada iOS Safari, elemen video terkadang ter-pause saat app backgrounding
      if (video.paused) {
        console.log('[PROCTORING-SNAP] Elemen video dalam kondisi paused, mencoba memutar ulang...');
        video.play().catch(() => {});
      }

      // Validasi readyState video (HAVE_CURRENT_DATA = 2)
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        console.warn('[PROCTORING-SNAP] Video belum siap dirender (readyState:', video.readyState, ', dimensi:', video.videoWidth, 'x', video.videoHeight, ')');
        return 'CAMERA_BLOCKED_OR_ERROR';
      }

      if (!this.offscreenCanvas) {
        this.offscreenCanvas = document.createElement('canvas');
      }

      const canvas = this.offscreenCanvas;
      const targetWidth = video.videoWidth > 0 ? Math.min(320, video.videoWidth) : 320;
      const targetHeight = video.videoHeight > 0 ? Math.min(240, video.videoHeight) : 240;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.warn('[PROCTORING-SNAP] Context 2D canvas tidak tersedia.');
        return 'CAMERA_BLOCKED_OR_ERROR';
      }

      // Balik horizontal (mirror) agar tampak alami seperti cermin kamera depan
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Tambahkan timestamp teks kecil di pojok foto untuk validasi forensik HRD
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, canvas.height - 18, canvas.width, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      const timeStr = new Date().toLocaleTimeString('id-ID');
      ctx.fillText(`PT MIM Proctoring • ${timeStr}`, 6, canvas.height - 5);

      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      if (!dataUrl || !dataUrl.startsWith('data:image/')) {
        console.warn('[PROCTORING-SNAP] toDataURL gagal menghasilkan Base64 JPEG valid.');
        return 'CAMERA_BLOCKED_OR_ERROR';
      }

      console.log('[PROCTORING-SNAP] Foto proctoring berhasil diambil! Ukuran karakter Base64:', dataUrl.length);
      return dataUrl;
    } catch (e) {
      console.error('[PROCTORING-SNAP] Exception saat pengambilan foto:', e);
      return 'CAMERA_BLOCKED_OR_ERROR';
    }
  }

  /**
   * Mematikan kamera agar hemat baterai saat ujian berakhir.
   */
  stopCamera() {
    console.log('[PROCTORING-CAMERA] Mematikan stream kamera proctoring.');
    if (this.activeStream) {
      this.activeStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      this.activeStream = null;
    }
    if (this.offscreenVideo) {
      this.offscreenVideo.srcObject = null;
      if (this.offscreenVideo.parentNode) {
        this.offscreenVideo.parentNode.removeChild(this.offscreenVideo);
      }
      this.offscreenVideo = null;
    }
  }

  isActive(): boolean {
    return !!this.activeStream && this.activeStream.active;
  }

  getStream(): MediaStream | null {
    return this.activeStream;
  }
}

export const cameraProctoringService = new CameraProctoringService();
