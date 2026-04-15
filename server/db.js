import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = join(__dirname, 'data.json')

const defaultData = {
  users: [],
  runtime: [{ id: 'control', startedSteps: [false], missionStarted: false, bonusWinners: [], updatedAt: Date.now() }],
  submissions: [],
  bonusEntries: [],
}

function load() {
  if (!existsSync(DATA_PATH)) return structuredClone(defaultData)
  try {
    return JSON.parse(readFileSync(DATA_PATH, 'utf-8'))
  } catch {
    return structuredClone(defaultData)
  }
}

function save(data) {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

export function getDB() {
  const data = load()

  return {
    collection(name) {
      return {
        findOne(query) {
          const items = data[name] ?? []
          return Promise.resolve(items.find(item => matchQuery(item, query)) ?? null)
        },
        find(query = {}, options = {}) {
          let items = (data[name] ?? []).filter(item => matchQuery(item, query))
          const projection = options.projection ?? {}
          if (Object.keys(projection).length > 0) {
            items = items.map(item => applyProjection(item, projection))
          }
          return {
            sort(sortSpec) {
              const [key, dir] = Object.entries(sortSpec)[0]
              items = [...items].sort((a, b) => dir === -1 ? (b[key] ?? 0) - (a[key] ?? 0) : (a[key] ?? 0) - (b[key] ?? 0))
              return this
            },
            toArray() { return Promise.resolve(items) },
          }
        },
        insertOne(doc) {
          if (!data[name]) data[name] = []
          data[name].push(doc)
          save(data)
          return Promise.resolve({ insertedId: doc._id ?? Math.random().toString(36) })
        },
        updateOne(query, update, options = {}) {
          if (!data[name]) data[name] = []
          const idx = data[name].findIndex(item => matchQuery(item, query))
          if (idx === -1 && options.upsert) {
            const newDoc = { ...query, ...update.$set }
            data[name].push(newDoc)
          } else if (idx !== -1) {
            if (update.$set) Object.assign(data[name][idx], update.$set)
            if (update.$addToSet) {
              for (const [k, v] of Object.entries(update.$addToSet)) {
                if (!Array.isArray(data[name][idx][k])) data[name][idx][k] = []
                if (!data[name][idx][k].includes(v)) data[name][idx][k].push(v)
              }
            }
          }
          save(data)
          return Promise.resolve({ modifiedCount: idx !== -1 ? 1 : 0 })
        },
        updateMany(query, update) {
          if (!data[name]) data[name] = []
          data[name].forEach((item, idx) => {
            if (matchQuery(item, query)) {
              if (update.$set) Object.assign(data[name][idx], update.$set)
            }
          })
          save(data)
          return Promise.resolve()
        },
        deleteMany(query) {
          if (!data[name]) data[name] = []
          data[name] = data[name].filter(item => !matchQuery(item, query))
          save(data)
          return Promise.resolve()
        },
        countDocuments() {
          return Promise.resolve((data[name] ?? []).length)
        },
      }
    }
  }
}

export async function connectDB() {
  console.log('로컬 JSON DB 초기화 완료')
}

function matchQuery(item, query) {
  if (!query || Object.keys(query).length === 0) return true
  return Object.entries(query).every(([k, v]) => item[k] === v)
}

function applyProjection(item, projection) {
  const excludeMode = Object.values(projection).some(v => v === 0)
  if (excludeMode) {
    const result = { ...item }
    for (const [k, v] of Object.entries(projection)) {
      if (v === 0) delete result[k]
    }
    return result
  }
  const result = {}
  for (const [k, v] of Object.entries(projection)) {
    if (v === 1 && k in item) result[k] = item[k]
  }
  return result
}
