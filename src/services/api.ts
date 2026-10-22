import { CandidateAnswers, QuestionItem, TestDatabase } from '../types';
import {
  DEFAULT_POSITIONS,
  DEFAULT_VERBAL_QUESTIONS,
  DEFAULT_HITUNGAN_QUESTIONS,
  DEFAULT_ALPHA_QUESTIONS
} from '../data/mockData';

export const GAS_API_URL =
  (import.meta as any).env?.VITE_GAS_API_URL ||
  "https://script.google.com/macros/s/AKfycbxQ-htHTxGtxF3849RFvXAqIkxhjDoglCmq3SccSyAH9oKhboaWZm4Pd0uZxQhDW_tf/exec";

export interface InitResponse {
  posisi: string[];
}

export interface VerifyResponse {
  error?: string;
  verbal?: QuestionItem[];
  hitungan?: QuestionItem[];
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
      console.warn('GAS fetchPositions warning, using default positions fallback:', err);
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
      console.warn('checkTokenStatus network/CORS error:', err);
      return { status: 'SEDANG DIKERJAKAN' };
    }
  },

  /**
   * Verify token, candidate info, and initialize test questions
   */
  async verifyCandidate(params: {
    token: string;
    nama: string;
    email: string;
    posisi: string;
    deviceId: string;
  }): Promise<VerifyResponse> {
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

      const data: VerifyResponse = await res.json();
      if (data.error) {
        return data;
      }
      return {
        verbal: (data.verbal && data.verbal.length > 0) ? data.verbal : DEFAULT_VERBAL_QUESTIONS,
        hitungan: (data.hitungan && data.hitungan.length > 0) ? data.hitungan : DEFAULT_HITUNGAN_QUESTIONS,
      };
    } catch (err) {
      console.warn('Verify API request failed, utilizing local fallback engine:', err);
      // If token format is invalid (e.g. empty or too short), we can notify user
      if (params.token.trim().length < 3) {
        return { error: 'Token tidak valid. Pastikan format token benar (contoh: MIM-TEST-001).' };
      }
      return {
        verbal: DEFAULT_VERBAL_QUESTIONS,
        hitungan: DEFAULT_HITUNGAN_QUESTIONS,
      };
    }
  },

  /**
   * Submit candidate exam answers and proctoring violation logs
   */
  async submitExam(candidateAnswers: CandidateAnswers): Promise<{ success: boolean; message?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

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
      return { success: true, message: data?.message || 'Data berhasil dikirim.' };
    } catch (err) {
      console.error('Submit exam failed:', err);
      throw err;
    }
  },
};
