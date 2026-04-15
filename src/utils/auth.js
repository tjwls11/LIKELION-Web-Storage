export const OPERATOR_ID = 'likelion14'
export const OPERATOR_PASSWORD = 'likelion14'

const SESSION_KEY = 'likelion_session'
const ROLE_KEY = 'likelion_client_role'
const BONUS_KEY = 'likelion_bonus_gate'
const USERS_KEY = 'likelion_users'

function parseJSON(value) {
  try { return value ? JSON.parse(value) : null } catch { return null }
}

function getUsers() {
  return parseJSON(localStorage.getItem(USERS_KEY)) ?? {}
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
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

export async function seedOperatorUser() {}

export async function signup(username, password) {
  const u = username.trim()
  const p = password.trim()

  if (!u || !p) return { success: false, error: 'ID와 비밀번호를 입력하세요.' }
  if (u === OPERATOR_ID) return { success: false, error: '사용할 수 없는 아이디입니다.' }

  const users = getUsers()
  if (users[u]) return { success: false, error: '이미 사용 중인 아이디입니다.' }

  users[u] = { username: u, password: p, role: 'participant', solvedMissionIds: [] }
  saveUsers(users)

  return { success: true }
}

export async function login(username, password) {
  const u = username.trim()
  const p = password.trim()

  if (!u || !p) return { success: false, error: 'ID와 비밀번호를 입력하세요.' }

  if (u === OPERATOR_ID && p === OPERATOR_PASSWORD) {
    const session = { username: OPERATOR_ID, role: 'operator' }
    saveSession(session)
    return { success: true, user: session }
  }

  const users = getUsers()
  const user = users[u]

  if (!user) return { success: false, error: '존재하지 않는 아이디입니다.' }
  if (user.password !== p) return { success: false, error: '비밀번호가 틀렸습니다.' }

  const session = { username: u, role: 'participant' }
  saveSession(session)
  return { success: true, user: session }
}
