import { QuestionItem, ArmyAlphaQuestion, RACQuestionItem } from '../types';

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

// =====================================================================
// TAHAP 1: ARMY ALPHA QUESTIONS (12 NOMOR)
// =====================================================================
export const DEFAULT_ALPHA_QUESTIONS: ArmyAlphaQuestion[] = [
  {
    id: "ALP_1",
    nomor: 1,
    waktu: 6,
    audio: "/audio/army_alpha/soal_1.mp3",
    mulaiTime: 17.7,
    stopTime: 23.7,
    instruksi: "Lihatlah lingkaran-lingkaran pada soal nomor 1, dengarkan baik-baik : Buatlah sebuah silang dalam lingkaran ke-2 dan sebuah huruf dalam lingkaran ke-5.",
    tipe: "SOAL_1_LINGKARAN",
    metadata: { jumlah: 5 }
  },
  {
    id: "ALP_2",
    nomor: 2,
    waktu: 6,
    audio: "/audio/army_alpha/soal_2.mp3",
    mulaiTime: 23.0,
    stopTime: 28.7,
    instruksi: "Lihatlah soal nomor 2, lingkaran-lingkaran itu bernomor, dengarkan baik-baik : Tariklah sebuah garis dari lingkaran ke-3 ke lingkaran ke-6. Garis itu lewat di bawah lingkaran ke-4 dan di atas lingkaran ke-5.",
    tipe: "SOAL_2_JALUR_NOMOR",
    metadata: { jumlah: 9 }
  },
  {
    id: "ALP_3",
    nomor: 3,
    waktu: 10,
    audio: "/audio/army_alpha/soal_3.mp3",
    mulaiTime: 19.7,
    stopTime: 29.6,
    instruksi: "Lihatlah soal nomor 3, perhatikan baik-baik : Jika betul bahwa pesawat udara lebih cepat dari mobil, buatlah koma dalam lingkaran pertama. Jika tidak, coretlah perkataan 'Tidak'.",
    tipe: "SOAL_3_KOMA_CORET",
    metadata: { jumlah: 3, kata: ["Ya", "Tidak"] }
  },
  {
    id: "ALP_4",
    nomor: 4,
    waktu: 10,
    audio: "/audio/army_alpha/soal_4.mp3",
    mulaiTime: 29.1,
    stopTime: 39.4,
    instruksi: "Sekarang soal nomor 4, dengarkan baik-baik : Tulislah dalam lingkaran ke-3 jawaban yang betul dari pertanyaan 'Berapa harikah 1 minggu itu?' Dalam lingkaran ke-4 tidak dibuat suatu apapun, tetapi tulislah dalam lingkaran ke-5 jawaban yang salah dari pertanyaan tadi.",
    tipe: "SOAL_4_HARI_MINGGU",
    metadata: { jumlah: 5 }
  },
  {
    id: "ALP_5",
    nomor: 5,
    waktu: 10,
    audio: "/audio/army_alpha/soal_5.mp3",
    mulaiTime: 24.7,
    stopTime: 34.8,
    instruksi: "Lihatlah segitiga pada soal nomor 5, dengarkan baik-baik : Buatlah sebuah silang pada bidang yang terletak dalam lingkaran, tetapi tidak dalam segitiga. Dan tulislah huruf 'A' pada bidang yang terletak dalam lingkaran dan juga dalam segitiga.",
    tipe: "SOAL_5_SEGITIGA_LINGKARAN"
  },
  {
    id: "ALP_6",
    nomor: 6,
    waktu: 10,
    audio: "/audio/army_alpha/soal_6.mp3",
    mulaiTime: 26.4,
    stopTime: 36.6,
    instruksi: "Lihatlah soal nomor 6, dengarkan baik-baik : Tulislah huruf 'X' pada bidang yang terletak dalam segitiga tetapi tidak dalam bujur sangkar dan tulislah huruf 'Y' pada bidang yang terletak dalam bujur sangkar dan segitiga tetapi tidak dalam lingkaran.",
    tipe: "SOAL_6_LINGKARAN_KOTAK_SEGITIGA"
  },
  {
    id: "ALP_7",
    nomor: 7,
    waktu: 11,
    audio: "/audio/army_alpha/soal_7.mp3",
    mulaiTime: 21.1,
    stopTime: 31.7,
    instruksi: "Lihatlah soal nomor 7, dengarkan baik-baik : Buatlah sebuah garis di bawah huruf yang tepat mendahului huruf 'E' dan buatlah pula sebuah garis yang melintang huruf kedua yang mendahului 'M'.",
    tipe: "SOAL_7_HURUF_GARIS_CORET"
  },
  {
    id: "ALP_8",
    nomor: 8,
    waktu: 15,
    audio: "/audio/army_alpha/soal_8.mp3",
    mulaiTime: 29.5,
    stopTime: 45.0,
    instruksi: "Lihatlah soal nomor 8, perhatikanlah ke-3 lingkaran dan ke-3 perkataan-perkataan ini : Tulislah dalam lingkaran pertama, huruf kedua dari perkataan pertama. Dalam lingkaran kedua, huruf ketiga dari perkataan kedua. Dalam lingkaran ketiga, huruf penghabisan dari perkataan ketiga.",
    tipe: "SOAL_8_KATA_LINGKARAN",
    metadata: { kata: ["KAPAL", "MUATAN", "GUDANG"] }
  },
  {
    id: "ALP_9",
    nomor: 9,
    waktu: 15,
    audio: "/audio/army_alpha/soal_9.mp3",
    mulaiTime: 17.1,
    stopTime: 32.6,
    instruksi: "Lihatlah nomor 9, dengarkan baik-baik. Coretlah tiap-tiap bilangan yang lebih besar dari 30, tapi kurang dari 40.",
    tipe: "SOAL_9_DERET_30_40",
    metadata: {
      deret: ["45", "87", "54", "33", "66", "78", "81", "49", "36", "41", "71", "99", "17", "82", "64", "89"]
    }
  },
  {
    id: "ALP_10",
    nomor: 10,
    waktu: 16,
    audio: "/audio/army_alpha/soal_10.mp3",
    mulaiTime: 22.1,
    stopTime: 37.7,
    instruksi: "Lihatlah nomor 10, perhatikan bahwa gambar itu terbagi atas 5 bagian. Tulislah angka 8 atau 6 dalam 2 bagian yang kecil dan angka antara 1 sampai 5 dalam bagian hampir paling besar.",
    tipe: "SOAL_10_KOTAK_5_BAGIAN"
  },
  {
    id: "ALP_11",
    nomor: 11,
    waktu: 16,
    audio: "/audio/army_alpha/soal_11.mp3",
    mulaiTime: 22.2,
    stopTime: 37.8,
    instruksi: "Lihatlah nomor 11, dengarkan baik-baik. Coret tiap-tiap angka ganjil yang tidak berhuruf dan tidak terletak dalam segitiga dan coretlah pula tiap angka genap yang berhuruf dalam lingkaran.",
    tipe: "SOAL_11_BENTUK_GANJIL_GENAP",
    metadata: {
      items: [
        { id: 0, bentuk: "circle", teks: "6A" },
        { id: 1, bentuk: "square", teks: "5" },
        { id: 2, bentuk: "triangle", teks: "7" },
        { id: 3, bentuk: "circle", teks: "9" },
        { id: 4, bentuk: "triangle", teks: "8" },
        { id: 5, bentuk: "square", teks: "2F" },
        { id: 6, bentuk: "circle", teks: "5P" },
        { id: 7, bentuk: "square", teks: "3" },
        { id: 8, bentuk: "triangle", teks: "1" }
      ]
    }
  },
  {
    id: "ALP_12",
    nomor: 12,
    waktu: 11,
    audio: "/audio/army_alpha/soal_12.mp3",
    mulaiTime: 24.9,
    stopTime: 35.6,
    instruksi: "Sekarang nomor yang terakhir, yaitu nomor 12. Perhatikan baik-baik, apabila 5 lebih dari 3, coretlah angka 4, kecuali kalau 4 lebih besar daripada 6, dalam hal ini buatlah sebuah garis di bawah angka 5.",
    tipe: "SOAL_12_LOGIKA_ANGKA",
    metadata: {
      deret: ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
    }
  }
];

