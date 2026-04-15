import { api } from './api.js'

const POLL_INTERVAL = 1500

function normalizeRuntime(data = {}) {
  const startedSteps = Array.isArray(data.startedSteps)
    ? [...data.startedSteps]
    : [false, false, false]
  while (startedSteps.length < 3) startedSteps.push(false)
  return {
    missionStarted: startedSteps.some(Boolean),
    startedSteps: startedSteps.slice(0, 3),
    leaderboardVisible: data.leaderboardVisible ?? true,
    bonusWinners: data.bonusWinners ?? [],
    updatedAt: data.updatedAt ?? Date.now(),
  }
}

/* ── 구독 헬퍼 (폴링) ── */

function poll(fetcher, callback, interval = POLL_INTERVAL) {
  let active = true

  const run = async () => {
    if (!active) return
    try {
      const data = await fetcher()
      if (active) callback(data)
    } catch (err) {
      console.error(err)
    }
  }

  run()
  const id = setInterval(run, interval)
  return () => { active = false; clearInterval(id) }
}

/* ── 런타임 ── */

export async function ensureRuntimeState() {
  // 서버가 GET 시 자동으로 기본값 반환 — 별도 초기화 불필요
}

export function subscribeRuntimeState(callback) {
  return poll(
    async () => normalizeRuntime(await api('/runtime', { method: 'GET' })),
    callback,
  )
}

export async function setStepSessionOpen(stepIndex, isOpen) {
  const current = normalizeRuntime(await api('/runtime', { method: 'GET' }))
  const startedSteps = [...current.startedSteps]
  startedSteps[stepIndex] = isOpen
  await api('/runtime', {
    method: 'PUT',
    body: { startedSteps, missionStarted: startedSteps.some(Boolean) },
  })
}

/* ── 참가자 ── */

export function subscribeParticipants(callback) {
  return poll(
    () => api('/participants', { method: 'GET' }),
    callback,
  )
}

export async function getParticipantState(username) {
  return api(`/users/${username}`, { method: 'GET' })
}

export async function updateParticipantStatus(username, patch) {
  return api(`/users/${username}`, { method: 'PUT', body: patch })
}

export async function markParticipantOffline(username) {
  if (!username) return
  return updateParticipantStatus(username, { isOnline: false })
}

/* ── 제출 ── */

export function subscribeSubmissions(callback) {
  return poll(
    () => api('/submissions', { method: 'GET' }),
    callback,
  )
}

export async function recordMissionSubmission({ username, missionId, answer, isCorrect, stepIndex, missionIndex }) {
  return api('/submissions', {
    body: { username, missionId, answer, isCorrect, stepIndex, missionIndex },
  })
}

/* ── 보너스 ── */

export function subscribeBonusEntries(callback) {
  return poll(
    () => api('/bonus', { method: 'GET' }),
    callback,
  )
}

export async function recordBonusEntry(username) {
  return api(`/bonus/${username}`, { body: {} })
}

/* ── 초기화 ── */

export async function resetTrainingData() {
  return api('/reset', { method: 'DELETE' })
}

/* ── 로컬 fallback (auth.js 호환용, 실제로는 미사용) ── */

export function getLocalUser() { return null }
export function saveLocalUser() {}
