import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Watermark } from './components/Watermark';
import { ProctorBadge } from './components/ProctorBadge';
import { ViolationModal } from './components/ViolationModal';
import { LoadingScreen } from './components/screens/LoadingScreen';
import { IntroScreen } from './components/screens/IntroScreen';
import { InstructionScreen } from './components/screens/InstructionScreen';
import { ArmyAlphaScreen } from './components/screens/ArmyAlphaScreen';
import { MatDasScreen } from './components/screens/MatDasScreen';
import { LatihanRACScreen } from './components/screens/LatihanRACScreen';
import { RACScreen } from './components/screens/RACScreen';
import { LockScreen } from './components/screens/LockScreen';

import {
  CandidateInfo,
  CandidateAnswers,
  QuestionItem,
  TestDatabase,
  SessionState,
  AlphaAnswerItem,
  ScreenType,
} from './types';
import { apiService } from './services/api';
import {
  DEFAULT_POSITIONS,
  DEFAULT_ALPHA_QUESTIONS,
  PAKET_MATEMATIKA_A,
  DEFAULT_RAC_QUESTIONS,
} from './data/mockData';

const SESSION_KEY = 'mim_ujian_state_v2';
const DEBOUNCE_MS = 3000;

// Instructions verbatim from INTRUKSI_TES_15a0d9ec.txt (strictly no test names mentioned in headings)
const TAHAP_1_INSTRUCTIONS = [
  'Tugas Anda mendengarkan setiap soal atau instruksi yang akan saya sampaikan.',
  'Karena apa yang saya sampaikan merupakan jawaban dari setiap soal tersebut.',
  'Saya hanya akan membacakan soal sebanyak satu kali dan tidak ada pengulangan.',
  'Apabila Anda bertanya saat waktu sudah dimulai, saya tidak akan menjawab apapun.',
  'Selama saya membacakan, Anda tidak boleh mengerjakan apapun. Dengarkan terlebih dahulu.',
  'Saat saya bilang, mulai, Anda baru boleh mengerjakan dan saat saya bilang, stop, Anda tidak boleh mengerjakan apapun karena saya akan melanjutkan pada soal selanjutnya.',
];

const TAHAP_2_INSTRUCTIONS = [
  'Dihadapan Anda terdapat 18 soal matematika sederhana.',
  'Anda diminta menyelesaikan soal tersebut dengan cepat dan teliti dalam waktu yang terbatas.',
  'Tidak diperkenankan menggunakan alat bantu hitung apapun, mencatat dan menyebarluaskan soal.',
  'Jika memerlukan tempat untuk coret-coret, Anda bisa menggunakan kertas kosong/HVS yang sudah disiapkan.',
];

const TAHAP_3_INSTRUCTIONS = [
  'Soal berjumlah 40 butir dimana pada setiap soal Anda diminta memilih apakah kedua tulisan/ deret angka/ gambar/ tanda yang tersedia pada soal SAMA (V) atau BERBEDA (X).',
  'Alokasi waktu pengerjaan adalah 2 MENIT. Kerjakan secepat dan seteliti mungkin.',
];

const TAHAP_3_EXAMPLES = [
  { soal: 'drab   |   drab', jawaban: 'SAMA (V)' },
  { soal: '9 5 4 3 7   |   9 4 5 3 7', jawaban: 'BERBEDA (X)' },
  { soal: '= + + = + =   |   = + = + =', jawaban: 'BERBEDA (X)' },
  { soal: 'P.T.SCARR   |   P.T.SCAR', jawaban: 'BERBEDA (X)' },
];