// =====================================================================
// TAHAP 2: MATEMATIKA DASAR (3 PAKET DINAMIS)
// =====================================================================
export const PAKET_MATEMATIKA_A: QuestionItem[] = [
  {
    id: "MTK_A_01",
    soal: "Hitunglah hasil dari: 48 + 72 ÷ 6 - 15 = ...",
    opsi: ["45", "42", "50", "48", "38"],
    kunci: "45"
  },
  {
    id: "MTK_A_02",
    soal: "Sebuah tangki penyimpanan deterjen PT MIM memiliki volume 1.500 liter. Jika pipa pengisian mengalirkan 75 liter per menit, berapa menit yang dibutuhkan agar tangki penuh?",
    opsi: ["20 menit", "15 menit", "25 menit", "18 menit", "30 menit"],
    kunci: "20 menit"
  },
  {
    id: "MTK_A_03",
    soal: "Deret Angka: 4, 9, 16, 25, 36, ... Angka berikutnya adalah:",
    opsi: ["49", "45", "48", "52", "64"],
    kunci: "49"
  },
  {
    id: "MTK_A_04",
    soal: "Sebuah palet memuat 48 karton. Jika ada 125 palet di gudang distribusi, berapa total karton yang tersedia?",
    opsi: ["6.000 karton", "5.800 karton", "6.200 karton", "6.400 karton", "5.600 karton"],
    kunci: "6.000 karton"
  },
  {
    id: "MTK_A_05",
    soal: "Dari 800 botol yang diinspeksi oleh tim QA, terdapat 24 botol yang cacat (reject). Berapa persentase botol yang lolos standar mutu?",
    opsi: ["97%", "96%", "98%", "95%", "97,5%"],
    kunci: "97%"
  },
  {
    id: "MTK_A_06",
    soal: "Deret Angka: 3, 7, 15, 31, 63, ... Angka berikutnya adalah:",
    opsi: ["127", "125", "115", "129", "120"],
    kunci: "127"
  },
  {
    id: "MTK_A_07",
    soal: "Tiga orang teknisi mesin dapat menyelesaikan perbaikan 1 lini perakitan dalam waktu 6 jam. Berapa jam waktu yang dibutuhkan jika dikerjakan oleh 6 orang teknisi dengan kecepatan kerja sama?",
    opsi: ["3 jam", "4 jam", "2 jam", "5 jam", "1,5 jam"],
    kunci: "3 jam"
  },
  {
    id: "MTK_A_08",
    soal: "Jika harga 1 drum formula pembersih adalah Rp 2.400.000 dan mendapat potongan harga sebesar 12,5%, berapakah harga bersih setelah diskon?",
    opsi: ["Rp 2.100.000", "Rp 2.050.000", "Rp 2.150.000", "Rp 2.200.000", "Rp 2.000.000"],
    kunci: "Rp 2.100.000"
  },
  {
    id: "MTK_A_09",
    soal: "Berapakah nilai dari (25 × 16) ÷ 8 + 75 = ...",
    opsi: ["125", "115", "135", "120", "130"],
    kunci: "125"
  },
  {
    id: "MTK_A_10",
    soal: "Sebuah conveyor belt bergerak dengan kecepatan 0,5 meter per detik. Berapa jarak yang ditempuh suatu produk kemasan selama 8 menit?",
    opsi: ["240 meter", "200 meter", "280 meter", "300 meter", "180 meter"],
    kunci: "240 meter"
  }
];

