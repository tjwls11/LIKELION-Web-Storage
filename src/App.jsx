import { useEffect, useRef, useState } from 'react';
import { steps } from './data/steps.js';
import { validators } from './utils/validators.js';
import { buildPreviewHTML } from './utils/previewBuilder.js';
import {
  getClientPrivilegeState,
  getStoredSession,
  logout,
  seedOperatorUser,
} from './utils/auth.js';
import {
  ensureRuntimeState,
  getParticipantState,
  markParticipantOffline,
  recordBonusEntry,
  recordMissionSubmission,
  subscribeParticipants,
  subscribeRuntimeState,
  subscribeSubmissions,
  updateParticipantStatus,
} from './utils/trainingStore.js';
import AuthScreen from './components/AuthScreen.jsx';
import EditorLayout from './components/EditorLayout.jsx';
import AllDoneScreen from './components/AllDoneScreen.jsx';
import AdminBonusScreen from './components/AdminBonusScreen.jsx';
import StepIntroScreen from './components/StepIntroScreen.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';

function serializeAnswer(code) {
  return JSON.stringify(code);
}

export default function App() {
  const [screen, setScreen] = useState('auth');
  const [currentUser, setCurrentUser] = useState(null);
  const [runtime, setRuntime] = useState({
    missionStarted: false,
    startedSteps: [false, false, false],
    currentSlide: 0,
    leaderboardVisible: true,
  });
  const [participants, setParticipants] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [missionIndex, setMissionIndex] = useState(0);
  const [code, setCode] = useState(steps[0].initialCode);
  const [missionResult, setMissionResult] = useState(null);
  const [missionFailCounts, setMissionFailCounts] = useState({});
  const [showStepModal, setShowStepModal] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [bonusEntry, setBonusEntry] = useState(null);

  const iframeRef = useRef(null);
  const debounceRef = useRef(null);
  const [previewHTML, setPreviewHTML] = useState(() =>
    buildPreviewHTML(
      steps[0].initialCode.html,
      steps[0].initialCode.css,
      steps[0].initialCode.js,
    ),
  );

  const currentStep = steps[stepIndex];
  const currentMission = currentStep.missions[missionIndex];
  const hasPresentationGate = stepIndex === 2;
  const totalMissions = steps.reduce((count, step) => count + step.missions.length, 0);
  const doneMissions =
    completedSteps.reduce((count, completedStepIndex) => count + steps[completedStepIndex].missions.length, 0) +
    (missionResult === 'pass' ? missionIndex + 1 : missionIndex);

  function restoreProgress(userState) {
    const solvedMissionIds = Array.isArray(userState?.solvedMissionIds) ? userState.solvedMissionIds : [];
    const nextCompletedSteps = [];
    let nextStepIndex = 0;
    let nextMissionIndex = 0;
    let foundNextMission = false;

    for (let stepCursor = 0; stepCursor < steps.length; stepCursor += 1) {
      const step = steps[stepCursor];
      const firstUnsolvedMissionIndex = step.missions.findIndex(
        (mission) => !solvedMissionIds.includes(mission.id),
      );

      if (firstUnsolvedMissionIndex === -1) {
        nextCompletedSteps.push(stepCursor);
        continue;
      }

      nextStepIndex = stepCursor;
      nextMissionIndex = firstUnsolvedMissionIndex;
      foundNextMission = true;
      break;
    }

    if (!foundNextMission && steps.length > 0) {
      nextStepIndex = steps.length - 1;
      nextMissionIndex = steps[nextStepIndex].missions.length - 1;
    }

    setStepIndex(nextStepIndex);
    setMissionIndex(nextMissionIndex);
    setCompletedSteps(nextCompletedSteps);

    return {
      nextStepIndex,
      nextMissionIndex,
      nextCompletedSteps,
    };
  }

  useEffect(() => {
    const boot = async () => {
      await seedOperatorUser();
      await ensureRuntimeState(steps.reduce((count, step) => count + (step.presentation?.slides?.length ?? 0), 0));
    };

    boot();
  }, []);

  useEffect(() => subscribeRuntimeState(setRuntime), []);
  useEffect(() => subscribeParticipants(setParticipants), []);
  useEffect(() => subscribeSubmissions(setSubmissions), []);

  useEffect(() => {
    if (currentUser) return;

    const storedSession = getStoredSession();
    if (!storedSession) return;

    const restoreSession = async () => {
      setCurrentUser(storedSession);

      if (storedSession.role === 'operator') {
        setScreen('admin');
        return;
      }

      const userState = await getParticipantState(storedSession.username);
      const { nextStepIndex } = restoreProgress(userState);
      const currentStepStarted = runtime.startedSteps?.[nextStepIndex] ?? false;
      const nextScreen = nextStepIndex !== 2 || currentStepStarted ? 'editor' : 'waiting';

      setScreen(nextScreen);
    };

    restoreSession();
  }, [currentUser, runtime.startedSteps]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPreviewHTML(buildPreviewHTML(code.html, code.css, code.js));
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [code]);

  useEffect(() => {
    const freshCode = steps[stepIndex].initialCode;
    setCode(freshCode);
    setMissionIndex(0);
    setMissionResult(null);
    setMissionFailCounts({});
    setShowStepModal(false);
    setPreviewHTML(buildPreviewHTML(freshCode.html, freshCode.css, freshCode.js));
  }, [stepIndex]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'participant') return;

    if (screen === 'done' || screen === 'bonus') return;

    const currentStepStarted = runtime.startedSteps?.[stepIndex] ?? false;
    setScreen(!hasPresentationGate || currentStepStarted ? 'editor' : 'waiting');
  }, [currentUser, runtime.startedSteps, stepIndex, screen, hasPresentationGate]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'participant') return;

    updateParticipantStatus(currentUser.username, {
      isOnline: true,
      currentScreen: screen,
      currentStep: stepIndex,
      currentMission: missionIndex,
      completedSteps,
    }).catch((error) => console.error(error));
  }, [currentUser, screen, stepIndex, missionIndex, completedSteps]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'participant') return;

    const checkBonus = async () => {
      const privilegeState = getClientPrivilegeState();

      if (!privilegeState.canAccessBonus || screen === 'bonus') return;

      const entry = await recordBonusEntry(currentUser.username);
      setBonusEntry(entry);
      setScreen('bonus');
    };

    checkBonus();
    const intervalId = setInterval(checkBonus, 1000);

    return () => clearInterval(intervalId);
  }, [currentUser, screen]);

  async function handleLogin(user) {
    setCurrentUser(user);
    setBonusEntry(null);

    if (user.role === 'operator') {
      setScreen('admin');
      return;
    }

    const userState = await getParticipantState(user.username);
    const { nextStepIndex, nextMissionIndex, nextCompletedSteps } = restoreProgress(userState);

    await updateParticipantStatus(user.username, {
      isOnline: true,
      currentScreen: nextStepIndex !== 2 || runtime.startedSteps?.[nextStepIndex] ? 'editor' : 'waiting',
      currentStep: nextStepIndex,
      currentMission: nextMissionIndex,
      completedSteps: nextCompletedSteps,
    });

    setScreen(nextStepIndex !== 2 || runtime.startedSteps?.[nextStepIndex] ? 'editor' : 'waiting');
  }

  async function handleLogout() {
    if (currentUser?.role === 'participant') {
      await markParticipantOffline(currentUser.username);
    }

    logout();
    setCurrentUser(null);
    setBonusEntry(null);
    setStepIndex(0);
    setMissionIndex(0);
    setCode(steps[0].initialCode);
    setMissionResult(null);
    setShowStepModal(false);
    setCompletedSteps([]);
    setScreen('auth');
  }

  async function handleValidate() {
    if (!iframeRef.current || missionResult === 'checking' || !currentUser) return;

    setMissionResult('checking');

    const validatorFn = validators[currentMission.validateFn];
    if (!validatorFn) {
      setMissionResult('fail');
      return;
    }

    try {
      const passed = await validatorFn(iframeRef.current);
      const result = passed ? 'pass' : 'fail';

      setMissionResult(result);
      if (!passed) {
        setMissionFailCounts((prev) => ({
          ...prev,
          [currentMission.id]: (prev[currentMission.id] ?? 0) + 1,
        }));
      }

      await recordMissionSubmission({
        username: currentUser.username,
        missionId: currentMission.id,
        answer: serializeAnswer(code),
        isCorrect: passed,
        stepIndex,
        missionIndex,
      });

      if (passed && missionIndex === currentStep.missions.length - 1) {
        setTimeout(() => setShowStepModal(true), 500);
      }
    } catch (error) {
      console.error(error);
      setMissionResult('fail');
    }
  }

  function handleNextMission() {
    if (missionIndex >= currentStep.missions.length - 1) return;

    setMissionIndex((currentValue) => currentValue + 1);
    setMissionResult(null);
  }

  function handleNextStep() {
    setCompletedSteps((previous) => [...previous, stepIndex]);
    setShowStepModal(false);
    setMissionIndex(0);

    if (stepIndex < steps.length - 1) {
      setStepIndex((currentValue) => currentValue + 1);
      const nextStepIndex = stepIndex + 1;
      const nextNeedsPresentationGate = nextStepIndex === 2;
      setScreen(!nextNeedsPresentationGate || runtime.startedSteps?.[nextStepIndex] ? 'editor' : 'waiting');
      return;
    }

    setScreen('done');
  }

  function handleRestart() {
    setStepIndex(0);
    setMissionIndex(0);
    setCode(steps[0].initialCode);
    setMissionResult(null);
    setMissionFailCounts({});
    setShowStepModal(false);
    setCompletedSteps([]);
    setScreen('editor');
  }

  if (screen === 'auth') {
    return <AuthScreen onLogin={handleLogin} />;
  }

  function handlePreviewStep(index) {
    setStepIndex(index);
    setMissionIndex(0);
    setMissionResult(null);
    setShowStepModal(false);
    setScreen('editor');
  }

  if (screen === 'admin') {
    return <AdminDashboard steps={steps} runtime={runtime} onLogout={handleLogout} onPreviewStep={handlePreviewStep} />;
  }

  if (screen === 'bonus') {
    return (
      <AdminBonusScreen
        currentUser={currentUser?.username}
        bonusEntry={bonusEntry}
        onLogout={handleLogout}
      />
    );
  }

  if (screen === 'done') {
    return (
      <AllDoneScreen
        onRestart={handleRestart}
        currentUser={currentUser?.username}
        leaderboardVisible={runtime.leaderboardVisible}
        participants={participants}
        submissions={submissions}
      />
    );
  }

  if (screen === 'waiting') {
    return (
      <StepIntroScreen
        currentStep={currentStep}
        sessionOpen={runtime.startedSteps?.[stepIndex] ?? false}
        currentUser={currentUser?.username}
        onLogout={handleLogout}
        onEnterSession={() => setScreen('editor')}
      />
    );
  }

  return (
    <EditorLayout
      steps={steps}
      stepIndex={stepIndex}
      missionIndex={missionIndex}
      currentStep={currentStep}
      currentMission={currentMission}
      code={code}
      onCodeChange={setCode}
      previewHTML={previewHTML}
      iframeRef={iframeRef}
      missionResult={missionResult}
      onValidate={handleValidate}
      onNextMission={handleNextMission}
      onNextStep={handleNextStep}
      showStepModal={showStepModal}
      onCloseModal={() => setShowStepModal(false)}
      completedSteps={completedSteps}
      totalMissions={totalMissions}
      doneMissions={doneMissions}
      missionFailCount={missionFailCounts[currentMission.id] ?? 0}
      currentUser={currentUser?.username}
      onLogout={handleLogout}
      isAdminPreview={currentUser?.role === 'operator'}
      onAdminBackToDashboard={() => setScreen('admin')}
      onAdminNavStep={(index) => {
        setStepIndex(index);
        setMissionIndex(0);
        setMissionResult(null);
        setShowStepModal(false);
      }}
      onAdminNavMission={(index) => {
        setMissionIndex(index);
        setMissionResult(null);
      }}
    />
  );
}
