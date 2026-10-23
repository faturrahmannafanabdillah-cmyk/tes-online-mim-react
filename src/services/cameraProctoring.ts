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
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
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

      // Buat elemen video offscreen agar siap dijepret kapan saja
      if (!this.offscreenVideo) {
        this.offscreenVideo = document.createElement('video');
        this.offscreenVideo.setAttribute('playsinline', 'true');
        this.offscreenVideo.setAttribute('muted', 'true');
        this.offscreenVideo.muted = true;
      }
      this.offscreenVideo.srcObject = stream;
      await this.offscreenVideo.play().catch(() => {});

      return { success: true, stream };
    } catch (err: any) {
      console.warn('Izin kamera gagal/ditolak:', err);
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
   */
  captureSnapshot(quality: number = 0.5): string | null {
    if (!this.activeStream && !this.offscreenVideo) return null;

    try {
      const video = this.offscreenVideo;
      if (!video || video.readyState < 2) return null;

      if (!this.offscreenCanvas) {
        this.offscreenCanvas = document.createElement('canvas');
      }

      const canvas = this.offscreenCanvas;
      const targetWidth = video.videoWidth > 0 ? Math.min(320, video.videoWidth) : 320;
      const targetHeight = video.videoHeight > 0 ? Math.min(240, video.videoHeight) : 240;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

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

      return canvas.toDataURL('image/jpeg', quality);
    } catch (e) {
      console.warn('Gagal capture snapshot proctoring:', e);
      return null;
    }
  }

  /**
   * Mematikan kamera agar hemat baterai saat ujian berakhir.
   */
  stopCamera() {
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
