import type { AuthUser } from '../types'

const SESSION_KEY = 'voixdabouloussi.session'

export interface StoredSession {
  token: string
  user: AuthUser
}

export function getStoredSession(): StoredSession | null {
  try {
    const brut = localStorage.getItem(SESSION_KEY)
    if (!brut) return null
    const session = JSON.parse(brut) as StoredSession
    if (!session.token || !session.user) return null
    return session
  } catch {
    return null
  }
}

export function saveSession(session: StoredSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}
