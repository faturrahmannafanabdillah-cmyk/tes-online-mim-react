import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Watermark } from './components/Watermark';
import { ProctorBadge } from './components/ProctorBadge';
import { ViolationModal } from './components/ViolationModal';
import { LoadingScreen } from './components/screens/LoadingScreen';
import { IntroScreen } from './components/screens/IntroScreen';
import { StandardTestScreen } from './components/screens/StandardTestScreen';
import { ArmyAlphaScreen } from './components/screens/ArmyAlphaScreen';
import { LockScreen } from './components/screens/LockScreen';

import {
  CandidateInfo,
  CandidateAnswers,
  QuestionItem,
  TestDatabase,
  SessionState,
} from './types';
import { apiService } from './services/api';
import {
  DEFAULT_POSITIONS,
  DEFAULT_VERBAL_QUESTIONS,
  DEFAULT_HITUNGAN_QUESTIONS,
  DEFAULT_ALPHA_QUESTIONS,
} from './data/mockData';

const SESSION_KEY = 'mim_ujian_state';
const DEBOUNCE_MS = 3000;

export const App: React.FC = () => {
  // App system states
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Mempersiapkan Sistem Ujian...');
  const [positions, setPositions] = useState<string[]>(DEFAULT_POSITIONS);
  const [initialToken, setInitialToken] = useState('');
  const [isWebView, setIsWebView] = useState(false);
  const [isStorageSupported, setIsStorageSupported] = useState(true);
  const [deviceId, setDeviceId] = useState('');

  // Exam flow states
  // screen: 'loading' | 'intro' | 'verbal' | 'hitungan' | 'alpha' | 'lock'
  const [currentScreen, setCurrentScreen] = useState<'loading' | 'intro' | 'verbal' | 'hitungan' | 'alpha' | 'lock'>('loading');
  const [tahapSaatIni, setTahapSaatIni] = useState(0); // 0: intro, 1: verbal, 2: hitungan, 3: lock, 4: alpha
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockStatus, setLockStatus] = useState<'submitting' | 'success' | 'disqualified' | 'error'>('submitting');
  const [submitRetryCount, setSubmitRetryCount] = useState(0);

  // Question database
  const [dbData, setDbData] = useState<TestDatabase>({
    verbal: DEFAULT_VERBAL_QUESTIONS,
    hitungan: DEFAULT_HITUNGAN_QUESTIONS,
    alpha: DEFAULT_ALPHA_QUESTIONS,
  });

  // Candidate answers state
  const [candidateAnswers, setCandidateAnswers] = useState<CandidateAnswers>({
    nama: '',
    email: '',
    posisi: '',
    token: '',
    pelanggaran: 0,
    verbal: {},
    hitungan: {},
    alpha: {},
  });

  // Unanswered validation flag list
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
    } catch (e) {
      // Ignore quota error
    }
  };

  // Remove saved session
  const clearSession = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {}
  };

  // Initial startup logic
  useEffect(() => {
    // 1. Device ID
    let devId = localStorage.getItem('mim_device_id');
    if (!devId) {
      devId = 'DEV-' + Math.random().toString(36).substring(2, 11).toUpperCase();
      try {
        localStorage.setItem('mim_device_id', devId);
      } catch (e) {}
    }
    setDeviceId(devId);

    // 2. Browser & Device Checks
    const storageOk = checkStorage();
    setIsStorageSupported(storageOk);
    setIsWebView(checkIsWebView());
    checkLiteMode();

    // 3. URL Token Query Param
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      setInitialToken(tokenParam.toUpperCase().replace(/[^A-Z0-9-]/g, ''));
    }

    // 4. Session Restore / Init
    let savedSession: any = null;
    if (storageOk) {
      try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          // If within 6 hours
          if (parsed.savedAt && Date.now() - parsed.savedAt <= 6 * 60 * 60 * 1000) {
            savedSession = parsed;
          } else {
            clearSession();
          }
        }
      } catch (e) {}
    }

    if (savedSession && savedSession.tahapSaatIni > 0 && savedSession.tahapSaatIni < 3) {
      setLoadingMessage('Memulihkan sesi ujian...');
      setCurrentScreen('loading');

      // Check token status with GAS backend
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
      verbal: DEFAULT_VERBAL_QUESTIONS,
      hitungan: DEFAULT_HITUNGAN_QUESTIONS,
    });
    setCandidateAnswers(saved.jawabanKandidat);
    setTahapSaatIni(saved.tahapSaatIni);
    const remainingTime = saved.timerSisaDetik || (saved.tahapSaatIni === 1 ? 15 * 60 : 45 * 60);
    setTimerSeconds(remainingTime);

    setLoading(false);
    if (saved.tahapSaatIni === 1) {
      setCurrentScreen('verbal');
      startTimer(remainingTime);
    } else if (saved.tahapSaatIni === 2) {
      setCurrentScreen('alpha');
    } else if (saved.tahapSaatIni === 3) {
      setCurrentScreen('hitungan');
      startTimer(remainingTime);
    } else {
      setCurrentScreen('intro');
    }
  };

  // Timer interval controller
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
    alert('⏳ WAKTU HABIS! Jawaban pada tahap ini akan otomatis disimpan.');
    if (tahapRef.current === 1) {
      transitionToStageAlpha();
    } else if (tahapRef.current === 3) {
      submitFinalExam();
    }
  };

  // -------------------------------------------------------------
  // SECURITY & ANTI-CHEAT LISTENERS
  // -------------------------------------------------------------
  useEffect(() => {
    // 1. Right Click Prevent
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);

    // 2. Keyboard shortcut block
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
        if (activeTag !== 'input') {
          e.preventDefault();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // 3. Tab visibility change detection
    const handleVisibilityChange = () => {
      if (!document.hidden) return;
      if (tahapRef.current < 1 || tahapRef.current === 3) return;

      const now = Date.now();
      if (now - lastVisibilityHideRef.current < DEBOUNCE_MS) return;
      lastVisibilityHideRef.current = now;

      handleCheatViolation('tab');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. DevTools window size detection
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const devToolsInterval = setInterval(() => {
      if (tahapRef.current < 1 || tahapRef.current === 3 || isMobile) return;
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
    if (tahapRef.current < 1 || tahapRef.current === 3) return;

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
      // Disqualification triggered
      clearInterval(timerIntervalRef.current);
      setTahapSaatIni(3);
      tahapRef.current = 3;
      setViolationModalOpen(false);
      setViolationBannerVisible(false);
      setCurrentScreen('lock');
      setLockStatus('disqualified');

      // Submit forced violation result
      apiService.submitExam(updatedAnswers).catch(() => {});
      clearSession();
    } else {
      setViolationModalOpen(true);
      setViolationBannerVisible(true);
      setTimeout(() => {
        setViolationBannerVisible(false);
      }, 4000);
    }
  };

  // -------------------------------------------------------------
  // START EXAM (Intro -> Stage 1 Verbal)
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

      const verbalQs = verifyRes.verbal || DEFAULT_VERBAL_QUESTIONS;
      const hitunganQs = verifyRes.hitungan || DEFAULT_HITUNGAN_QUESTIONS;

      const newDb: TestDatabase = {
        verbal: verbalQs,
        hitungan: hitunganQs,
        alpha: DEFAULT_ALPHA_QUESTIONS,
      };
      setDbData(newDb);

      const updatedCandidateAnswers: CandidateAnswers = {
        nama: candidateData.nama,
        email: candidateData.email,
        posisi: candidateData.posisi,
        token: candidateData.token,
        pelanggaran: 0,
        verbal: {},
        hitungan: {},
        alpha: {},
      };
      setCandidateAnswers(updatedCandidateAnswers);
      candidateAnswersRef.current = updatedCandidateAnswers;

      setTahapSaatIni(1);
      tahapRef.current = 1;
      const duration = 15 * 60; // 15 Menit
      setCurrentScreen('verbal');
      startTimer(duration);

      saveSession({
        dbData: newDb,
        jawabanKandidat: updatedCandidateAnswers,
        tahapSaatIni: 1,
        timerSisaDetik: duration,
      });

      window.scrollTo(0, 0);
    } catch (err: any) {
      alert('Gagal memverifikasi ke server. Silakan coba sesaat lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Answer selection handler for Verbal & Hitungan
  const handleSelectAnswer = (questionId: string, answer: string) => {
    const isVerbal = currentScreen === 'verbal';
    const targetKey = isVerbal ? 'verbal' : 'hitungan';

    const updated = {
      ...candidateAnswersRef.current,
      [targetKey]: {
        ...candidateAnswersRef.current[targetKey],
        [questionId]: answer,
      },
    };

    setCandidateAnswers(updated);
    candidateAnswersRef.current = updated;
    saveSession({ jawabanKandidat: updated });

    // Clear unanswered flag if resolved
    setUnansweredList((prev) => {
      const questions = isVerbal ? dbData.verbal : dbData.hitungan;
      const qIndex = questions.findIndex((q) => q.id === questionId);
      return prev.filter((n) => n !== qIndex + 1);
    });
  };

  // Check unanswered questions
  const getUnansweredQuestions = (questions: QuestionItem[], currentAnswers: Record<string, string>) => {
    const list: number[] = [];
    questions.forEach((q, idx) => {
      if (!currentAnswers[q.id] || currentAnswers[q.id] === '-') {
        list.push(idx + 1);
      }
    });
    return list;
  };

  // Finish Stage 1 (Verbal) -> Stage 2 (Army Alpha)
  const handleFinishStage1 = () => {
    const unanswered = getUnansweredQuestions(dbData.verbal, candidateAnswers.verbal);
    if (unanswered.length > 0) {
      setUnansweredList(unanswered);
      alert(
        `⚠️ Masih ada ${unanswered.length} soal yang belum dijawab!\n\nNomor: ${unanswered.join(
          ', '
        )}\n\nSilakan lengkapi jawaban Anda sebelum melanjutkan.`
      );
      return;
    }

    setUnansweredList([]);
    transitionToStageAlpha();
  };

  const transitionToStageAlpha = () => {
    clearInterval(timerIntervalRef.current);
    alert('✅ Tahap 1 Selesai!\nSiap masuk ke Tahap 2: Tes Army Alpha (12 Nomor).');

    setTahapSaatIni(2);
    tahapRef.current = 2;
    setCurrentScreen('alpha');

    saveSession({
      tahapSaatIni: 2,
    });

    window.scrollTo(0, 0);
  };

  // Finish Stage 2 (Army Alpha) -> Stage 3 (Hitungan)
  const handleFinishAlpha = (alphaAnswers: any) => {
    const updated = {
      ...candidateAnswersRef.current,
      alpha: alphaAnswers,
    };
    setCandidateAnswers(updated);
    candidateAnswersRef.current = updated;

    alert('✅ Tes Army Alpha Selesai!\nSiap masuk ke Tahap 3: Tes Berhitung (45 Menit).');
    transitionToStage3();
  };

  const transitionToStage3 = () => {
    clearInterval(timerIntervalRef.current);
    setTahapSaatIni(3);
    tahapRef.current = 3;
    const duration = 45 * 60; // 45 Menit
    setCurrentScreen('hitungan');
    startTimer(duration);

    saveSession({
      tahapSaatIni: 3,
      timerSisaDetik: duration,
    });

    window.scrollTo(0, 0);
  };

  // Finish Stage 3 (Hitungan) -> Submit Final Exam
  const handleFinishStage3 = () => {
    const unanswered = getUnansweredQuestions(dbData.hitungan, candidateAnswers.hitungan);
    if (unanswered.length > 0) {
      setUnansweredList(unanswered);
      alert(
        `⚠️ Masih ada ${unanswered.length} soal yang belum dijawab!\n\nNomor: ${unanswered.join(
          ', '
        )}\n\nSilakan lengkapi jawaban Anda sebelum mengirim.`
      );
      return;
    }

    setUnansweredList([]);
    submitFinalExam();
  };

  // Final Exam Submission
  const submitFinalExam = async () => {
    clearInterval(timerIntervalRef.current);
    setTahapSaatIni(4);
    tahapRef.current = 4;
    setCurrentScreen('lock');
    setLockStatus('submitting');

    try {
      await apiService.submitExam(candidateAnswersRef.current);
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

  // Get active test title and stage header name
  const isTestActive = currentScreen === 'verbal' || currentScreen === 'hitungan' || currentScreen === 'alpha';

  const getStageHeaderName = () => {
    if (currentScreen === 'verbal') return 'Tahap 1: Verbal';
    if (currentScreen === 'alpha') return 'Tahap 2: Army Alpha';
    if (currentScreen === 'hitungan') return 'Tahap 3: Berhitung';
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
        showTimer={isTestActive}
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

        {currentScreen === 'verbal' && (
          <StandardTestScreen
            stageNumber={1}
            stageTitle="Tahap 1: Tes Verbal (15 Menit)"
            questions={dbData.verbal}
            answers={candidateAnswers.verbal}
            onSelectAnswer={handleSelectAnswer}
            onFinishStage={handleFinishStage1}
            unansweredList={unansweredList}
            isSubmitting={isSubmitting}
          />
        )}

        {currentScreen === 'alpha' && (
          <ArmyAlphaScreen
            questions={dbData.alpha}
            onFinishAlpha={handleFinishAlpha}
            onSkipAlpha={() => transitionToStage3()}
          />
        )}

        {currentScreen === 'hitungan' && (
          <StandardTestScreen
            stageNumber={3}
            stageTitle="Tahap 3: Tes Berhitung (45 Menit)"
            questions={dbData.hitungan}
            answers={candidateAnswers.hitungan}
            onSelectAnswer={handleSelectAnswer}
            onFinishStage={handleFinishStage3}
            unansweredList={unansweredList}
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
