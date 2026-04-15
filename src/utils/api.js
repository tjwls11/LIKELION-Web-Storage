export async function api(path, options = {}) {
  const { body, method, ...rest } = options
  const res = await fetch(`/api${path}`, {
    method: method ?? (body !== undefined ? 'POST' : 'GET'),
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  })
  return res.json()
}
