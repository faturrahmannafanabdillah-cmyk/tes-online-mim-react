// =====================================================================
// GOOGLE APPS SCRIPT - BACKEND TES ONLINE PT MULTI INDOMANDIRI
// Versi: 3.0 (Pipeline Baru: Tahap 1 Army Alpha, Tahap 2 Matematika Dasar, Tahap 3 RAC)
// =====================================================================

// Menangani masalah CORS untuk Vercel & AI Studio (Preflight Request)
function doOptions(e) {
  return ContentService.createTextOutput("OK")
    .setMimeType(ContentService.MimeType.TEXT);
}

// Menangani request baca data (GET)
function doGet(e) {
  var action = e.parameter.action;
  
  if (action === 'init') {
    return ContentService.createTextOutput(JSON.stringify(getInitData()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'cekToken') {
    return ContentService.createTextOutput(JSON.stringify(cekStatusToken(e.parameter.token)))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({error: "Endpoint GET tidak valid"}))
    .setMimeType(ContentService.MimeType.JSON);
}

// Menangani request kirim/simpan data (POST)
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;

    if (action === 'verifikasi') {
      var result = verifikasiDanAmbilSoal(payload.token, payload.nama, payload.email, payload.posisi, payload.deviceId);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (action === 'simpanHasil') {
      var lock = LockService.getScriptLock();
      lock.waitLock(15000); // Tunggu antrean maksimal 15 detik
      
      try {
        var result = simpanHasilUjian(payload.dataKandidat);
        return ContentService.createTextOutput(JSON.stringify({status: result}))
          .setMimeType(ContentService.MimeType.JSON);
      } finally {
        lock.releaseLock();
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({error: "Endpoint POST tidak valid"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({error: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =====================================================================
// FUNGSI INTI
// =====================================================================

function getInitData() {
  var ss = SpreadsheetApp.openById("1J-Kxp7bmKqiLkkwQnk4YWxvQj7YQeOrZmc2sXNRsulA"); // GANTI ID SPREADSHEET JIKA PERLU
  var sheetPengaturan = ss.getSheetByName("PENGATURAN");
  var pilihanPosisi = [];
  
  if (sheetPengaturan) {
    var posisiString = sheetPengaturan.getRange("B2").getValue().toString();
    pilihanPosisi = posisiString.split(",").map(function(item) { return item.trim(); });
  } else {
    pilihanPosisi = [
      "Operator Produksi",
      "Staff Quality Control & Assurance (QA/QC)",
      "Teknisi Maintenance & Engineering",
      "Admin Gudang & Logistik",
      "Supervisor Produksi",
      "Staff HSE (Health, Safety & Environment)",
      "Staff HR & Rekrutmen",
      "Staff PPIC"
    ];
  }
  
  return { posisi: pilihanPosisi };
}

function verifikasiDanAmbilSoal(tokenInput, nama, email, posisi, deviceId) {
  var ss = SpreadsheetApp.openById("1J-Kxp7bmKqiLkkwQnk4YWxvQj7YQeOrZmc2sXNRsulA"); // GANTI ID SPREADSHEET JIKA PERLU

  try {
    // === 1. CEK WAKTU ===
    var sheetPengaturan = ss.getSheetByName("PENGATURAN");
    var waktuSekarang = new Date();

    if (sheetPengaturan) {
      var waktuMulai   = sheetPengaturan.getRange("B3").getValue();
      var waktuSelesai = sheetPengaturan.getRange("B4").getValue();

      if (waktuMulai && waktuMulai.toString().trim() !== "") {
        var tMulai = new Date(waktuMulai);
        if (!isNaN(tMulai.getTime()) && waktuSekarang.getTime() < tMulai.getTime()) {
          return { error: "⏳ UJIAN BELUM DIMULAI!\n" + sheetPengaturan.getRange("B3").getDisplayValue() };
        }
      }
      if (waktuSelesai && waktuSelesai.toString().trim() !== "") {
        var tSelesai = new Date(waktuSelesai);
        if (!isNaN(tSelesai.getTime()) && waktuSekarang.getTime() > tSelesai.getTime()) {
          return { error: "⛔ AKSES DITUTUP!\n" + sheetPengaturan.getRange("B4").getDisplayValue() };
        }
      }
    }

    // === 2. CEK TOKEN ===
    var sheetToken = ss.getSheetByName("DATA_TOKEN");
    if (!sheetToken) return { error: "Sistem Error: Sheet DATA_TOKEN tidak ditemukan." };

    var dataToken = sheetToken.getDataRange().getValues();
    var barisDitemukan = -1;
    for (var i = 1; i < dataToken.length; i++) {
      if (dataToken[i][0].toString().trim() === tokenInput.trim()) {
        barisDitemukan = i;
        break;
      }
    }
    if (barisDitemukan === -1) return { error: "❌ TOKEN TIDAK TERDAFTAR!" };

    var statusToken = dataToken[barisDitemukan][1].toString().trim().toUpperCase();

    if (statusToken === "SELESAI") {
      return { error: "✅ Ujian Anda sudah tercatat dan selesai.\nTidak dapat mengakses ujian kembali." };
    }
    if (statusToken === "SUDAH DIPAKAI") {
      return { error: "❌ TOKEN HANGUS! Token ini sudah digunakan." };
    }

    var isRestore = (statusToken === "SEDANG DIKERJAKAN");

    // === PROTEKSI JOKI (CEK DEVICE ID) ===
    var savedDeviceId = dataToken[barisDitemukan][4] ? dataToken[barisDitemukan][4].toString().trim() : "";
    
    if (isRestore) {
      if (savedDeviceId !== "" && deviceId !== savedDeviceId) {
        return { error: "🚨 AKSES DITOLAK!\nToken ini sedang dikerjakan di perangkat/browser lain. Anda tidak bisa menggunakan lebih dari satu perangkat." };
      }
    }

    // === 3. SET STATUS TOKEN → SEDANG DIKERJAKAN ===
    var waktuAksesDetail = Utilities.formatDate(waktuSekarang, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
    sheetToken.getRange(barisDitemukan + 1, 2).setValue("SEDANG DIKERJAKAN");
    sheetToken.getRange(barisDitemukan + 1, 3).setValue(nama + " (" + email + ")");
    
    if (!isRestore) {
      sheetToken.getRange(barisDitemukan + 1, 4).setValue(waktuAksesDetail);
      sheetToken.getRange(barisDitemukan + 1, 5).setValue(deviceId); 
    }

    // === 4. SEDOT SOAL MATEMATIKA DASAR (3 PAKET: Paket A, Paket B, Paket C) ===
    var sheetMatematika = ss.getSheetByName("SOAL_MATEMATIKA") || ss.getSheetByName("SOAL_HITUNGAN");
    var paketTerpilihNama = "Paket A";
    var soalMatematikaList = [];

    if (sheetMatematika) {
      var dataMtk = sheetMatematika.getDataRange().getValues();
      if (dataMtk.length > 1) {
        var paketTersedia = [];
        for (var i = 1; i < dataMtk.length; i++) {
          var namaPaket = dataMtk[i][0].toString().trim();
          if (namaPaket !== "" && paketTersedia.indexOf(namaPaket) === -1) {
            paketTersedia.push(namaPaket);
          }
        }
        if (paketTersedia.length > 0) {
          paketTerpilihNama = paketTersedia[Math.floor(Math.random() * paketTersedia.length)];
        }
        for (var i = 1; i < dataMtk.length; i++) {
          if (dataMtk[i][0].toString().trim() === paketTerpilihNama || paketTersedia.length === 0) {
            var opsi = [];
            for (var col = 2; col <= 6; col++) {
              var teksOpsi = dataMtk[i][col] ? dataMtk[i][col].toString().trim() : "";
              if (teksOpsi !== "" && teksOpsi !== "-") opsi.push(teksOpsi);
            }
            soalMatematikaList.push({
              id: "MTK_" + (i + 1),
              soal: dataMtk[i][1].toString(),
              opsi: opsi
            });
          }
        }
      }
    }

    return {
      success: true,
      isRestore: isRestore,
      matematika: soalMatematikaList,
      paketMatematika: paketTerpilihNama
    };

  } catch(e) {
    return { error: "💥 Terjadi kesalahan sistem: " + e.message };
  }
}

// =====================================================================
// KOREKSI RESMI SOAL ARMY ALPHA (12 NOMOR BERDASARKAN KUNCI PDF)
// =====================================================================
function koreksiArmyAlpha(alphaData) {
  if (!alphaData) {
    return { skor: 0, skorPersen: 0, log: "Tidak Dikerjakan" };
  }

  var benarCount = 0;
  var logList = [];

  function getInputs(soalId) {
    var item = alphaData[soalId];
    return item && item.inputan ? item.inputan.map(function(s) { return (s || "").toString().trim().toUpperCase(); }) : [];
  }
  function getCoret(soalId) {
    var item = alphaData[soalId];
    return item && item.dicoret ? item.dicoret.map(function(s) { return s.toString().trim(); }) : [];
  }
  function getGarisBawah(soalId) {
    var item = alphaData[soalId];
    return item && item.garisBawah ? item.garisBawah.map(function(s) { return s.toString().trim().toUpperCase(); }) : [];
  }
  function getIrisan(soalId) {
    var item = alphaData[soalId];
    return item && item.irisan ? item.irisan : {};
  }
  function getJalur(soalId) {
    var item = alphaData[soalId];
    return item && item.jalurTerpilih ? item.jalurTerpilih : "";
  }

  // Soal 1: Lingkaran ke-2 = X, Lingkaran ke-5 = huruf (bukan X dan tidak kosong)
  var inp1 = getInputs("ALP_1");
  var s1 = (inp1[1] === "X" && inp1[4] !== "X" && inp1[4] !== "" && inp1[4] !== undefined);
  if (s1) benarCount++;
  logList.push("N1:" + (s1 ? "B" : "S"));

  // Soal 2: Garis 3 ke 6 lewat bawah 4 dan atas 5
  var rute2 = getJalur("ALP_2");
  var s2 = (rute2 === "bawah4_atas5");
  if (s2) benarCount++;
  logList.push("N2:" + (s2 ? "B" : "S"));

  // Soal 3: Koma dalam lingkaran pertama & 'Tidak' tidak dicoret
  var inp3 = getInputs("ALP_3");
  var cor3 = getCoret("ALP_3");
  var s3 = (inp3[0] === "," || inp3[0] === ".") && (cor3.indexOf("Tidak") === -1 && cor3.indexOf("tidak") === -1);
  if (s3) benarCount++;
  logList.push("N3:" + (s3 ? "B" : "S"));

  // Soal 4: Lingkaran 3 = 7, Lingkaran 4 = kosong, Lingkaran 5 = jawaban salah (angka selain 7)
  var inp4 = getInputs("ALP_4");
  var s4 = (inp4[2] === "7" && (!inp4[3] || inp4[3] === "" || inp4[3] === "-") && inp4[4] !== "" && inp4[4] !== "7" && inp4[4] !== undefined);
  if (s4) benarCount++;
  logList.push("N4:" + (s4 ? "B" : "S"));

  // Soal 5: X di lingkaran luar segitiga, A di irisan segitiga-lingkaran
  var ir5 = getIrisan("ALP_5");
  var s5 = ((ir5.lingkaran_luar || "").toUpperCase() === "X" && (ir5.irisan || "").toUpperCase() === "A");
  if (s5) benarCount++;
  logList.push("N5:" + (s5 ? "B" : "S"));

  // Soal 6: X dalam segitiga luar bujur sangkar, Y dalam bujur sangkar-segitiga luar lingkaran
  var ir6 = getIrisan("ALP_6");
  var s6 = ((ir6.segitiga_non_kotak || "").toUpperCase() === "X" && (ir6.kotak_segitiga_non_lingkaran || "").toUpperCase() === "Y");
  if (s6) benarCount++;
  logList.push("N6:" + (s6 ? "B" : "S"));

  // Soal 7: Garis bawah di D, garis melintang di K
  var gb7 = getGarisBawah("ALP_7");
  var cor7 = getCoret("ALP_7");
  var s7 = (gb7.indexOf("D") !== -1 && cor7.indexOf("K") !== -1);
  if (s7) benarCount++;
  logList.push("N7:" + (s7 ? "B" : "S"));

  // Soal 8: Lingkaran 1 = A, Lingkaran 2 = A, Lingkaran 3 = G
  var inp8 = getInputs("ALP_8");
  var s8 = (inp8[0] === "A" && inp8[1] === "A" && inp8[2] === "G");
  if (s8) benarCount++;
  logList.push("N8:" + (s8 ? "B" : "S"));

  // Soal 9: Coret bilangan 33 dan 36
  var cor9 = getCoret("ALP_9");
  var s9 = (cor9.indexOf("33") !== -1 && cor9.indexOf("36") !== -1 && cor9.length === 2);
  if (s9) benarCount++;
  logList.push("N9:" + (s9 ? "B" : "S"));

  // Soal 10: Petak kecil (idx 0 & 3) = 8 atau 6, petak hampir paling besar (idx 2) = angka 1..5
  var inp10 = getInputs("ALP_10");
  var s10 = ((inp10[0] === "8" || inp10[0] === "6") &&
             (inp10[3] === "8" || inp10[3] === "6") &&
             (["1", "2", "3", "4", "5"].indexOf(inp10[2]) !== -1));
  if (s10) benarCount++;
  logList.push("N10:" + (s10 ? "B" : "S"));

  // Soal 11: Coret ganjil tanpa huruf luar segitiga [5, 9, 3] & genap berhuruf dalam lingkaran [6A]
  var cor11 = getCoret("ALP_11");
  var c0 = cor11.indexOf(0) !== -1 || cor11.indexOf("0") !== -1;
  var c1 = cor11.indexOf(1) !== -1 || cor11.indexOf("1") !== -1;
  var c3 = cor11.indexOf(3) !== -1 || cor11.indexOf("3") !== -1;
  var c7 = cor11.indexOf(7) !== -1 || cor11.indexOf("7") !== -1;
  var s11 = (c0 && c1 && c3 && c7 && cor11.length === 4);
  if (s11) benarCount++;
  logList.push("N11:" + (s11 ? "B" : "S"));

  // Soal 12: Coret angka 4
  var cor12 = getCoret("ALP_12");
  var s12 = (cor12.indexOf("4") !== -1 && cor12.length === 1);
  if (s12) benarCount++;
  logList.push("N12:" + (s12 ? "B" : "S"));

  var persentaseAlpha = Math.round((benarCount / 12) * 100);
  return {
    skor: benarCount,
    skorPersen: persentaseAlpha,
    log: logList.join(" | ")
  };
}

// =====================================================================
// KOREKSI RAC (TES KETELITIAN & KECEPATAN - 40 SOAL / 2 MENIT)
// =====================================================================
function koreksiRAC(jawabanRAC) {
  if (!jawabanRAC) {
    return { skor: 0, skorPersen: 0, log: "Tidak Dikerjakan" };
  }

  // Kunci Resmi 40 Soal RAC
  var kunciRAC = {
    "RAC_01": "SAMA",       "RAC_02": "TIDAK SAMA", "RAC_03": "SAMA",       "RAC_04": "TIDAK SAMA",
    "RAC_05": "SAMA",       "RAC_06": "SAMA",       "RAC_07": "TIDAK SAMA", "RAC_08": "SAMA",
    "RAC_09": "TIDAK SAMA", "RAC_10": "SAMA",       "RAC_11": "TIDAK SAMA", "RAC_12": "SAMA",
    "RAC_13": "SAMA",       "RAC_14": "TIDAK SAMA", "RAC_15": "SAMA",       "RAC_16": "TIDAK SAMA",
    "RAC_17": "SAMA",       "RAC_18": "SAMA",       "RAC_19": "SAMA",       "RAC_20": "TIDAK SAMA",
    "RAC_21": "SAMA",       "RAC_22": "TIDAK SAMA", "RAC_23": "SAMA",       "RAC_24": "SAMA",
    "RAC_25": "TIDAK SAMA", "RAC_26": "SAMA",       "RAC_27": "TIDAK SAMA", "RAC_28": "SAMA",
    "RAC_29": "SAMA",       "RAC_30": "SAMA",       "RAC_31": "SAMA",       "RAC_32": "TIDAK SAMA",
    "RAC_33": "SAMA",       "RAC_34": "SAMA",       "RAC_35": "TIDAK SAMA", "RAC_36": "SAMA",
    "RAC_37": "SAMA",       "RAC_38": "TIDAK SAMA", "RAC_39": "SAMA",       "RAC_40": "SAMA"
  };

  var benar = 0;
  var totalDijawab = 0;
  for (var key in kunciRAC) {
    if (jawabanRAC.hasOwnProperty(key)) {
      totalDijawab++;
      if (jawabanRAC[key] === kunciRAC[key]) {
        benar++;
      }
    }
  }

  var skorPersen = Math.round((benar / 40) * 100);
  return {
    skor: benar,
    totalDijawab: totalDijawab,
    skorPersen: skorPersen,
    log: "Benar:" + benar + "/40 (" + totalDijawab + " terjawab dalam 2 menit)"
  };
}

// =====================================================================
// SIMPAN HASIL AKHIR (PIPELINE 3 TAHAP: ARMY ALPHA, MATEMATIKA, RAC)
// =====================================================================
function simpanHasilUjian(dataKandidat) {
  var ss = SpreadsheetApp.openById("1J-Kxp7bmKqiLkkwQnk4YWxvQj7YQeOrZmc2sXNRsulA"); // GANTI ID SPREADSHEET JIKA PERLU
  var sheetHasil = ss.getSheetByName("HASIL_UJIAN");

  var headerLengkap = [
    "Waktu Submit", "Nama", "Email", "Posisi",
    "Skor Total (%)", "Army Alpha (12)", "Matematika (%)", "RAC Ketelitian (%)",
    "Detail Army Alpha", "Detail Matematika", "Detail RAC", "Status Pelanggaran"
  ];

  if (!sheetHasil) {
    sheetHasil = ss.insertSheet("HASIL_UJIAN");
    sheetHasil.appendRow(headerLengkap);
    sheetHasil.getRange("A1:L1").setFontWeight("bold").setBackground("#0056b3").setFontColor("white");
    sheetHasil.setFrozenRows(1);
  } else {
    var lastCol = sheetHasil.getLastColumn();
    if (lastCol <= 10) {
      sheetHasil.getRange(1, 1, 1, headerLengkap.length).setValues([headerLengkap]);
      sheetHasil.getRange(1, 1, 1, headerLengkap.length).setFontWeight("bold").setBackground("#0056b3").setFontColor("white");
    }
  }

  var sheetMatematika = ss.getSheetByName("SOAL_MATEMATIKA") || ss.getSheetByName("SOAL_HITUNGAN");
  var dataSheetMatematika = sheetMatematika ? sheetMatematika.getDataRange().getValues() : [];

  function koreksiMatematika(dataJawabanUser, dataSheet) {
    if (!dataJawabanUser) return { skor: 0, skorPersen: 0, log: "-" };
    var benar = 0; var totalSoal = 0; var detailLog = [];
    for (var key in dataJawabanUser) {
      if (dataJawabanUser.hasOwnProperty(key)) {
        totalSoal++;
        var parts = key.split("_");
        var barisExcel = parseInt(parts[parts.length - 1]) - 1;
        var kunciJawaban = (dataSheet[barisExcel] && dataSheet[barisExcel][7]) ? dataSheet[barisExcel][7].toString().trim().toLowerCase() : "";
        var jawabanUser  = dataJawabanUser[key].toString().trim().toLowerCase();

        if (kunciJawaban !== "" && jawabanUser === kunciJawaban) {
          benar++;
          detailLog.push("Brs" + (barisExcel + 1) + ":BENAR");
        } else {
          detailLog.push("Brs" + (barisExcel + 1) + ":SALAH(" + (jawabanUser === "-" ? "Kosong" : jawabanUser) + ")");
        }
      }
    }
    var persen = totalSoal > 0 ? Math.round((benar / totalSoal) * 100) : 0;
    return { skor: benar, skorPersen: persen, log: detailLog.join(" | ") };
  }

  // Koreksi Ketiga Tahap
  var hasilAlpha      = koreksiArmyAlpha(dataKandidat.alpha);
  var hasilMatematika = koreksiMatematika(dataKandidat.matematika, dataSheetMatematika);
  var hasilRAC        = koreksiRAC(dataKandidat.rac);

  // Rata-rata Skor Total (%) dari ketiga tahapan
  var totalSkor = Math.round((hasilAlpha.skorPersen + hasilMatematika.skorPersen + hasilRAC.skorPersen) / 3);

  var statusPelanggaran = (dataKandidat.pelanggaran >= 3)
    ? "DISKUALIFIKASI (" + dataKandidat.pelanggaran + "x)"
    : (dataKandidat.pelanggaran || 0) + " Peringatan";

  var waktuSubmitDetail = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");

  sheetHasil.appendRow([
    waktuSubmitDetail,
    dataKandidat.nama,
    dataKandidat.email,
    dataKandidat.posisi,
    totalSkor,
    hasilAlpha.skor + "/12 (" + hasilAlpha.skorPersen + "%)",
    hasilMatematika.skorPersen,
    hasilRAC.skor + "/40 (" + hasilRAC.skorPersen + "%)",
    hasilAlpha.log,
    hasilMatematika.log,
    hasilRAC.log,
    statusPelanggaran
  ]);

  // === UPDATE STATUS TOKEN → SELESAI ===
  var sheetToken = ss.getSheetByName("DATA_TOKEN");
  if (sheetToken) {
    var dataToken = sheetToken.getDataRange().getValues();
    for (var i = 1; i < dataToken.length; i++) {
      if (dataToken[i][0].toString().trim() === dataKandidat.token) {
        sheetToken.getRange(i + 1, 2).setValue("SELESAI");
        break;
      }
    }
  }

  return "Sukses";
}

function cekStatusToken(tokenInput) {
  var ss = SpreadsheetApp.openById("1J-Kxp7bmKqiLkkwQnk4YWxvQj7YQeOrZmc2sXNRsulA"); // GANTI ID SPREADSHEET JIKA PERLU
  var sheetToken = ss.getSheetByName("DATA_TOKEN");
  if (!sheetToken) return { status: "ERROR" };

  var dataToken = sheetToken.getDataRange().getValues();
  for (var i = 1; i < dataToken.length; i++) {
    if (dataToken[i][0].toString().trim() === tokenInput.trim()) {
      return { status: dataToken[i][1].toString().trim().toUpperCase() };
    }
  }
  return { status: "TIDAK DITEMUKAN" };
}
