import express from 'express'
import cors from 'cors'
import { connectDB, getDB } from './db.js'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

/* ── 유틸 ── */

function normalizeRuntime(data = {}) {
  const startedSteps = Array.isArray(data.startedSteps)
    ? [...data.startedSteps]
    : [false]
  while (startedSteps.length < 1) startedSteps.push(false)
  return {
    missionStarted: startedSteps.some(Boolean),
    startedSteps: startedSteps.slice(0, 1),
    leaderboardVisible: data.leaderboardVisible ?? true,
    bonusWinners: data.bonusWinners ?? [],
    updatedAt: data.updatedAt ?? Date.now(),
  }
}

function strip(doc) {
  if (!doc) return null
  const { _id, ...rest } = doc
  return rest
}

/* ── 회원가입 ── */

app.post('/api/signup', async (req, res) => {
  try {
    const { username, password } = req.body
    const db = getDB()
    const existing = await db.collection('users').findOne({ username })
    if (existing) return res.json({ success: false, error: 'This ID is already in use.' })

    await db.collection('users').insertOne({
      id: username,
      username,
      password,
      role: 'participant',
      solvedMissionIds: [],
      isOnline: false,
      currentScreen: 'waiting',
      currentStep: 0,
      currentMission: 0,
      bonusEnteredAt: null,
      createdAt: Date.now(),
      lastSeen: Date.now(),
    })

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.json({ success: false, error: 'Sign-up failed.' })
  }
})

/* ── 로그인 ── */

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const db = getDB()
    const user = await db.collection('users').findOne({ username })

    if (!user) return res.json({ success: false, error: 'ID not found.' })
    if (user.role !== 'participant') return res.json({ success: false, error: 'Use a participant account here.' })
    if (user.password !== password) return res.json({ success: false, error: 'Wrong password.' })

    res.json({ success: true, user: { username, role: 'participant' } })
  } catch (err) {
    console.error(err)
    res.json({ success: false, error: 'Login failed.' })
  }
})

/* ── 유저 상태 조회 ── */

app.get('/api/users/:username', async (req, res) => {
  try {
    const db = getDB()
    const user = await db.collection('users').findOne({ username: req.params.username })
    res.json(strip(user))
  } catch (err) {
    console.error(err)
    res.json(null)
  }
})

/* ── 유저 상태 업데이트 ── */

app.put('/api/users/:username', async (req, res) => {
  try {
    const db = getDB()
    await db.collection('users').updateOne(
      { username: req.params.username },
      { $set: { ...req.body, lastSeen: Date.now() } },
    )
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.json({ success: false })
  }
})

/* ── 참가자 목록 ── */

app.get('/api/participants', async (req, res) => {
  try {
    const db = getDB()
    const users = await db.collection('users')
      .find({ role: 'participant' }, { projection: { _id: 0, password: 0 } })
      .sort({ createdAt: 1 })
      .toArray()
    res.json(users)
  } catch (err) {
    console.error(err)
    res.json([])
  }
})

/* ── 런타임 상태 ── */

app.get('/api/runtime', async (req, res) => {
  try {
    const db = getDB()
    const doc = await db.collection('runtime').findOne({ id: 'control' })
    res.json(normalizeRuntime(doc))
  } catch (err) {
    console.error(err)
    res.json(normalizeRuntime())
  }
})

app.put('/api/runtime', async (req, res) => {
  try {
    const db = getDB()
    await db.collection('runtime').updateOne(
      { id: 'control' },
      { $set: { id: 'control', ...req.body, updatedAt: Date.now() } },
      { upsert: true },
    )
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.json({ success: false })
  }
})

/* ── 제출 목록 ── */

app.get('/api/submissions', async (req, res) => {
  try {
    const db = getDB()
    const submissions = await db.collection('submissions')
      .find({}, { projection: { _id: 0 } })
      .sort({ submittedAt: -1 })
      .toArray()
    res.json(submissions)
  } catch (err) {
    console.error(err)
    res.json([])
  }
})

/* ── 미션 제출 ── */

app.post('/api/submissions', async (req, res) => {
  try {
    const { username, missionId, answer, isCorrect, stepIndex, missionIndex } = req.body
    const db = getDB()
    const submittedAt = Date.now()

    await db.collection('submissions').insertOne({
      id: `sub-${submittedAt}-${username}`,
      userId: username,
      missionId,
      answer,
      isCorrect,
      submittedAt,
      stepIndex,
      missionIndex,
    })

    if (isCorrect) {
      await db.collection('users').updateOne(
        { username },
        {
          $addToSet: { solvedMissionIds: missionId },
          $set: { lastSolvedAt: submittedAt },
        },
      )
    }

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.json({ success: false })
  }
})

/* ── 보너스 목록 ── */

app.get('/api/bonus', async (req, res) => {
  try {
    const db = getDB()
    const entries = await db.collection('bonusEntries')
      .find({}, { projection: { _id: 0 } })
      .sort({ enteredAt: 1 })
      .toArray()
    res.json(entries)
  } catch (err) {
    console.error(err)
    res.json([])
  }
})

/* ── 보너스 진입 기록 ── */

app.post('/api/bonus/:username', async (req, res) => {
  try {
    const { username } = req.params
    const db = getDB()
    const now = Date.now()

    const existing = await db.collection('bonusEntries').findOne({ username })
    if (existing) {
      const all = await db.collection('bonusEntries').find({}).sort({ enteredAt: 1 }).toArray()
      const idx = all.findIndex((e) => e.username === username)
      return res.json({ username, enteredAt: existing.enteredAt, rank: idx < 3 ? idx + 1 : null })
    }

    const count = await db.collection('bonusEntries').countDocuments()
    const rank = count < 3 ? count + 1 : null

    await db.collection('bonusEntries').insertOne({ username, enteredAt: now, rank })
    await db.collection('users').updateOne({ username }, { $set: { bonusEnteredAt: now } })

    res.json({ username, enteredAt: now, rank })
  } catch (err) {
    console.error(err)
    res.json(null)
  }
})

/* ── 전체 초기화 ── */

app.delete('/api/reset', async (req, res) => {
  try {
    const db = getDB()
    await db.collection('submissions').deleteMany({})
    await db.collection('bonusEntries').deleteMany({})
    await db.collection('users').updateMany(
      { role: 'participant' },
      {
        $set: {
          solvedMissionIds: [],
          currentStep: 0,
          currentMission: 0,
          bonusEnteredAt: null,
          lastSolvedAt: null,
          currentScreen: 'editor',
        },
      },
    )
    await db.collection('runtime').updateOne(
      { id: 'control' },
      {
        $set: {
          startedSteps: [false],
          missionStarted: false,
          bonusWinners: [],
          updatedAt: Date.now(),
        },
      },
      { upsert: true },
    )
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.json({ success: false })
  }
})

/* ── 시작 ── */

async function start() {
  try {
    await connectDB()
  } catch (err) {
    console.error('MongoDB 연결 실패:', err.message)
    console.error('서버는 시작하지만 DB 기능이 작동하지 않습니다.')
    console.error('MongoDB Atlas → Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)')
  }
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
}

start()
