import { db } from './firebase.js';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  runTransaction,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

const RUNTIME_COLLECTION = 'runtime';
const RUNTIME_DOC_ID = 'control';

const LOCAL_USERS_KEY = 'likelion_local_users';
const LOCAL_RUNTIME_KEY = 'likelion_local_runtime';
const LOCAL_SUBMISSIONS_KEY = 'likelion_local_submissions';
const LOCAL_BONUS_KEY = 'likelion_local_bonus_entries';

function runtimeRef() {
  return doc(db, RUNTIME_COLLECTION, RUNTIME_DOC_ID);
}

function isPermissionDenied(error) {
  return error?.code === 'permission-denied' || String(error?.message ?? '').includes('permission-denied');
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeRuntimeState(data = {}, totalSlides = 0) {
  const startedSteps = Array.isArray(data.startedSteps) ? [...data.startedSteps] : [false, false, false];

  while (startedSteps.length < 3) startedSteps.push(false);

  return {
    missionStarted: startedSteps.some(Boolean),
    startedSteps: startedSteps.slice(0, 3),
    currentSlide: data.currentSlide ?? 0,
    leaderboardVisible: data.leaderboardVisible ?? true,
    bonusWinners: data.bonusWinners ?? [],
    totalSlides: data.totalSlides ?? totalSlides,
    updatedAt: data.updatedAt ?? Date.now(),
  };
}

function getLocalUsers() {
  return readJSON(LOCAL_USERS_KEY, {});
}

function setLocalUsers(users) {
  writeJSON(LOCAL_USERS_KEY, users);
}

function getLocalRuntime() {
  return normalizeRuntimeState(readJSON(LOCAL_RUNTIME_KEY, {}));
}

function setLocalRuntime(runtime) {
  writeJSON(LOCAL_RUNTIME_KEY, normalizeRuntimeState(runtime));
}

function getLocalSubmissions() {
  return readJSON(LOCAL_SUBMISSIONS_KEY, []);
}

function setLocalSubmissions(entries) {
  writeJSON(LOCAL_SUBMISSIONS_KEY, entries);
}

function getLocalBonusEntries() {
  return readJSON(LOCAL_BONUS_KEY, []);
}

function setLocalBonusEntries(entries) {
  writeJSON(LOCAL_BONUS_KEY, entries);
}

export function getLocalUser(username) {
  return getLocalUsers()[username] ?? null;
}

export function saveLocalUser(user) {
  const users = getLocalUsers();
  users[user.username] = user;
  setLocalUsers(users);
}

export async function getParticipantState(username) {
  try {
    const snap = await getDoc(doc(db, 'users', username));
    if (!snap.exists()) return null;
    return snap.data();
  } catch (error) {
    if (!isPermissionDenied(error)) throw error;
    return getLocalUser(username);
  }
}

export async function ensureRuntimeState(totalSlides) {
  try {
    const ref = runtimeRef();
    const snap = await getDoc(ref);
    const normalizedState = normalizeRuntimeState(snap.exists() ? snap.data() : {}, totalSlides);
    await setDoc(ref, normalizedState, { merge: true });
  } catch (error) {
    if (!isPermissionDenied(error)) throw error;
    setLocalRuntime({
      ...getLocalRuntime(),
      totalSlides,
    });
  }
}

export function subscribeRuntimeState(callback) {
  let active = true;

  const readRuntime = async () => {
    try {
      const snap = await getDoc(runtimeRef());
      if (!active) return;
      callback(normalizeRuntimeState(snap.exists() ? snap.data() : {}));
    } catch (error) {
      if (!active) return;
      if (!isPermissionDenied(error)) {
        console.error('Failed to read runtime state', error);
      }
      callback(getLocalRuntime());
    }
  };

  readRuntime();
  const intervalId = setInterval(readRuntime, 1000);

  return () => {
    active = false;
    clearInterval(intervalId);
  };
}

export function subscribeParticipants(callback) {
  let unsubscribe = null;
  let useLocalFallback = false;

  try {
    unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const users = snapshot.docs
        .map((entry) => entry.data())
        .filter((user) => user.role === 'participant')
        .sort((left, right) => {
          if ((right.score ?? 0) !== (left.score ?? 0)) return (right.score ?? 0) - (left.score ?? 0);
          return (left.createdAt ?? 0) - (right.createdAt ?? 0);
        });

      callback(users);
    }, (error) => {
      if (!isPermissionDenied(error)) {
        console.error(error);
      }
      useLocalFallback = true;
      const users = Object.values(getLocalUsers())
        .filter((user) => user.role === 'participant')
        .sort((left, right) => (right.score ?? 0) - (left.score ?? 0));
      callback(users);
    });
  } catch (error) {
    if (!isPermissionDenied(error)) {
      console.error(error);
    }
    useLocalFallback = true;
  }

  const intervalId = setInterval(() => {
    if (!useLocalFallback) return;
    const users = Object.values(getLocalUsers())
      .filter((user) => user.role === 'participant')
      .sort((left, right) => (right.score ?? 0) - (left.score ?? 0));
    callback(users);
  }, 1000);

  return () => {
    if (unsubscribe) unsubscribe();
    clearInterval(intervalId);
  };
}