export const PAKET_MATEMATIKA_B: QuestionItem[] = [
  {
    id: "MTK_B_01",
    soal: "Berapakah hasil dari 144 ÷ 12 × 5 + 40 = ...",
    opsi: ["100", "90", "110", "105", "95"],
    kunci: "100"
  },
  {
    id: "MTK_B_02",
    soal: "Deret Angka: 5, 11, 23, 47, 95, ... Angka berikutnya adalah:",
    opsi: ["191", "189", "195", "185", "199"],
    kunci: "191"
  },
  {
    id: "MTK_B_03",
    soal: "Satu shift kerja (8 jam) mampu memproduksi 3.200 unit sabun batang. Berapa rata-rata output produksi per menit?",
    opsi: ["6,67 unit", "7,5 unit", "8 unit", "6 unit", "5,5 unit"],
    kunci: "6,67 unit"
  },
  {
    id: "MTK_B_04",
    soal: "Jika perbandingan bahan konsentrat A dan B adalah 4 : 7, dan total berat campuran adalah 220 kg, berapa kg berat konsentrat B?",
    opsi: ["140 kg", "120 kg", "130 kg", "150 kg", "80 kg"],
    kunci: "140 kg"
  },
  {
    id: "MTK_B_05",
    soal: "Deret Angka: 100, 96, 88, 72, 40, ... Angka berikutnya adalah:",
    opsi: ["-24", "-16", "-32", "0", "-8"],
    kunci: "-24"
  },
  {
    id: "MTK_B_06",
    soal: "Sebuah mesin pengisi botol memiliki efisiensi 92%. Jika kapasitas teoretisnya adalah 5.000 botol/hari, berapa botol yang terealisasi?",
    opsi: ["4.600 botol", "4.500 botol", "4.700 botol", "4.550 botol", "4.650 botol"],
    kunci: "4.600 botol"
  },
  {
    id: "MTK_B_07",
    soal: "Nilai dari 3/4 + 2/5 - 1/2 adalah:",
    opsi: ["13/20", "11/20", "17/20", "9/20", "7/10"],
    kunci: "13/20"
  },
  {
    id: "MTK_B_08",
    soal: "Sebuah mobil box logistik membawa 80 dus produk seberat 15 kg per dus, dan 50 dus seberat 20 kg per dus. Berapa total beban angkutannya?",
    opsi: ["2.200 kg", "2.000 kg", "2.400 kg", "2.100 kg", "2.500 kg"],
    kunci: "2.200 kg"
  },
  {
    id: "MTK_B_09",
    soal: "Jika x = 15 dan y = 8, berapakah nilai dari √(x² + y² + 35)?",
    opsi: ["18", "17", "19", "16", "20"],
    kunci: "18"
  },
  {
    id: "MTK_B_10",
    soal: "Karyawan lembur selama 3 jam dengan upah 1,5 kali upah normal per jam. Jika upah normal Rp 40.000/jam, berapa total upah lembur yang diterima?",
    opsi: ["Rp 180.000", "Rp 160.000", "Rp 200.000", "Rp 150.000", "Rp 175.000"],
    kunci: "Rp 180.000"
  }
];

