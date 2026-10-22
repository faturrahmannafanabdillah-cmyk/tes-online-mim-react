export interface QuestionItem {
  id: string;
  soal: string;
  opsi: string[];
  kategori?: string;
}

export type ArmyAlphaType =
  | 'SOAL_1_LINGKARAN'
  | 'SOAL_2_JALUR_NOMOR'
  | 'SOAL_3_KOMA_CORET'
  | 'SOAL_4_HARI_MINGGU'
  | 'SOAL_5_SEGITIGA_LINGKARAN'
  | 'SOAL_6_LINGKARAN_KOTAK_SEGITIGA'
  | 'SOAL_7_HURUF_GARIS_CORET'
  | 'SOAL_8_KATA_LINGKARAN'
  | 'SOAL_9_DERET_30_40'
  | 'SOAL_10_KOTAK_5_BAGIAN'
  | 'SOAL_11_BENTUK_GANJIL_GENAP'
  | 'SOAL_12_LOGIKA_ANGKA';

export interface ArmyAlphaQuestion {
  id: string;
  nomor: number;
  waktu: number; // in seconds
  instruksi: string;
  audio?: string;
  tipe: ArmyAlphaType;
  metadata?: any;
}

export interface CandidateInfo {
  nama: string;
  email: string;
  posisi: string;
  token: string;
  fotoBase64?: string;
}

export interface AlphaAnswerItem {
  nomor: number;
  tipe: string;
  inputan?: string[];
  dicoret?: (number | string)[];
  garisBawah?: (number | string)[];
  jalurTerpilih?: string;
  irisan?: Record<string, string>;
}

export interface CandidateAnswers {
  nama: string;
  email: string;
  posisi: string;
  token: string;
  pelanggaran: number;
  verbal: Record<string, string>;
  hitungan: Record<string, string>;
  alpha: Record<string, AlphaAnswerItem>;
}

export type ScreenType = 'loading' | 'intro' | 'verbal' | 'alpha' | 'hitungan' | 'lock';

export interface TestDatabase {
  verbal: QuestionItem[];
  hitungan: QuestionItem[];
  alpha: ArmyAlphaQuestion[];
}

export interface SessionState {
  dbData: TestDatabase;
  jawabanKandidat: CandidateAnswers;
  tahapSaatIni: number; // 0 = intro, 1 = verbal, 2 = alpha, 3 = hitungan, 4 = lock
  timerSisaDetik: number;
  savedAt: number;
}