export function subscribeSubmissions(callback) {
  let unsubscribe = null;
  let useLocalFallback = false;

  try {
    unsubscribe = onSnapshot(collection(db, 'submissions'), (snapshot) => {
      const submissions = snapshot.docs
        .map((entry) => ({ id: entry.id, ...entry.data() }))
        .sort((left, right) => (right.submittedAt ?? 0) - (left.submittedAt ?? 0));

      callback(submissions);
    }, (error) => {
      if (!isPermissionDenied(error)) {
        console.error(error);
      }
      useLocalFallback = true;
      callback(getLocalSubmissions().sort((left, right) => (right.submittedAt ?? 0) - (left.submittedAt ?? 0)));
    });
  } catch (error) {
    if (!isPermissionDenied(error)) {
      console.error(error);
    }
    useLocalFallback = true;
  }

  const intervalId = setInterval(() => {
    if (!useLocalFallback) return;
    callback(getLocalSubmissions().sort((left, right) => (right.submittedAt ?? 0) - (left.submittedAt ?? 0)));
  }, 1000);

  return () => {
    if (unsubscribe) unsubscribe();
    clearInterval(intervalId);
  };
}

export function subscribeBonusEntries(callback) {
  let unsubscribe = null;
  let useLocalFallback = false;

  try {
    unsubscribe = onSnapshot(collection(db, 'bonusEntries'), (snapshot) => {
      const entries = snapshot.docs
        .map((entry) => entry.data())
        .sort((left, right) => (left.enteredAt ?? 0) - (right.enteredAt ?? 0));

      callback(entries);
    }, (error) => {
      if (!isPermissionDenied(error)) {
        console.error(error);
      }
      useLocalFallback = true;
      callback(getLocalBonusEntries().sort((left, right) => (left.enteredAt ?? 0) - (right.enteredAt ?? 0)));
    });
  } catch (error) {
    if (!isPermissionDenied(error)) {
      console.error(error);
    }
    useLocalFallback = true;
  }

  const intervalId = setInterval(() => {
    if (!useLocalFallback) return;
    callback(getLocalBonusEntries().sort((left, right) => (left.enteredAt ?? 0) - (right.enteredAt ?? 0)));
  }, 1000);

  return () => {
    if (unsubscribe) unsubscribe();
    clearInterval(intervalId);
  };
}

