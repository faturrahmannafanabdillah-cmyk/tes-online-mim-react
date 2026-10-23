import { CandidateAnswers, QuestionItem, ArmyAlphaQuestion, RACQuestionItem } from '../types';
import {
  DEFAULT_POSITIONS,
  DEFAULT_ALPHA_QUESTIONS,
  PAKET_MATEMATIKA_A,
  PAKET_MATEMATIKA_B,
  PAKET_MATEMATIKA_C,
  DEFAULT_RAC_QUESTIONS
} from '../data/mockData';

export const GAS_API_URL =
  (import.meta as any).env?.VITE_GAS_API_URL ||
  "https://script.google.com/macros/s/AKfycbxQ-htHTxGtxF3849RFvXAqIkxhjDoglCmq3SccSyAH9oKhboaWZm4Pd0uZxQhDW_tf/exec";

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
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${GAS_API_URL}?action=init`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: InitResponse = await res.json();
      if (data && Array.isArray(data.posisi) && data.posisi.length > 0) {
        return data.posisi;
      }
      return DEFAULT_POSITIONS;
    } catch (err) {
      console.warn('GAS fetchPositions fallback:', err);
      return DEFAULT_POSITIONS;
    }
  },

  /**
   * Check status of a previously used token
   */
  async checkTokenStatus(token: string): Promise<{ status?: string; error?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${GAS_API_URL}?action=cekToken&token=${encodeURIComponent(token)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return { status: 'SEDANG DIKERJAKAN' };
    }
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
  async fetchMatDasQuestions(paket?: string): Promise<{
    paketList: string[];
    paketTerpilih: string;
    questions: QuestionItem[];
  }> {
    const query = paket ? `&paket=${encodeURIComponent(paket)}` : '';
    const url = `${GAS_API_URL}?action=getSoalMatDas${query}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
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

        // Filter for active package
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

      // Fallback if empty sheet
      const fallback = this.getRandomMatematikaPack();
      return {
        paketList: ['Paket A', 'Paket B', 'Paket C'],
        paketTerpilih: fallback.namaPaket,
        questions: fallback.soal,
      };
    } catch (err) {
      console.warn('Fetch MatDas questions fallback:', err);
      const fallback = this.getRandomMatematikaPack();
      return {
        paketList: ['Paket A', 'Paket B', 'Paket C'],
        paketTerpilih: fallback.namaPaket,
        questions: fallback.soal,
      };
    }
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

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'verifikasi',
          token: params.token,
          nama: params.nama,
          email: params.email,
          posisi: params.posisi,
          deviceId: params.deviceId,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (data.error) {
        return data;
      }

      // If backend returns dynamic matematika questions:
      const backendMatematika = data.matematika || null;

      return {
        alpha: DEFAULT_ALPHA_QUESTIONS,
        matematika: (backendMatematika && backendMatematika.length > 0) ? backendMatematika : randomPack.soal,
        paketMatematika: data.paketMatematika || randomPack.namaPaket,
        rac: DEFAULT_RAC_QUESTIONS,
      };
    } catch (err) {
      console.warn('Verify API request using fallback engine:', err);
      if (params.token.trim().length < 3) {
        return { error: 'Token tidak valid. Pastikan format token benar (contoh: MIM-TEST-001).' };
      }
      return {
        alpha: DEFAULT_ALPHA_QUESTIONS,
        matematika: randomPack.soal,
        paketMatematika: randomPack.namaPaket,
        rac: DEFAULT_RAC_QUESTIONS,
      };
    }
  },

  /**
   * Submit candidate 3-stage exam answers and proctoring logs
   */
  async submitExam(candidateAnswers: CandidateAnswers): Promise<{ success: boolean; message?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const res = await fetch(GAS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'simpanHasil',
          dataKandidat: candidateAnswers,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      return { success: true, message: data?.status || data?.message || 'Data berhasil dikirim.' };
    } catch (err) {
      console.error('Submit exam failed:', err);
      throw err;
    }
  },
};
