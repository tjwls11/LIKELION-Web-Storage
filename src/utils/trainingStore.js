const USER_STATE_PREFIX = 'likelion_user_state_'
const BONUS_ENTRIES_KEY = 'likelion_bonus_entries'

function parseJSON(value) {
  try { return value ? JSON.parse(value) : null } catch { return null }
}

export function subscribeRuntimeState(callback) {
  callback({ missionStarted: true, startedSteps: [true], bonusWinners: [] })
  return () => {}
}

export function subscribeParticipants(callback) {
  callback([])
  return () => {}
}

export function subscribeSubmissions(callback) {
  callback([])
  return () => {}
}

export function subscribeBonusEntries(callback) {
  callback([])
  return () => {}
}

export async function ensureRuntimeState() {}

export async function getParticipantState(username) {
  const key = USER_STATE_PREFIX + username
  return parseJSON(localStorage.getItem(key)) ?? { solvedMissionIds: [] }
}

export async function updateParticipantStatus(username, patch) {
  const key = USER_STATE_PREFIX + username
  const current = parseJSON(localStorage.getItem(key)) ?? {}
  localStorage.setItem(key, JSON.stringify({ ...current, ...patch }))
}

export async function markParticipantOffline() {}

export async function recordMissionSubmission({ username, missionId, isCorrect }) {
  if (!isCorrect) return
  const key = USER_STATE_PREFIX + username
  const current = parseJSON(localStorage.getItem(key)) ?? { solvedMissionIds: [] }
  if (!Array.isArray(current.solvedMissionIds)) current.solvedMissionIds = []
  if (!current.solvedMissionIds.includes(missionId)) {
    current.solvedMissionIds.push(missionId)
    localStorage.setItem(key, JSON.stringify(current))
  }
}

export async function recordBonusEntry(username) {
  const entries = parseJSON(localStorage.getItem(BONUS_ENTRIES_KEY)) ?? []
  const existing = entries.find(e => e.username === username)
  if (existing) return existing

  const entry = { username, enteredAt: Date.now(), rank: entries.length < 3 ? entries.length + 1 : null }
  entries.push(entry)
  localStorage.setItem(BONUS_ENTRIES_KEY, JSON.stringify(entries))
  return entry
}

export async function setStepSessionOpen() {}

export async function resetTrainingData() {
  Object.keys(localStorage)
    .filter(k => k.startsWith(USER_STATE_PREFIX) || k === BONUS_ENTRIES_KEY)
    .forEach(k => localStorage.removeItem(k))
}