export async function setStepSessionOpen(stepIndex, isOpen) {
  try {
    const snap = await getDoc(runtimeRef());
    const current = normalizeRuntimeState(snap.exists() ? snap.data() : {});
    const startedSteps = [...current.startedSteps];
    startedSteps[stepIndex] = isOpen;

    await setDoc(runtimeRef(), {
      missionStarted: startedSteps.some(Boolean),
      startedSteps,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (error) {
    if (!isPermissionDenied(error)) throw error;

    const current = getLocalRuntime();
    const startedSteps = [...current.startedSteps];
    startedSteps[stepIndex] = isOpen;
    setLocalRuntime({
      ...current,
      startedSteps,
      missionStarted: startedSteps.some(Boolean),
      updatedAt: Date.now(),
    });
  }
}

export async function setLeaderboardVisible(leaderboardVisible) {
  try {
    await setDoc(runtimeRef(), { leaderboardVisible, updatedAt: Date.now() }, { merge: true });
  } catch (error) {
    if (!isPermissionDenied(error)) throw error;
    setLocalRuntime({
      ...getLocalRuntime(),
      leaderboardVisible,
      updatedAt: Date.now(),
    });
  }
}

export async function updateParticipantStatus(username, patch) {
  try {
    await setDoc(doc(db, 'users', username), { ...patch, lastSeen: Date.now() }, { merge: true });
  } catch (error) {
    if (!isPermissionDenied(error)) throw error;
    const users = getLocalUsers();
    users[username] = {
      ...(users[username] ?? {}),
      username,
      id: username,
      role: users[username]?.role ?? 'participant',
      score: users[username]?.score ?? 0,
      solvedMissionIds: users[username]?.solvedMissionIds ?? [],
      ...patch,
      lastSeen: Date.now(),
    };
    setLocalUsers(users);
  }
}

export async function markParticipantOffline(username) {
  if (!username) return;
  await updateParticipantStatus(username, { isOnline: false });
}

export async function recordMissionSubmission({
  username,
  missionId,
  answer,
  isCorrect,
  stepIndex,
  missionIndex,
}) {
  const submittedAt = Date.now();

  try {
    await addDoc(collection(db, 'submissions'), {
      userId: username,
      missionId,
      answer,
      isCorrect,
      submittedAt,
      stepIndex,
      missionIndex,
    });

    let scoreAwarded = false;
    let nextScore = null;

    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, 'users', username);
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) return;

      const user = userSnap.data();
      const solvedMissionIds = user.solvedMissionIds ?? [];

      if (!isCorrect || solvedMissionIds.includes(missionId)) {
        nextScore = user.score ?? 0;
        return;
      }

      scoreAwarded = true;
      nextScore = (user.score ?? 0) + 10;
      transaction.update(userRef, {
        score: nextScore,
        solvedMissionIds: [...solvedMissionIds, missionId],
        lastSolvedAt: submittedAt,
      });
    });

    return { scoreAwarded, nextScore };
  } catch (error) {
    if (!isPermissionDenied(error)) throw error;

    const submissions = getLocalSubmissions();
    submissions.unshift({
      id: `local-${submittedAt}`,
      userId: username,
      missionId,
      answer,
      isCorrect,
      submittedAt,
      stepIndex,
      missionIndex,
    });
    setLocalSubmissions(submissions);

    const users = getLocalUsers();
    const user = users[username] ?? {
      id: username,
      username,
      role: 'participant',
      score: 0,
      solvedMissionIds: [],
    };

    const solvedMissionIds = user.solvedMissionIds ?? [];
    let scoreAwarded = false;

    if (isCorrect && !solvedMissionIds.includes(missionId)) {
      user.score = (user.score ?? 0) + 10;
      user.solvedMissionIds = [...solvedMissionIds, missionId];
      scoreAwarded = true;
    }

    users[username] = {
      ...user,
      lastSolvedAt: submittedAt,
    };
    setLocalUsers(users);

    return { scoreAwarded, nextScore: users[username].score ?? 0 };
  }
}

