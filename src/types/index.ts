export interface QuestionItem {
  id: string;
  soal: string;
  opsi: string[];
  kunci?: string;
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
  mulaiTime?: number;
  stopTime?: number;
  tipe: ArmyAlphaType;
  metadata?: any;
}

export interface RACQuestionItem {
  id: string;
  nomor: number;
  kolomA: string;
  kolomB: string;
  kunci: 'SAMA' | 'TIDAK SAMA';
  tipeVisual?: 'teks' | 'simbol';
  simbolAId?: string;
  simbolBId?: string;
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
  alpha: Record<string, AlphaAnswerItem>;
  matematika: Record<string, string>;
  rac: Record<string, 'SAMA' | 'TIDAK SAMA'>;
  skorAlpha?: number;
  skorMatDas?: number;
  skorRAC?: number;
}

export type ScreenType =
  | 'loading'
  | 'intro'
  | 'instruction_1'
  | 'alpha'
  | 'instruction_2'
  | 'matematika'
  | 'instruction_3'
  | 'latihan_rac'
  | 'rac'
  | 'lock';

export interface TestDatabase {
  alpha: ArmyAlphaQuestion[];
  matematika: QuestionItem[];
  rac: RACQuestionItem[];
}

export interface SessionState {
  dbData: TestDatabase;
  jawabanKandidat: CandidateAnswers;
  tahapSaatIni: number; // 0: intro, 1: alpha, 2: matematika, 3: rac, 4: lock
  timerSisaDetik: number;
  savedAt: number;
}