export const PAKET_MATEMATIKA_C: QuestionItem[] = [
  {
    id: "MTK_C_01",
    soal: "Deret Angka: 2, 6, 18, 54, 162, ... Angka berikutnya adalah:",
    opsi: ["486", "464", "496", "472", "504"],
    kunci: "486"
  },
  {
    id: "MTK_C_02",
    soal: "Hitunglah nilai dari: (850 - 325) ÷ 25 + 49 = ...",
    opsi: ["70", "65", "75", "68", "72"],
    kunci: "70"
  },
  {
    id: "MTK_C_03",
    soal: "Sebuah mesin beroperasi nonstop 24 jam dan menghasilkan 8.640 kemasan. Berapa botol yang dihasilkan tiap menitnya?",
    opsi: ["6 kemasan", "5 kemasan", "7 kemasan", "8 kemasan", "4 kemasan"],
    kunci: "6 kemasan"
  },
  {
    id: "MTK_C_04",
    soal: "Jika biaya operasional pabrik naik dari Rp 50.000.000 menjadi Rp 58.000.000, berapa persentase kenaikannya?",
    opsi: ["16%", "15%", "18%", "14%", "17,5%"],
    kunci: "16%"
  },
  {
    id: "MTK_C_05",
    soal: "Deret Angka: 80, 40, 20, 10, 5, ... Angka berikutnya adalah:",
    opsi: ["2,5", "2", "3", "1,5", "0"],
    kunci: "2,5"
  },
  {
    id: "MTK_C_06",
    soal: "Sebuah gudang memiliki area seluas 600 m². Jika 65% area digunakan untuk penumpukan stok palet, berapakah sisa luas area untuk jalur manuver forklift?",
    opsi: ["210 m²", "190 m²", "200 m²", "220 m²", "180 m²"],
    kunci: "210 m²"
  },
  {
    id: "MTK_C_07",
    soal: "Berapakah 35% dari 4.000 ditambah 15% dari 2.000?",
    opsi: ["1.700", "1.600", "1.750", "1.800", "1.650"],
    kunci: "1.700"
  },
  {
    id: "MTK_C_08",
    soal: "Jika 4 unit mesin cetak menghasilkan 1.200 cetakan dalam 2 jam, berapa unit mesin cetak yang dibutuhkan untuk menghasilkan 3.600 cetakan dalam 2 jam?",
    opsi: ["12 unit", "10 unit", "8 unit", "15 unit", "16 unit"],
    kunci: "12 unit"
  },
  {
    id: "MTK_C_09",
    soal: "Hasil dari (18 × 15) - (240 ÷ 8) adalah:",
    opsi: ["240", "230", "250", "260", "225"],
    kunci: "240"
  },
  {
    id: "MTK_C_10",
    soal: "Sebuah tangki kimia diisi larutan sebanyak 4/5 kapasitasnya. Setelah diambil 150 liter, kini tersisa 1/2 kapasitasnya. Berapakah kapasitas penuh tangki tersebut?",
    opsi: ["500 liter", "450 liter", "600 liter", "400 liter", "550 liter"],
    kunci: "500 liter"
  }
];

