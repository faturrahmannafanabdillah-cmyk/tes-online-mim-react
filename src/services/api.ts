import { CandidateAnswers, QuestionItem, ArmyAlphaQuestion, RACQuestionItem } from '../types';
import {
  DEFAULT_POSITIONS,
  DEFAULT_ALPHA_QUESTIONS,
  PAKET_MATEMATIKA_A,
  PAKET_MATEMATIKA_B,
  PAKET_MATEMATIKA_C,
  DEFAULT_RAC_QUESTIONS
} from '../data/mockData';

export const DIRECT_GAS_URL =
  (import.meta as any).env?.VITE_GAS_API_URL ||
  "https://script.google.com/macros/s/AKfycbxQ-htHTxGtxF3849RFvXAqIkxhjDoglCmq3SccSyAH9oKhboaWZm4Pd0uZxQhDW_tf/exec";

// Proxy endpoint lokal (bebas dari pemblokiran CORS & iframe sandbox)
export const GAS_API_URL = "/api/gas";

/**
 * FEATURE FLAG PROCTORING DRIVE UPLOAD:
 * Saat 'false': Mode Visual/Gimmick aktif (Kamera & Selfie preview tetap tampil di UI kandidat,
 * tetapi tidak mengunggah file foto ke Google Drive agar sistem 100% cepat & bebas hambatan di HP).
 * Ubah ke 'true' sewaktu-waktu jika ingin mengaktifkan kembali upload foto riil ke Drive.
 */
export const ENABLE_PROCTORING_DRIVE_UPLOAD = false;

export interface InitResponse {
  posisi: string[];
}

export interface VerifyResponse {
  error?: string;
  alpha?: ArmyAlphaQuestion[];
  matematika?: QuestionItem[];
  paketMatematika?: string;
  rac?: RACQuestionItem[];
  message?: string;
}

