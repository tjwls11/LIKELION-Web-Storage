import { api } from './api.js'

export const ADMIN_ID = 'admin'
export const OPERATOR_ID = 'likelion14'
export const OPERATOR_PASSWORD = 'likelion14'

const SESSION_KEY = 'likelion_session'
const ROLE_KEY = 'likelion_client_role'
const BONUS_KEY = 'likelion_bonus_gate'

function parseJSON(value) {
  try { return value ? JSON.parse(value) : null } catch { return null }
}

function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  localStorage.setItem(ROLE_KEY, session.role)
  sessionStorage.setItem(ROLE_KEY, session.role)
  sessionStorage.setItem(BONUS_KEY, session.role === 'admin' ? 'admin' : 'participant')
}

export function getStoredSession() {
  return parseJSON(localStorage.getItem(SESSION_KEY))
}

export function getClientPrivilegeState() {
  const storedSession = getStoredSession()
  const localRole = localStorage.getItem(ROLE_KEY)
  const sessionRole = sessionStorage.getItem(ROLE_KEY)
  const localBonus = localStorage.getItem(BONUS_KEY)
  const sessionBonus = sessionStorage.getItem(BONUS_KEY)

  const apparentRole = sessionRole || localRole || storedSession?.role || 'participant'
  const canAccessBonus =
    apparentRole === 'admin' ||
    localBonus === 'admin' ||
    sessionBonus === 'admin' ||
    localBonus === 'bonus' ||
    sessionBonus === 'bonus'

  return { apparentRole, canAccessBonus }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(BONUS_KEY)
  sessionStorage.removeItem(ROLE_KEY)
  sessionStorage.removeItem(BONUS_KEY)
}

export async function seedOperatorUser() {
  // MongoDB에서는 서버가 직접 관리 — 클라이언트에서 할 필요 없음
}

export async function signup(username, password) {
  const normalizedUsername = username.trim()
  const normalizedPassword = password.trim()

  if (!normalizedUsername || !normalizedPassword) {
    return { success: false, error: 'Enter both ID and password.' }
  }

  if (normalizedUsername === ADMIN_ID || normalizedUsername === OPERATOR_ID) {
    return { success: false, error: 'Reserved IDs cannot be used for sign-up.' }
  }

  return api('/signup', { body: { username: normalizedUsername, password: normalizedPassword } })
}

export async function login(username, password) {
  const normalizedUsername = username.trim()
  const normalizedPassword = password.trim()

  if (!normalizedUsername || !normalizedPassword) {
    return { success: false, error: 'Enter both ID and password.' }
  }

  // 운영자 로컬 처리
  if (normalizedUsername === OPERATOR_ID && normalizedPassword === OPERATOR_PASSWORD) {
    const session = { username: OPERATOR_ID, role: 'operator' }
    saveSession(session)
    return { success: true, user: session }
  }

  const result = await api('/login', { body: { username: normalizedUsername, password: normalizedPassword } })

  if (result.success) {
    saveSession(result.user)
  }

  return result
}