export const App: React.FC = () => {
  // App system states
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Mempersiapkan Sistem Ujian...');
  const [positions, setPositions] = useState<string[]>(DEFAULT_POSITIONS);
  const [initialToken, setInitialToken] = useState('');
  const [isWebView, setIsWebView] = useState(false);
  const [isStorageSupported, setIsStorageSupported] = useState(true);
  const [deviceId, setDeviceId] = useState('');

  // 3-Stage Pipeline Screen states
  // screen: 'loading' | 'intro' | 'alpha' | 'matematika' | 'rac' | 'lock'
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('loading');
  const [tahapSaatIni, setTahapSaatIni] = useState(0); // 0: intro, 1: alpha, 2: matematika, 3: rac, 4: lock
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockStatus, setLockStatus] = useState<'submitting' | 'success' | 'disqualified' | 'error'>('submitting');
  const [submitRetryCount, setSubmitRetryCount] = useState(0);
  const [paketMatematikaName, setPaketMatematikaName] = useState('Paket A');

  // Question database for all 3 stages
  const [dbData, setDbData] = useState<TestDatabase>({
    alpha: DEFAULT_ALPHA_QUESTIONS,
    matematika: PAKET_MATEMATIKA_A,
    rac: DEFAULT_RAC_QUESTIONS,
  });

  // Candidate answers state
  const [candidateAnswers, setCandidateAnswers] = useState<CandidateAnswers>({
    nama: '',
    email: '',
    posisi: '',
    token: '',
    pelanggaran: 0,
    alpha: {},
    matematika: {},
    rac: {},
  });

  // Unanswered list validation
  const [unansweredList, setUnansweredList] = useState<number[]>([]);

  // Anti-cheat modal state
  const [violationModalOpen, setViolationModalOpen] = useState(false);
  const [violationBannerVisible, setViolationBannerVisible] = useState(false);
  const [violationSource, setViolationSource] = useState<'tab' | 'devtools' | 'keys'>('tab');

  const timerIntervalRef = useRef<any>(null);
  const lastVisibilityHideRef = useRef<number>(0);
  const candidateAnswersRef = useRef(candidateAnswers);
  candidateAnswersRef.current = candidateAnswers;
  const tahapRef = useRef(tahapSaatIni);
  tahapRef.current = tahapSaatIni;

  // Check storage support
  const checkStorage = () => {
    try {
      localStorage.setItem('__test__', '1');
      localStorage.removeItem('__test__');
      return true;
    } catch (e) {
      return false;
    }
  };

  // Check WebView browser
  const checkIsWebView = () => {
    const ua = navigator.userAgent || '';
    return (
      /FBAN|FBAV|Instagram|Line\/|WhatsApp|; wv\)/i.test(ua) ||
      (/Android/i.test(ua) && !/Chrome\//i.test(ua) && /Version\//i.test(ua))
    );
  };

  // Check low memory device
  const checkLiteMode = () => {
    const ram = (navigator as any).deviceMemory;
    if (ram && ram <= 2) {
      document.body.classList.add('lite');
    }
  };

  // Save session state to localStorage
  const saveSession = (overrides?: Partial<SessionState>) => {
    if (!isStorageSupported) return;
    try {
      const stateToSave = {
        dbData,
        jawabanKandidat: candidateAnswersRef.current,
        tahapSaatIni: tahapRef.current,
        timerSisaDetik: timerSeconds,
        savedAt: Date.now(),
        ...overrides,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(stateToSave));
    } catch (e) {}
  };

  // Remove saved session
  const clearSession = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {}
  };

  // Initial startup logic
  useEffect(() => {
    let devId = localStorage.getItem('mim_device_id');
    if (!devId) {
      devId = 'DEV-' + Math.random().toString(36).substring(2, 11).toUpperCase();
      try {
        localStorage.setItem('mim_device_id', devId);
      } catch (e) {}
    }
    setDeviceId(devId);

    const storageOk = checkStorage();
    setIsStorageSupported(storageOk);
    setIsWebView(checkIsWebView());
    checkLiteMode();

    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      setInitialToken(tokenParam.toUpperCase().replace(/[^A-Z0-9-]/g, ''));
    }

    let savedSession: any = null;
    if (storageOk) {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.savedAt && Date.now() - parsed.savedAt <= 6 * 60 * 60 * 1000) {
            savedSession = parsed;
          } else {
            clearSession();
          }
        }
      } catch (e) {}
    }

    if (savedSession && savedSession.tahapSaatIni > 0 && savedSession.tahapSaatIni < 4) {
      setLoadingMessage('Memulihkan sesi ujian...');
      setCurrentScreen('loading');

      apiService
        .checkTokenStatus(savedSession.jawabanKandidat.token)
        .then((res) => {
          if (res.status === 'SEDANG DIKERJAKAN' || !res.error) {
            restoreSavedSession(savedSession);
          } else {
            clearSession();
            initializeNewSession();
          }
        })
        .catch(() => {
          restoreSavedSession(savedSession);
        });
    } else {
      initializeNewSession();
    }
  }, []);

  const initializeNewSession = async () => {
    try {
      const posList = await apiService.fetchPositions();
      setPositions(posList);
    } catch (e) {
      setPositions(DEFAULT_POSITIONS);
    } finally {
      setLoading(false);
      setCurrentScreen('intro');
    }
  };

  const restoreSavedSession = (saved: any) => {
    setDbData(saved.dbData || {
      alpha: DEFAULT_ALPHA_QUESTIONS,
      matematika: PAKET_MATEMATIKA_A,
      rac: DEFAULT_RAC_QUESTIONS,
    });
    setCandidateAnswers(saved.jawabanKandidat);
    setTahapSaatIni(saved.tahapSaatIni);
    const remainingTime = saved.timerSisaDetik || 25 * 60;
    setTimerSeconds(remainingTime);

    setLoading(false);
    if (saved.tahapSaatIni === 1) {
      setCurrentScreen('alpha');
    } else if (saved.tahapSaatIni === 2) {
      setCurrentScreen('matematika');
      startTimer(remainingTime);
    } else if (saved.tahapSaatIni === 3) {
      setCurrentScreen('rac');
    } else {
      setCurrentScreen('intro');
    }
  };

  // Timer interval controller for Matematika Dasar
  const startTimer = (durationSeconds: number) => {
    clearInterval(timerIntervalRef.current);
    setTimerSeconds(durationSeconds);

    let current = durationSeconds;
    timerIntervalRef.current = setInterval(() => {
      current -= 1;
      setTimerSeconds(current);

      if (current % 10 === 0) {
        saveSession({ timerSisaDetik: current });
      }

      if (current <= 0) {
        clearInterval(timerIntervalRef.current);
        handleTimerTimeout();
      }
    }, 1000);
  };

  const handleTimerTimeout = () => {
    alert('⏳ WAKTU HABIS! Jawaban Anda pada tahap ini akan otomatis disimpan.');
    if (tahapRef.current === 2) {
      transitionToStage3Instruction();
    }
  };

  // -------------------------------------------------------------
  // SECURITY & ANTI-CHEAT LISTENERS
  // -------------------------------------------------------------
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);

    const handleKeyDown = (e: KeyboardEvent) => {
      const blocked =
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'K'].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && ['U', 'S', 'A', 'P'].includes(e.key.toUpperCase())) ||
        e.key === 'PrintScreen';

      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      if (tahapRef.current > 0 && e.ctrlKey && ['C', 'V', 'X'].includes(e.key.toUpperCase())) {
        const activeTag = (document.activeElement as HTMLElement)?.tagName?.toLowerCase();
        if (activeTag !== 'input') e.preventDefault();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    const handleVisibilityChange = () => {
      if (!document.hidden) return;
      if (tahapRef.current < 1 || tahapRef.current >= 4) return;

      const now = Date.now();
      if (now - lastVisibilityHideRef.current < DEBOUNCE_MS) return;
      lastVisibilityHideRef.current = now;

      handleCheatViolation('tab');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const devToolsInterval = setInterval(() => {
      if (tahapRef.current < 1 || tahapRef.current >= 4 || isMobile) return;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > 160 || heightDiff > 160) {
        handleCheatViolation('devtools');
      }
    }, 2500);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(devToolsInterval);
    };
  }, []);

  const handleCheatViolation = (source: 'tab' | 'devtools' | 'keys') => {
    if (tahapRef.current < 1 || tahapRef.current >= 4) return;

    const newViolationCount = candidateAnswersRef.current.pelanggaran + 1;
    const updatedAnswers = {
      ...candidateAnswersRef.current,
      pelanggaran: newViolationCount,
    };
    setCandidateAnswers(updatedAnswers);
    candidateAnswersRef.current = updatedAnswers;
    saveSession({ jawabanKandidat: updatedAnswers });

    setViolationSource(source);

    if (newViolationCount >= 3) {
      clearInterval(timerIntervalRef.current);
      setTahapSaatIni(4);
      tahapRef.current = 4;
      setViolationModalOpen(false);
      setViolationBannerVisible(false);
      setCurrentScreen('lock');
      setLockStatus('disqualified');

      apiService.submitExam(updatedAnswers).catch(() => {});
      clearSession();
    } else {
      setViolationModalOpen(true);
      setViolationBannerVisible(true);
      setTimeout(() => setViolationBannerVisible(false), 4000);
    }
  };

  // -------------------------------------------------------------
  // START EXAM (Intro -> Tahap 1: Army Alpha)
  // -------------------------------------------------------------
  const handleStartExam = async (candidateData: CandidateInfo) => {
    setIsSubmitting(true);
    try {
      const verifyRes = await apiService.verifyCandidate({
        token: candidateData.token,
        nama: candidateData.nama,
        email: candidateData.email,
        posisi: candidateData.posisi,
        deviceId: deviceId || 'DEV-DEFAULT',
      });

      if (verifyRes.error) {
        alert(verifyRes.error);
        setIsSubmitting(false);
        return;
      }

      const mtkQuestions = verifyRes.matematika || PAKET_MATEMATIKA_A;
      setPaketMatematikaName(verifyRes.paketMatematika || 'Paket A');

      const newDb: TestDatabase = {
        alpha: DEFAULT_ALPHA_QUESTIONS,
        matematika: mtkQuestions,
        rac: DEFAULT_RAC_QUESTIONS,
      };
      setDbData(newDb);

      const updatedCandidateAnswers: CandidateAnswers = {
        nama: candidateData.nama,
        email: candidateData.email,
        posisi: candidateData.posisi,
        token: candidateData.token,
        pelanggaran: 0,
        alpha: {},
        matematika: {},
        rac: {},
      };
      setCandidateAnswers(updatedCandidateAnswers);
      candidateAnswersRef.current = updatedCandidateAnswers;

      // Start Tahap 1: Instruction Screen first
      setTahapSaatIni(1);
      tahapRef.current = 1;
      setCurrentScreen('instruction_1');

      saveSession({
        dbData: newDb,
        jawabanKandidat: updatedCandidateAnswers,
        tahapSaatIni: 1,
      });

      window.scrollTo(0, 0);
    } catch (err: any) {
      alert('Gagal memverifikasi ke server. Silakan coba sesaat lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // TRANSITION HANDLERS (Tahap 1 -> Tahap 2 -> Tahap 3 -> Submit)
  // -------------------------------------------------------------

  // Finish Tahap 1 -> Transition to Tahap 2 Instruction
  const handleFinishAlpha = (alphaAnswers: Record<string, AlphaAnswerItem>) => {
    const updated = {
      ...candidateAnswersRef.current,
      alpha: alphaAnswers,
    };
    setCandidateAnswers(updated);
    candidateAnswersRef.current = updated;

    alert('✅ Tahap 1 Selesai!\nSilakan lanjutkan ke petunjuk pelaksanaan Tahap 2.');
    transitionToStage2Instruction();
  };

  const transitionToStage2Instruction = () => {
    clearInterval(timerIntervalRef.current);
    setTahapSaatIni(2);
    tahapRef.current = 2;
    setCurrentScreen('instruction_2');

    saveSession({
      tahapSaatIni: 2,
    });

    window.scrollTo(0, 0);
  };

  const transitionToStage2MatDas = () => {
    clearInterval(timerIntervalRef.current);
    const duration = 25 * 60; // 25 Menit
    setCurrentScreen('matematika');
    startTimer(duration);

    saveSession({
      tahapSaatIni: 2,
      timerSisaDetik: duration,
    });

    window.scrollTo(0, 0);
  };

  // Answer selection for Tahap 2
  const handleSelectAnswerMatematika = (questionId: string, answer: string) => {
    const updated = {
      ...candidateAnswersRef.current,
      matematika: {
        ...candidateAnswersRef.current.matematika,
        [questionId]: answer,
      },
    };
    setCandidateAnswers(updated);
    candidateAnswersRef.current = updated;
    saveSession({ jawabanKandidat: updated });

    setUnansweredList((prev) => {
      const qIndex = dbData.matematika.findIndex((q) => q.id === questionId);
      return prev.filter((n) => n !== qIndex + 1);
    });
  };

  // Finish Tahap 2 -> Transition to Tahap 3 Instruction
  const handleFinishStage2MatDas = () => {
    const unanswered: number[] = [];
    const questionsToTest = dbData.matematika.length >= 18 ? dbData.matematika.slice(0, 18) : dbData.matematika;
    questionsToTest.forEach((q, idx) => {
      if (!candidateAnswers.matematika[q.id] || candidateAnswers.matematika[q.id] === '-') {
        unanswered.push(idx + 1);
      }
    });

    if (unanswered.length > 0) {
      setUnansweredList(unanswered);
      alert(
        `⚠️ Masih ada ${unanswered.length} soal yang belum dijawab!\n\nNomor: ${unanswered.join(
          ', '
        )}\n\nSilakan lengkapi jawaban Anda sebelum melanjutkan ke Tahap 3.`
      );
      return;
    }

    setUnansweredList([]);
    alert('✅ Tahap 2 Selesai!\nSilakan lanjutkan ke petunjuk pelaksanaan Tahap 3.');
    transitionToStage3Instruction();
  };

  const transitionToStage3Instruction = () => {
    clearInterval(timerIntervalRef.current);
    setTahapSaatIni(3);
    tahapRef.current = 3;
    setCurrentScreen('instruction_3');

    saveSession({
      tahapSaatIni: 3,
    });

    window.scrollTo(0, 0);
  };

  const transitionToStage3RAC = () => {
    clearInterval(timerIntervalRef.current);
    setCurrentScreen('rac');

    saveSession({
      tahapSaatIni: 3,
    });

    window.scrollTo(0, 0);
  };

  // Answer selection for Tahap 3
  const handleSelectAnswerRAC = (questionId: string, answer: 'SAMA' | 'TIDAK SAMA') => {
    const updated = {
      ...candidateAnswersRef.current,
      rac: {
        ...candidateAnswersRef.current.rac,
        [questionId]: answer,
      },
    };
    setCandidateAnswers(updated);
    candidateAnswersRef.current = updated;
    saveSession({ jawabanKandidat: updated });
  };

  // Finish Tahap 3 -> Final Submission
  const handleFinishRAC = () => {
    submitFinalExam();
  };

  // Final Exam Submission to Code.gs
  const submitFinalExam = async () => {
    clearInterval(timerIntervalRef.current);
    setTahapSaatIni(4);
    tahapRef.current = 4;
    setCurrentScreen('lock');
    setLockStatus('submitting');

    // Hitung skor MatDas secara presisi jika kunci tersedia di database lokal
    let skorMatDas = 0;
    if (dbData.matematika && dbData.matematika.length > 0) {
      dbData.matematika.forEach((q) => {
        const userAns = candidateAnswersRef.current.matematika[q.id];
        if (userAns && q.kunci && userAns.trim().toLowerCase() === q.kunci.trim().toLowerCase()) {
          skorMatDas++;
        }
      });
    }

    // Hitung skor RAC secara presisi
    let skorRAC = 0;
    if (dbData.rac && dbData.rac.length > 0) {
      dbData.rac.forEach((q) => {
        const userAns = candidateAnswersRef.current.rac[q.id];
        if (userAns && userAns === q.kunci) {
          skorRAC++;
        }
      });
    }

    const finalPayload: CandidateAnswers = {
      ...candidateAnswersRef.current,
      skorMatDas,
      skorRAC,
    };
    candidateAnswersRef.current = finalPayload;

    try {
      await apiService.submitExam(finalPayload);
      setLockStatus('success');
      clearSession();
    } catch (err) {
      setSubmitRetryCount((prev) => prev + 1);
      setLockStatus('error');
    }
  };

  const handleRetrySubmit = () => {
    submitFinalExam();
  };

  // Stage display info (strictly no test names mentioned in UI)
  const isTestActive = [
    'instruction_1',
    'alpha',
    'instruction_2',
    'matematika',
    'instruction_3',
    'latihan_rac',
    'rac',
  ].includes(currentScreen);

  const getStageHeaderName = () => {
    if (currentScreen === 'instruction_1' || currentScreen === 'alpha') return 'Tahap 1';
    if (currentScreen === 'instruction_2' || currentScreen === 'matematika') return 'Tahap 2';
    if (currentScreen === 'instruction_3' || currentScreen === 'latihan_rac' || currentScreen === 'rac') return 'Tahap 3';
    return undefined;
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-[#1e293b] flex flex-col font-sans">
      {/* Security Overlays */}
      <Watermark
        name={candidateAnswers.nama}
        email={candidateAnswers.email}
        visible={isTestActive}
      />

      <ProctorBadge visible={currentScreen !== 'loading' && currentScreen !== 'lock'} />

      <ViolationModal
        isOpen={violationModalOpen}
        violationCount={candidateAnswers.pelanggaran}
        source={violationSource}
        showBanner={violationBannerVisible}
        onDismiss={() => setViolationModalOpen(false)}
      />

      {/* Header */}
      <Header
        timerSeconds={timerSeconds}
        showTimer={currentScreen === 'matematika'}
        stageName={getStageHeaderName()}
      />

      {/* Main Content Area */}
      <main className="flex-1 container max-w-4xl mx-auto px-2 sm:px-4 pb-12">
        {currentScreen === 'loading' && (
          <LoadingScreen message={loadingMessage} />
        )}

        {currentScreen === 'intro' && (
          <IntroScreen
            positions={positions}
            initialToken={initialToken}
            isWebView={isWebView}
            isStorageSupported={isStorageSupported}
            onStartExam={handleStartExam}
            isLoading={isSubmitting}
          />
        )}

        {currentScreen === 'instruction_1' && (
          <InstructionScreen
            tahapNumber={1}
            subTitle="12 Butir Soal • Instruksi Audio"
            instructionText={TAHAP_1_INSTRUCTIONS}
            onStart={() => {
              setCurrentScreen('alpha');
              window.scrollTo(0, 0);
            }}
          />
        )}

        {currentScreen === 'alpha' && (
          <ArmyAlphaScreen
            questions={dbData.alpha}
            onFinishAlpha={handleFinishAlpha}
            onSkipAlpha={transitionToStage2Instruction}
          />
        )}

        {currentScreen === 'instruction_2' && (
          <InstructionScreen
            tahapNumber={2}
            subTitle="18 Butir Soal • Batas Waktu 25 Menit"
            instructionText={TAHAP_2_INSTRUCTIONS}
            onStart={transitionToStage2MatDas}
          />
        )}

        {currentScreen === 'matematika' && (
          <MatDasScreen
            questions={dbData.matematika}
            answers={candidateAnswers.matematika}
            onSelectAnswer={handleSelectAnswerMatematika}
            onFinishStage={handleFinishStage2MatDas}
            unansweredList={unansweredList}
            isSubmitting={isSubmitting}
          />
        )}

        {currentScreen === 'instruction_3' && (
          <InstructionScreen
            tahapNumber={3}
            subTitle="40 Butir Soal • Batas Waktu 2 Menit"
            instructionText={TAHAP_3_INSTRUCTIONS}
            examples={TAHAP_3_EXAMPLES}
            nextButtonLabel="Lanjut ke Latihan Soal"
            onStart={() => {
              setCurrentScreen('latihan_rac');
              window.scrollTo(0, 0);
            }}
          />
        )}

        {currentScreen === 'latihan_rac' && (
          <LatihanRACScreen
            onFinishLatihan={transitionToStage3RAC}
          />
        )}

        {currentScreen === 'rac' && (
          <RACScreen
            questions={dbData.rac}
            answers={candidateAnswers.rac}
            onSelectAnswer={handleSelectAnswerRAC}
            onFinishRAC={handleFinishRAC}
            isSubmitting={isSubmitting}
          />
        )}

        {currentScreen === 'lock' && (
          <LockScreen
            status={lockStatus}
            retryCount={submitRetryCount}
            onRetry={handleRetrySubmit}
            candidateName={candidateAnswers.nama}
            candidateEmail={candidateAnswers.email}
          />
        )}
      </main>
    </div>
  );
};

export default App;
