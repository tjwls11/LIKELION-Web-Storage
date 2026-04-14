import { db } from './firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getLocalUser, saveLocalUser } from './trainingStore.js';

export const ADMIN_ID = 'admin';
export const OPERATOR_ID = 'likelion14';
export const OPERATOR_PASSWORD = 'likelion14';

const SESSION_KEY = 'likelion_session';
const ROLE_KEY = 'likelion_client_role';
const BONUS_KEY = 'likelion_bonus_gate';

function isPermissionDenied(error) {
  return error?.code === 'permission-denied' || String(error?.message ?? '').includes('permission-denied');
}

function parseJSON(value) {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  // Educational vulnerability:
  // Web Storage is intentionally treated as authority-like data so learners
  // can change it in DevTools and see how unsafe that pattern is.
  localStorage.setItem(ROLE_KEY, session.role);
  sessionStorage.setItem(ROLE_KEY, session.role);
  sessionStorage.setItem(BONUS_KEY, session.role === 'admin' ? 'admin' : 'participant');
}

export function getStoredSession() {
  return parseJSON(localStorage.getItem(SESSION_KEY));
}

export function getClientPrivilegeState() {
  const storedSession = getStoredSession();
  const localRole = localStorage.getItem(ROLE_KEY);
  const sessionRole = sessionStorage.getItem(ROLE_KEY);
  const localBonus = localStorage.getItem(BONUS_KEY);
  const sessionBonus = sessionStorage.getItem(BONUS_KEY);

  const apparentRole = sessionRole || localRole || storedSession?.role || 'participant';
  const canAccessBonus =
    apparentRole === 'admin' ||
    localBonus === 'admin' ||
    sessionBonus === 'admin' ||
    localBonus === 'bonus' ||
    sessionBonus === 'bonus';

  return { apparentRole, canAccessBonus };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(BONUS_KEY);
  sessionStorage.removeItem(ROLE_KEY);
  sessionStorage.removeItem(BONUS_KEY);
}

export async function seedOperatorUser() {
  const operatorUser = {
    id: OPERATOR_ID,
    username: OPERATOR_ID,
    password: OPERATOR_PASSWORD,
    role: 'operator',
    score: 0,
    createdAt: Date.now(),
    bonusEnteredAt: null,
    solvedMissionIds: [],
    isOnline: false,
    currentScreen: 'dashboard',
    currentStep: 0,
    currentMission: 0,
    lastSeen: Date.now(),
  };

  try {
    const operatorRef = doc(db, 'users', OPERATOR_ID);
    const operatorSnap = await getDoc(operatorRef);
    if (!operatorSnap.exists()) {
      await setDoc(operatorRef, operatorUser);
    }
  } catch (error) {
    if (!isPermissionDenied(error)) throw error;
    if (!getLocalUser(OPERATOR_ID)) {
      saveLocalUser(operatorUser);
    }
  }
}

export async function signup(username, password) {
  const normalizedUsername = username.trim();
  const normalizedPassword = password.trim();

  if (!normalizedUsername || !normalizedPassword) {
    return { success: false, error: 'Enter both ID and password.' };
  }

  if (normalizedUsername === ADMIN_ID || normalizedUsername === OPERATOR_ID) {
    return { success: false, error: 'Reserved IDs cannot be used for participant sign-up.' };
  }

  const nextUser = {
    id: normalizedUsername,
    username: normalizedUsername,
    password: normalizedPassword,
    role: 'participant',
    score: 0,
    createdAt: Date.now(),
    bonusEnteredAt: null,
    solvedMissionIds: [],
    isOnline: false,
    currentScreen: 'waiting',
    currentStep: 0,
    currentMission: 0,
    lastSeen: Date.now(),
  };

  try {
    const userRef = doc(db, 'users', normalizedUsername);
    const existingUser = await getDoc(userRef);

    if (existingUser.exists()) {
      return { success: false, error: 'This ID is already in use.' };
    }

    await setDoc(userRef, nextUser);
    return { success: true };
  } catch (error) {
    if (!isPermissionDenied(error)) {
      console.error(error);
      return { success: false, error: 'Sign-up failed.' };
    }

    if (getLocalUser(normalizedUsername)) {
      return { success: false, error: 'This ID is already in use.' };
    }

    saveLocalUser(nextUser);
    return { success: true };
  }
}

export async function login(username, password) {
  const normalizedUsername = username.trim();
  const normalizedPassword = password.trim();

  if (!normalizedUsername || !normalizedPassword) {
    return { success: false, error: 'Enter both ID and password.' };
  }

  if (normalizedUsername === OPERATOR_ID && normalizedPassword === OPERATOR_PASSWORD) {
    const session = { username: OPERATOR_ID, role: 'operator' };
    saveSession(session);
    return { success: true, user: session };
  }

  try {
    const userSnap = await getDoc(doc(db, 'users', normalizedUsername));

    if (!userSnap.exists()) {
      return { success: false, error: 'ID not found.' };
    }

    const user = userSnap.data();

    if (user.role !== 'participant') {
      return { success: false, error: 'Use a participant account here.' };
    }

    if (user.password !== normalizedPassword) {
      return { success: false, error: 'Wrong password.' };
    }

    const session = { username: normalizedUsername, role: 'participant' };
    saveSession(session);
    return { success: true, user: session };
  } catch (error) {
    if (!isPermissionDenied(error)) {
      console.error(error);
      return { success: false, error: 'Login failed.' };
    }

    const user = getLocalUser(normalizedUsername);
    if (!user) {
      return { success: false, error: 'ID not found.' };
    }
    if (user.role !== 'participant') {
      return { success: false, error: 'Use a participant account here.' };
    }
    if (user.password !== normalizedPassword) {
      return { success: false, error: 'Wrong password.' };
    }

    const session = { username: normalizedUsername, role: 'participant' };
    saveSession(session);
    return { success: true, user: session };
  }
}
