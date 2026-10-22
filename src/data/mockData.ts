import { QuestionItem, ArmyAlphaQuestion } from '../types';

export const DEFAULT_POSITIONS: string[] = [
  'Operator Produksi',
  'Staff Quality Control & Assurance (QA/QC)',
  'Teknisi Maintenance & Engineering',
  'Admin Gudang & Logistik',
  'Supervisor Produksi',
  'Staff HSE (Health, Safety & Environment)',
  'Staff HR & Rekrutmen',
  'Staff PPIC (Production Planning & Inventory Control)'
];

export const DEFAULT_VERBAL_QUESTIONS: QuestionItem[] = [
  {
    id: "VRB_01",
    soal: "SINONIM: EFEKTIF = ...",
    opsi: ["Tepat sasaran", "Hemat biaya", "Berulang kali", "Sederhana", "Lancar"]
  },
  {
    id: "VRB_02",
    soal: "ANTONIM: PROGRESIF >< ...",
    opsi: ["Regresif", "Agresif", "Aktif", "Pasif", "Konstruktif"]
  },
  {
    id: "VRB_03",
    soal: "ANALOGI: KERTAS : PENA = ... : ...",
    opsi: ["Dinding : Kuas", "Meja : Kursi", "Buku : Tas", "Papan : Kayu", "Mobil : Jalan"]
  },
  {
    id: "VRB_04",
    soal: "SINONIM: AKURAT = ...",
    opsi: ["Saksama / Teliti", "Kuat", "Cepat", "Banyak", "Jelas"]
  },
  {
    id: "VRB_05",
    soal: "ANTONIM: KOLEKTIF >< ...",
    opsi: ["Individual", "Selektif", "Masif", "Positif", "Objektif"]
  },
  {
    id: "VRB_06",
    soal: "ANALOGI: MOBIL : BENSIN = MANUSIA : ...",
    opsi: ["Makanan", "Minuman", "Udara", "Vitamin", "Energi"]
  },
  {
    id: "VRB_07",
    soal: "SINONIM: DIVERSIFIKASI = ...",
    opsi: ["Penganekaragaman", "Penyempitan", "Penggabungan", "Pemisahan", "Pengurangan"]
  },
  {
    id: "VRB_08",
    soal: "ANTONIM: PARADOKSAL >< ...",
    opsi: ["Sejalan / Selaras", "Kontras", "Bertolak belakang", "Berlawanan", "Berbeda"]
  },
  {
    id: "VRB_09",
    soal: "ANALOGI: PETANI : CANGKUL = DOKTER : ...",
    opsi: ["Stetoskop", "Rumah Sakit", "Obat", "Pasien", "Suntikan"]
  },
  {
    id: "VRB_10",
    soal: "SINONIM: KONTEMPLASI = ...",
    opsi: ["Renungan", "Perdebatan", "Kesepakatan", "Pertunjukan", "Pertemuan"]
  }
];

export const DEFAULT_HITUNGAN_QUESTIONS: QuestionItem[] = [
  {
    id: "HTG_01",
    soal: "Deret Angka: 3, 6, 12, 24, 48, ... Angka berikutnya adalah:",
    opsi: ["96", "84", "72", "108", "92"]
  },
  {
    id: "HTG_02",
    soal: "Sebuah lini produksi PT MIM memproduksi 240 karton sabun deterjen per jam. Berapa karton yang dihasilkan dalam waktu 7,5 jam?",
    opsi: ["1.800 karton", "1.680 karton", "1.720 karton", "1.920 karton", "1.850 karton"]
  },
  {
    id: "HTG_03",
    soal: "Deret Angka: 100, 95, 85, 70, 50, ... Angka berikutnya adalah:",
    opsi: ["25", "30", "35", "20", "15"]
  },
  {
    id: "HTG_04",
    soal: "Jika harga awal suatu bahan baku adalah Rp 50.000 dan mendapat potongan harga sebesar 15%, berapakah harga yang harus dibayar?",
    opsi: ["Rp 42.500", "Rp 40.000", "Rp 45.000", "Rp 41.500", "Rp 43.000"]
  },
  {
    id: "HTG_05",
    soal: "Deret Huruf: A, C, F, J, O, ... Huruf berikutnya adalah:",
    opsi: ["U", "T", "V", "W", "S"]
  },
  {
    id: "HTG_06",
    soal: "Suatu mesin pengemas membutuhkan waktu 4 menit untuk menyelesaikan 80 kemasan. Berapa waktu yang dibutuhkan untuk mengemas 600 kemasan?",
    opsi: ["30 menit", "25 menit", "35 menit", "40 menit", "20 menit"]
  },
  {
    id: "HTG_07",
    soal: "Hasil dari (15 × 8) + (144 ÷ 12) - 32 adalah:",
    opsi: ["100", "98", "102", "110", "96"]
  },
  {
    id: "HTG_08",
    soal: "Sebuah gudang memiliki stok 1.500 kardus. Hari ini dikirim 30% ke distributor A dan 25% ke distributor B. Berapa sisa kardus di gudang?",
    opsi: ["675 kardus", "650 kardus", "700 kardus", "625 kardus", "750 kardus"]
  },
  {
    id: "HTG_09",
    soal: "Deret Angka: 2, 3, 5, 8, 13, 21, ... Angka berikutnya adalah:",
    opsi: ["34", "31", "33", "35", "32"]
  },
  {
    id: "HTG_10",
    soal: "Perbandingan pekerja pria dan wanita di departemen kemas adalah 3 : 5. Jika total pekerja ada 160 orang, berapa jumlah pekerja wanita?",
    opsi: ["100 orang", "60 orang", "90 orang", "110 orang", "95 orang"]
  }
];

