const KEY = 'astraguard_user_id'

export function getActiveUserId() {
  try {
    const v = localStorage.getItem(KEY)
    return v && String(v).trim() ? v : 'user_123'
  } catch (_) {
    return 'user_123'
  }
}

export function setActiveUserId(userId) {
  if (!userId) return
  try {
    localStorage.setItem(KEY, String(userId))
  } catch (_) {}
}

export function extractUserId(payload) {
  if (!payload || typeof payload !== 'object') return null
  return (
    payload.user_id ||
    payload.userId ||
    payload?.extraction?.user_id ||
    payload?.summary?.user_id ||
    payload?.meta?.user_id ||
    null
  )
}