export async function recordBonusEntry(username) {
  const now = Date.now();

  try {
    let result = null;

    await runTransaction(db, async (transaction) => {
      const bonusRef = doc(db, 'bonusEntries', username);
      const userRef = doc(db, 'users', username);
      const controlRef = runtimeRef();

      const bonusSnap = await transaction.get(bonusRef);
      const userSnap = await transaction.get(userRef);
      const controlSnap = await transaction.get(controlRef);

      if (bonusSnap.exists()) {
        result = bonusSnap.data();
        return;
      }

      const control = controlSnap.exists() ? controlSnap.data() : {};
      const currentWinners = control.bonusWinners ?? [];
      const nextWinners = currentWinners.length < 3
        ? [...currentWinners, { username, enteredAt: now, rank: currentWinners.length + 1 }]
        : currentWinners;

      transaction.set(bonusRef, { username, enteredAt: now });
      if (userSnap.exists()) {
        transaction.update(userRef, { bonusEnteredAt: now });
      }
      transaction.set(controlRef, { bonusWinners: nextWinners, updatedAt: now }, { merge: true });

      result = {
        username,
        enteredAt: now,
        rank: currentWinners.length < 3 ? currentWinners.length + 1 : null,
      };
    });

    return result;
  } catch (error) {
    if (!isPermissionDenied(error)) throw error;

    const entries = getLocalBonusEntries();
    const existing = entries.find((entry) => entry.username === username);
    if (existing) return existing;

    const entry = {
      username,
      enteredAt: now,
      rank: entries.length < 3 ? entries.length + 1 : null,
    };

    entries.push(entry);
    entries.sort((left, right) => (left.enteredAt ?? 0) - (right.enteredAt ?? 0));
    setLocalBonusEntries(entries);

    const runtime = getLocalRuntime();
    setLocalRuntime({
      ...runtime,
      bonusWinners: entries.slice(0, 3).map((item, index) => ({
        username: item.username,
        enteredAt: item.enteredAt,
        rank: index + 1,
      })),
      updatedAt: now,
    });

    const users = getLocalUsers();
    if (users[username]) {
      users[username].bonusEnteredAt = now;
      setLocalUsers(users);
    }

    return entry;
  }
}

export async function resetTrainingData() {
  const resetRuntime = {
    missionStarted: false,
    startedSteps: [false, false, false],
    currentSlide: 0,
    leaderboardVisible: true,
    bonusWinners: [],
    updatedAt: Date.now(),
  };

  try {
    const [usersSnap, submissionsSnap, bonusSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'submissions')),
      getDocs(collection(db, 'bonusEntries')),
    ]);

    const batch = writeBatch(db);

    usersSnap.forEach((userDoc) => {
      const user = userDoc.data();

      if (user.role !== 'participant') return;

      batch.set(
        userDoc.ref,
        {
          score: 0,
          solvedMissionIds: [],
          currentStep: 0,
          currentMission: 0,
          completedSteps: [],
          currentScreen: 'editor',
          bonusEnteredAt: null,
          lastSolvedAt: null,
          updatedAt: Date.now(),
        },
        { merge: true },
      );
    });

    submissionsSnap.forEach((submissionDoc) => {
      batch.delete(submissionDoc.ref);
    });

    bonusSnap.forEach((bonusDoc) => {
      batch.delete(bonusDoc.ref);
    });

    batch.set(runtimeRef(), resetRuntime, { merge: true });
    await batch.commit();
    return true;
  } catch (error) {
    if (!isPermissionDenied(error)) throw error;

    const users = getLocalUsers();
    const nextUsers = Object.fromEntries(
      Object.entries(users).map(([username, user]) => {
        if (user.role !== 'participant') {
          return [username, user];
        }

        return [
          username,
          {
            ...user,
            score: 0,
            solvedMissionIds: [],
            currentStep: 0,
            currentMission: 0,
            completedSteps: [],
            currentScreen: 'editor',
            bonusEnteredAt: null,
            lastSolvedAt: null,
            updatedAt: Date.now(),
          },
        ];
      }),
    );

    setLocalUsers(nextUsers);
    setLocalSubmissions([]);
    setLocalBonusEntries([]);
    setLocalRuntime({
      ...getLocalRuntime(),
      ...resetRuntime,
    });

    return true;
  }
}