export const DEFAULT_ALPHA_QUESTIONS: ArmyAlphaQuestion[] = [
  {
    id: "ALP_1",
    nomor: 1,
    waktu: 5,
    instruksi: "Lihatlah lingkaran-lingkaran pada soal nomor 1, dengarkan baik-baik : Buatlah sebuah silang dalam lingkaran ke-2 dan sebuah huruf dalam lingkaran ke-5.",
    audio: "alpha_1.mp3",
    tipe: "SOAL_1_LINGKARAN",
    metadata: {
      jumlahLingkaran: 5,
    }
  },
  {
    id: "ALP_2",
    nomor: 2,
    waktu: 5,
    instruksi: "Lihatlah soal nomor 2, lingkaran-lingkaran itu bernomor, dengarkan baik-baik : Tariklah sebuah garis dari lingkaran ke-3 ke lingkaran ke-6. Garis itu lewat di bawah lingkaran ke-4 dan di atas lingkaran ke-5.",
    audio: "alpha_2.mp3",
    tipe: "SOAL_2_JALUR_NOMOR",
    metadata: {
      jumlahLingkaran: 9,
    }
  },
  {
    id: "ALP_3",
    nomor: 3,
    waktu: 10,
    instruksi: "Lihatlah soal nomor 3, perhatikan baik-baik : Jika betul bahwa pesawat udara lebih cepat dari mobil, buatlah koma dalam lingkaran pertama. Jika tidak, coretlah perkataan 'Tidak'.",
    audio: "alpha_3.mp3",
    tipe: "SOAL_3_KOMA_CORET",
    metadata: {
      jumlahLingkaran: 3,
      kata: ["Ya", "Tidak"]
    }
  },
  {
    id: "ALP_4",
    nomor: 4,
    waktu: 10,
    instruksi: "Sekarang soal nomor 4, dengarkan baik-baik : Tulislah dalam lingkaran ke-3 jawaban yang betul dari pertanyaan 'Berapa harikah 1 minggu itu?' Dalam lingkaran ke-4 tidak dibuat suatu apapun, tetapi tulislah dalam lingkaran ke-5 jawaban yang salah dari pertanyaan tadi.",
    audio: "alpha_4.mp3",
    tipe: "SOAL_4_HARI_MINGGU",
    metadata: {
      jumlahLingkaran: 5,
    }
  },
  {
    id: "ALP_5",
    nomor: 5,
    waktu: 10,
    instruksi: "Lihatlah segitiga pada soal nomor 5, dengarkan baik-baik : Buatlah sebuah silang pada bidang yang terletak dalam lingkaran, tetapi tidak dalam segitiga. Dan tulislah huruf 'A' pada bidang yang terletak dalam lingkaran dan juga dalam segitiga.",
    audio: "alpha_5.mp3",
    tipe: "SOAL_5_SEGITIGA_LINGKARAN",
    metadata: {
      bidang: [
        { id: "lingkaran_luar", nama: "Dalam Lingkaran (Luar Segitiga)" },
        { id: "irisan", nama: "Dalam Lingkaran & Dalam Segitiga" },
        { id: "segitiga_luar", nama: "Dalam Segitiga (Luar Lingkaran)" }
      ]
    }
  },
  {
    id: "ALP_6",
    nomor: 6,
    waktu: 10,
    instruksi: "Lihatlah soal nomor 6, dengarkan baik-baik : Tulislah huruf 'X' pada bidang yang terletak dalam segitiga tetapi tidak dalam bujur sangkar dan tulislah huruf 'Y' pada bidang yang terletak dalam bujur sangkar dan segitiga tetapi tidak dalam lingkaran.",
    audio: "alpha_6.mp3",
    tipe: "SOAL_6_LINGKARAN_KOTAK_SEGITIGA",
    metadata: {
      bidang: [
        { id: "segitiga_non_kotak", nama: "Dalam Segitiga (Bukan Bujur Sangkar)" },
        { id: "kotak_segitiga_non_lingkaran", nama: "Dalam Bujur Sangkar & Segitiga (Bukan Lingkaran)" },
        { id: "lingkaran_area", nama: "Area Lingkaran Lainnya" }
      ]
    }
  },
  {
    id: "ALP_7",
    nomor: 7,
    waktu: 10,
    instruksi: "Lihatlah soal nomor 7, dengarkan baik-baik : Buatlah sebuah garis di bawah huruf yang tepat mendahului huruf 'E' dan buatlah pula sebuah garis yang melintang huruf kedua yang mendahului 'M'.",
    audio: "alpha_7.mp3",
    tipe: "SOAL_7_HURUF_GARIS_CORET",
    metadata: {
      huruf: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"]
    }
  },
  {
    id: "ALP_8",
    nomor: 8,
    waktu: 15,
    instruksi: "Lihatlah soal nomor 8, perhatikanlah ke-3 lingkaran dan ke-3 perkataan-perkataan ini : Tulislah dalam lingkaran pertama, huruf kedua dari perkataan pertama. Dalam lingkaran kedua, huruf ketiga dari perkataan kedua. Dalam lingkaran ketiga, huruf penghabisan dari perkataan ketiga.",
    audio: "alpha_8.mp3",
    tipe: "SOAL_8_KATA_LINGKARAN",
    metadata: {
      jumlahLingkaran: 3,
      kata: ["KAPAL", "MUATAN", "GUDANG"]
    }
  },
  {
    id: "ALP_9",
    nomor: 9,
    waktu: 15,
    instruksi: "Lihatlah nomor 9, dengarkan baik-baik. Coretlah tiap-tiap bilangan yang lebih besar dari 30, tapi kurang dari 40.",
    audio: "alpha_9.mp3",
    tipe: "SOAL_9_DERET_30_40",
    metadata: {
      deret: ["45", "87", "54", "33", "66", "78", "81", "49", "36", "41", "71", "99", "17", "82", "64", "89"]
    }
  },
  {
    id: "ALP_10",
    nomor: 10,
    waktu: 15,
    instruksi: "Lihatlah nomor 10, perhatikan bahwa gambar itu terbagi atas 5 bagian. Tulislah angka 8 atau 6 dalam 2 bagian yang kecil dan angka antara 1 sampai 5 dalam bagian hampir paling besar.",
    audio: "alpha_10.mp3",
    tipe: "SOAL_10_KOTAK_5_BAGIAN",
    metadata: {
      bagian: [
        { id: 0, label: "Bagian 1 (Kecil)", lebar: "w-16" },
        { id: 1, label: "Bagian 2 (Sedang)", lebar: "w-28" },
        { id: 2, label: "Bagian 3 (Hampir Paling Besar)", lebar: "w-44" },
        { id: 3, label: "Bagian 4 (Kecil)", lebar: "w-16" },
        { id: 4, label: "Bagian 5 (Paling Besar)", lebar: "w-56" }
      ]
    }
  },
  {
    id: "ALP_11",
    nomor: 11,
    waktu: 15,
    instruksi: "Lihatlah nomor 11, dengarkan baik-baik. Coret tiap-tiap angka ganjil yang tidak berhuruf dan tidak terletak dalam segitiga dan coretlah pula tiap angka genap yang berhuruf dalam lingkaran.",
    audio: "alpha_11.mp3",
    tipe: "SOAL_11_BENTUK_GANJIL_GENAP",
    metadata: {
      items: [
        { id: 0, bentuk: "circle", teks: "6A", desc: "Lingkaran [6A]" },
        { id: 1, bentuk: "square", teks: "5", desc: "Kotak [5]" },
        { id: 2, bentuk: "triangle", teks: "7", desc: "Segitiga [7]" },
        { id: 3, bentuk: "circle", teks: "9", desc: "Lingkaran [9]" },
        { id: 4, bentuk: "triangle", teks: "8", desc: "Segitiga [8]" },
        { id: 5, bentuk: "square", teks: "2F", desc: "Kotak [2F]" },
        { id: 6, bentuk: "circle", teks: "5P", desc: "Lingkaran [5P]" },
        { id: 7, bentuk: "square", teks: "3", desc: "Kotak [3]" },
        { id: 8, bentuk: "triangle", teks: "1", desc: "Segitiga [1]" }
      ]
    }
  },
  {
    id: "ALP_12",
    nomor: 12,
    waktu: 10,
    instruksi: "Sekarang nomor yang terakhir, yaitu nomor 12. Perhatikan baik-baik, apabila 5 lebih dari 3, coretlah angka 4, kecuali kalau 4 lebih besar daripada 6, dalam hal ini buatlah sebuah garis di bawah angka 5.",
    audio: "alpha_12.mp3",
    tipe: "SOAL_12_LOGIKA_ANGKA",
    metadata: {
      deret: ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
    }
  }
];