export const apiService = {
  /**
   * Fetch available recruitment positions from GAS Web App
   */
  async fetchPositions(): Promise<string[]> {
    const endpoints = [`${GAS_API_URL}?action=init`, `${DIRECT_GAS_URL}?action=init`];
    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data: InitResponse = await res.json();
          if (data && Array.isArray(data.posisi) && data.posisi.length > 0) {
            return data.posisi;
          }
        }
      } catch (err) {
        // Fallback to next endpoint
      }
    }
    return DEFAULT_POSITIONS;
  },

  /**
   * Check status of a previously used token
   */
  async checkTokenStatus(token: string): Promise<{ status?: string; error?: string }> {
    const endpoints = [
      `${GAS_API_URL}?action=cekToken&token=${encodeURIComponent(token)}`,
      `${DIRECT_GAS_URL}?action=cekToken&token=${encodeURIComponent(token)}`,
    ];
    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        // Fallback to next endpoint
      }
    }
    return { status: 'SEDANG DIKERJAKAN' };
  },

  /**
   * Pick random package among Paket A, B, C for Matematika Dasar
   */
  getRandomMatematikaPack(): { namaPaket: string; soal: QuestionItem[] } {
    const packs = [
      { namaPaket: 'Paket A', soal: PAKET_MATEMATIKA_A },
      { namaPaket: 'Paket B', soal: PAKET_MATEMATIKA_B },
      { namaPaket: 'Paket C', soal: PAKET_MATEMATIKA_C },
    ];
    const randomIndex = Math.floor(Math.random() * packs.length);
    return packs[randomIndex];
  },

  /**
   * Fetch dynamic questions for Matematika Dasar (MatDas) from Google Apps Script
   */
  /**
   * Fetch dynamic questions for Matematika Dasar (MatDas) from Google Apps Script
   */
  async fetchMatDasQuestions(paket?: string): Promise<{
    paketList: string[];
    paketTerpilih: string;
    questions: QuestionItem[];
  }> {
    const query = paket ? `&paket=${encodeURIComponent(paket)}` : '';
    const endpoints = [
      `${GAS_API_URL}?action=getSoalMatDas${query}`,
      `${DIRECT_GAS_URL}?action=getSoalMatDas${query}`,
    ];

    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) continue;
        const rawData = await res.json();

        let items: any[] = [];
        let paketTerpilih = paket || 'Paket A';
        let paketList: string[] = [];

        if (Array.isArray(rawData)) {
          items = rawData;
        } else if (rawData && Array.isArray(rawData.soal)) {
          items = rawData.soal;
          paketTerpilih = rawData.paketTerpilih || paketTerpilih;
          paketList = rawData.paketTersedia || [];
        } else if (rawData && Array.isArray(rawData.data)) {
          items = rawData.data;
          paketTerpilih = rawData.paketTerpilih || paketTerpilih;
          paketList = rawData.paketTersedia || [];
        }

        if (items.length > 0) {
          if (paketList.length === 0) {
            const pSet = new Set<string>();
            items.forEach((it) => {
              if (it.paket) pSet.add(it.paket);
            });
            paketList = Array.from(pSet);
          }

          if (paketList.length > 0 && (!paket || !items.every((it) => it.paket === paket))) {
            if (!paket) {
              paketTerpilih = paketList[Math.floor(Math.random() * paketList.length)];
            }
            items = items.filter((it) => !it.paket || it.paket === paketTerpilih);
          }

          const formattedQuestions: QuestionItem[] = items.map((it, idx) => ({
            id: it.id || `MTK_${idx + 1}`,
            soal: it.soal || `Soal ${idx + 1}`,
            opsi: Array.isArray(it.opsi) ? it.opsi : [],
            kategori: it.paket || paketTerpilih,
          }));

          if (formattedQuestions.length > 0) {
            return {
              paketList: paketList.length > 0 ? paketList : ['Paket A', 'Paket B', 'Paket C'],
              paketTerpilih,
              questions: formattedQuestions,
            };
          }
        }
      } catch (err) {
        // Try next endpoint
      }
    }

    const fallback = this.getRandomMatematikaPack();
    return {
      paketList: ['Paket A', 'Paket B', 'Paket C'],
      paketTerpilih: fallback.namaPaket,
      questions: fallback.soal,
    };
  },

  /**
   * Verify token, candidate info, and initialize 3-stage test questions
   */
  async verifyCandidate(params: {
    token: string;
    nama: string;
    email: string;
    posisi: string;
    deviceId: string;
  }): Promise<VerifyResponse> {
    const randomPack = this.getRandomMatematikaPack();
    const payload = JSON.stringify({
      action: 'verifikasi',
      token: params.token,
      nama: params.nama,
      email: params.email,
      posisi: params.posisi,
      deviceId: params.deviceId,
    });

    const endpoints = [GAS_API_URL, DIRECT_GAS_URL];
    for (const url of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: payload,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.error) {
            return data;
          }
          const backendMatematika = data.matematika || null;
          return {
            alpha: DEFAULT_ALPHA_QUESTIONS,
            matematika: backendMatematika && backendMatematika.length > 0 ? backendMatematika : randomPack.soal,
            paketMatematika: data.paketMatematika || randomPack.namaPaket,
            rac: DEFAULT_RAC_QUESTIONS,
          };
        }
      } catch (err) {
        // Continue to fallback endpoint
      }
    }

    if (params.token.trim().length < 3) {
      return { error: 'Token tidak valid. Pastikan format token benar (contoh: MIM-TEST-001).' };
    }
    return {
      alpha: DEFAULT_ALPHA_QUESTIONS,
      matematika: randomPack.soal,
      paketMatematika: randomPack.namaPaket,
      rac: DEFAULT_RAC_QUESTIONS,
    };
  },

  /**
   * Mengirim sinyal error kamera ("CAMERA_MISSING_OR_DENIED") ke backend secara tak-terblokir.
   * Menggunakan navigator.sendBeacon agar kebal dari pemblokiran navigasi pindah layar atau unmount.
   */
  sendCameraErrorBeacon(params: {
    token: string;
    nama: string;
    errorType?: string;
    stageKey?: string;
  }): void {
    if (!ENABLE_PROCTORING_DRIVE_UPLOAD) {
      console.log('[PROCTORING] Mode Visual aktif: pengiriman beacon error ke Drive dilewati.');
      return;
    }

    const errorString = params.errorType || 'CAMERA_MISSING_OR_DENIED';
    const stage = params.stageKey || '01_Init_Camera';
    console.log('[PROCTORING-BEACON] Mengirim laporan error kamera ke backend:', {
      token: params.token,
      nama: params.nama,
      stageKey: stage,
      errorType: errorString,
    });

    try {
      const payloadStr = JSON.stringify({
        action: 'uploadSnapshot',
        token: params.token || 'NO_TOKEN',
        nama: params.nama || 'Kandidat',
        stageKey: stage,
        fotoBase64: errorString,
        timestamp: new Date().toISOString(),
      });

      // 1. Prioritaskan navigator.sendBeacon (kebal dari unmount & freeze)
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([payloadStr], { type: 'text/plain;charset=utf-8' });
        const beaconSent = navigator.sendBeacon(DIRECT_GAS_URL, blob);
        console.log(`[PROCTORING-BEACON] Pengiriman ${stage} via navigator.sendBeacon sukses:`, beaconSent);
        if (beaconSent) return;
      }

      // 2. Cadangan: fetch dengan keepalive: true
      fetch(DIRECT_GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: payloadStr,
        keepalive: true,
      })
        .then(() => {
          console.log(`[PROCTORING-BEACON] Selesai dikirim via fetch keepalive untuk ${stage}`);
        })
        .catch((err) => {
          console.warn(`[PROCTORING-BEACON] Gagal kirim beacon error untuk ${stage}:`, err);
        });
    } catch (err) {
      console.warn(`[PROCTORING-BEACON] Exception saat inisiasi beacon error untuk ${stage}:`, err);
    }
  },

  /**
   * Fire-and-forget asynchronous background upload for proctoring snapshot.
   * Dilengkapi navigator.sendBeacon dan fetch keepalive, kebal dari pemblokiran transisi/unmount.
   */
  uploadSnapshotAsync(params: {
    token: string;
    nama: string;
    stageKey: string;
    fotoBase64: string;
  }): void {
    if (!ENABLE_PROCTORING_DRIVE_UPLOAD) {
      console.log(`[PROCTORING] Mode Visual aktif: upload foto ${params.stageKey} ke Drive dilewati.`);
      return;
    }

    const isErrorPayload = !params.fotoBase64 || !params.fotoBase64.startsWith('data:');
    console.log('[PROCTORING-UPLOAD] Memulai pengiriman proctoring snapshot:', {
      stageKey: params.stageKey,
      token: params.token,
      nama: params.nama,
      isErrorPayload,
      dataLength: params.fotoBase64 ? params.fotoBase64.length : 0,
    });

    try {
      const token = params.token || localStorage.getItem('mim_saved_token') || 'NO_TOKEN';
      const nama = params.nama || localStorage.getItem('mim_saved_nama') || 'Kandidat';
      const payloadStr = JSON.stringify({
        action: 'uploadSnapshot',
        token,
        nama,
        stageKey: params.stageKey,
        fotoBase64: params.fotoBase64 || 'CAMERA_BLOCKED_OR_ERROR',
        timestamp: new Date().toISOString(),
      });

      // JIKA payload adalah string error ("CAMERA_BLOCKED_OR_ERROR") ATAU browser mendukung sendBeacon untuk ukuran hemat
      if (isErrorPayload && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([payloadStr], { type: 'text/plain;charset=utf-8' });
        const beaconSuccess = navigator.sendBeacon(DIRECT_GAS_URL, blob);
        console.log(`[PROCTORING-UPLOAD] Error payload ${params.stageKey} berhasil dikirim via navigator.sendBeacon:`, beaconSuccess);
        if (beaconSuccess) return;
      }

      // 1. Prioritas Utama: Kirim via proxy /api/gas secara background
      fetch(GAS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: payloadStr,
        keepalive: true,
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json().catch(() => null);
            console.log(`[PROCTORING-UPLOAD-RES] Respons backend ${params.stageKey} (via Proxy):`, data);
          } else {
            console.warn(`[PROCTORING-UPLOAD-RES] Proxy HTTP status ${res.status} untuk ${params.stageKey}`);
          }
        })
        .catch((proxyErr) => {
          console.warn(`[PROCTORING-UPLOAD] Proxy gagal untuk ${params.stageKey}, mengalihkan ke jalur Direct:`, proxyErr);

          // 2. Cadangan: Coba navigator.sendBeacon jika ukuran < 64KB
          if (typeof navigator !== 'undefined' && navigator.sendBeacon && params.fotoBase64 && params.fotoBase64.length < 60000) {
            const blob = new Blob([payloadStr], { type: 'text/plain;charset=utf-8' });
            const directBeaconOk = navigator.sendBeacon(DIRECT_GAS_URL, blob);
            console.log(`[PROCTORING-UPLOAD] Fallback sendBeacon untuk ${params.stageKey}:`, directBeaconOk);
            if (directBeaconOk) return;
          }

          // 3. Cadangan Terakhir: Direct GAS URL dengan mode no-cors
          fetch(DIRECT_GAS_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8',
            },
            body: payloadStr,
            keepalive: true,
          })
            .then(() => {
              console.log(`[PROCTORING-UPLOAD] Selesai dikirim via direct GAS no-cors untuk ${params.stageKey}`);
            })
            .catch((directErr) => {
              console.error(`[PROCTORING-UPLOAD] Semua jalur upload gagal untuk ${params.stageKey}:`, directErr);
            });
        });
    } catch (err) {
      console.error(`[PROCTORING-UPLOAD] Exception saat inisiasi upload untuk ${params.stageKey}:`, err);
    }
  },

  /**
   * Submit candidate 3-stage exam answers and proctoring logs.
   * Dilengkapi multi-tier failover: Proxy -> Direct GAS -> No-CORS backup.
   */
  async submitExam(candidateAnswers: CandidateAnswers): Promise<{ success: boolean; message?: string }> {
    const payload = JSON.stringify({
      action: 'simpanHasil',
      dataKandidat: candidateAnswers,
    });

    // Jalur 1: Kirim via server proxy /api/gas (Bebas CORS, iframe sandbox, & redirect block)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const res = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: payload,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.error) {
          throw new Error(data.error);
        }
        return { success: true, message: data?.status || data?.message || 'Data berhasil disimpan.' };
      }
    } catch (proxyErr: any) {
      console.warn('Proxy submit gagal, beralih ke direct GAS URL:', proxyErr?.message || proxyErr);
    }

    // Jalur 2: Kirim langsung ke Google Apps Script URL
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const res = await fetch(DIRECT_GAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: payload,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.error) {
          throw new Error(data.error);
        }
        return { success: true, message: data?.status || data?.message || 'Data berhasil disimpan.' };
      }
    } catch (directErr: any) {
      console.warn('Direct submit gagal, menggunakan no-cors failover:', directErr?.message || directErr);
    }

    // Jalur 3: Failover no-cors (memastikan payload tetap terkirim ke Google Sheets meskipun browser/iframe memblokir CORS response)
    try {
      await fetch(DIRECT_GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: payload,
      });
      return { success: true, message: 'Data berhasil dikirim ke server.' };
    } catch (finalErr) {
      console.error('Semua jalur pengiriman ujian gagal:', finalErr);
      throw finalErr;
    }
  },
};