export const ALL_MATEMATIKA_PACKS: Record<string, QuestionItem[]> = {
  "Paket A": PAKET_MATEMATIKA_A,
  "Paket B": PAKET_MATEMATIKA_B,
  "Paket C": PAKET_MATEMATIKA_C,
};

// =====================================================================
// TAHAP 3: RAC (TES KETELITIAN & KECEPATAN - 40 SOAL / 2 MENIT)
// =====================================================================
export const DEFAULT_RAC_QUESTIONS: RACQuestionItem[] = [
  { id: "RAC_01", nomor: 1, kolomA: "8492048", kolomB: "8492048", kunci: "SAMA" },
  { id: "RAC_02", nomor: 2, kolomA: "PT MULTI INDOMANDIRI", kolomB: "PT MULTI INDOMANDIR1", kunci: "TIDAK SAMA" },
  { id: "RAC_03", nomor: 3, kolomA: "K-9842#XZ", kolomB: "K-9842#XZ", kunci: "SAMA" },
  { id: "RAC_04", nomor: 4, kolomA: "73820194", kolomB: "73820149", kunci: "TIDAK SAMA" },
  { id: "RAC_05", nomor: 5, kolomA: "GUDANG-LOGISTIK-03", kolomB: "GUDANG-LOGISTIK-03", kunci: "SAMA" },
  { id: "RAC_06", nomor: 6, kolomA: "bbddqpdb", kolomB: "bbddqpdb", kunci: "SAMA" },
  { id: "RAC_07", nomor: 7, kolomA: "MIM_WINGS_GROUP", kolomB: "MIM_W1NGS_GROUP", kunci: "TIDAK SAMA" },
  { id: "RAC_08", nomor: 8, kolomA: "9384729184", kolomB: "9384729184", kunci: "SAMA" },
  { id: "RAC_09", nomor: 9, kolomA: "CV. SEJAHTERA ABADI", kolomB: "CV. SEJAHTERA ABADl", kunci: "TIDAK SAMA" },
  { id: "RAC_10", nomor: 10, kolomA: "XYZ-784-990-A", kolomB: "XYZ-784-990-A", kunci: "SAMA" },
  { id: "RAC_11", nomor: 11, kolomA: "1098234710", kolomB: "1098234701", kunci: "TIDAK SAMA" },
  { id: "RAC_12", nomor: 12, kolomA: "SAFETY FIRST MIM", kolomB: "SAFETY FIRST MIM", kunci: "SAMA" },
  { id: "RAC_13", nomor: 13, kolomA: "$#%*@&!?", kolomB: "$#%*@&!?", kunci: "SAMA" },
  { id: "RAC_14", nomor: 14, kolomA: "Jl. Prakarsa No. 89", kolomB: "Jl. Prakarsa No. 98", kunci: "TIDAK SAMA" },
  { id: "RAC_15", nomor: 15, kolomA: "5588332211", kolomB: "5588332211", kunci: "SAMA" },
  { id: "RAC_16", nomor: 16, kolomA: "BATCH-2024-MIM-09", kolomB: "BATCH-2024-MIM-06", kunci: "TIDAK SAMA" },
  { id: "RAC_17", nomor: 17, kolomA: "AAABBBCCCDDD", kolomB: "AAABBBCCCDDD", kunci: "SAMA" },
  { id: "RAC_18", nomor: 18, kolomA: "mnnmmnmnn", kolomB: "mnnmmnmnn", kunci: "SAMA" },
  { id: "RAC_19", nomor: 19, kolomA: "998877665544", kolomB: "998877665544", kunci: "SAMA" },
  { id: "RAC_20", nomor: 20, kolomA: "SOAP-DETERGENT-FL", kolomB: "SOAP-DETERGANT-FL", kunci: "TIDAK SAMA" },
  { id: "RAC_21", nomor: 21, kolomA: "6372819405", kolomB: "6372819405", kunci: "SAMA" },
  { id: "RAC_22", nomor: 22, kolomA: "QUALITY ASSURANCE", kolomB: "OUALITY ASSURANCE", kunci: "TIDAK SAMA" },
  { id: "RAC_23", nomor: 23, kolomA: "PLT-4892-X", kolomB: "PLT-4892-X", kunci: "SAMA" },
  { id: "RAC_24", nomor: 24, kolomA: "1248163264", kolomB: "1248163264", kunci: "SAMA" },
  { id: "RAC_25", nomor: 25, kolomA: "ENGINEERING-DEPT", kolomB: "ENGlNEERING-DEPT", kunci: "TIDAK SAMA" },
  { id: "RAC_26", nomor: 26, kolomA: "7492047193", kolomB: "7492047193", kunci: "SAMA" },
  { id: "RAC_27", nomor: 27, kolomA: "EXP: 12/2026", kolomB: "EXP: 12/2025", kunci: "TIDAK SAMA" },
  { id: "RAC_28", nomor: 28, kolomA: "@_#_$_%_&_*", kolomB: "@_#_$_%_&_*", kunci: "SAMA" },
  { id: "RAC_29", nomor: 29, kolomA: "84930281940", kolomB: "84930281940", kunci: "SAMA" },
  { id: "RAC_30", nomor: 30, kolomA: "LINE 4 CONVEYOR", kolomB: "LINE 4 CONVEYOR", kunci: "SAMA" },
  { id: "RAC_31", nomor: 31, kolomA: "48392019482", kolomB: "48392019482", kunci: "SAMA" },
  { id: "RAC_32", nomor: 32, kolomA: "PPIC-STORAGE-B", kolomB: "PPIC-STOR4GE-B", kunci: "TIDAK SAMA" },
  { id: "RAC_33", nomor: 33, kolomA: "ZXCVBNMASDFG", kolomB: "ZXCVBNMASDFG", kunci: "SAMA" },
  { id: "RAC_34", nomor: 34, kolomA: "9182736450", kolomB: "9182736450", kunci: "SAMA" },
  { id: "RAC_35", nomor: 35, kolomA: "KAPASITAS-1500L", kolomB: "KAPASITAS-15001", kunci: "TIDAK SAMA" },
  { id: "RAC_36", nomor: 36, kolomA: "O0O0O0O0", kolomB: "O0O0O0O0", kunci: "SAMA" },
  { id: "RAC_37", nomor: 37, kolomA: "9948201948", kolomB: "9948201948", kunci: "SAMA" },
  { id: "RAC_38", nomor: 38, kolomA: "MAINTENANCE-SHIFT-A", kolomB: "MAINTENANCE-SH1FT-A", kunci: "TIDAK SAMA" },
  { id: "RAC_39", nomor: 39, kolomA: "1357924680", kolomB: "1357924680", kunci: "SAMA" },
  { id: "RAC_40", nomor: 40, kolomA: "TERVERIFIKASI-MIM", kolomB: "TERVERIFIKASI-MIM", kunci: "SAMA" }
];
