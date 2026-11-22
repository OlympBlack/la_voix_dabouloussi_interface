import { getStoredSession } from './session'
import type {
  Album, Category, ContactMessage, Content, HomeData, MarketRayon, Media,
  Paginated, Setting, UserAccount, AdminStats, AuthUser,
} from '../types'

export class ApiError extends Error {
  status: number
  payload: unknown

  constructor(message: string, status: number, payload: unknown = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export function resolveApiBase(): string {
  const configured = import.meta.env.VITE_API_URL
  if (configured) return String(configured).replace(/\/$/, '')

  if (typeof window === 'undefined') return 'http://localhost:8000/api'
  const host = window.location.hostname
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:8000/api`
  }
  return 'http://localhost:8000/api'
}

export const API_BASE_URL = resolveApiBase()
const REQUEST_TIMEOUT_MS = 12000

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  auth?: boolean
  query?: Record<string, string | number | boolean | null | undefined>
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(`${API_BASE_URL}/${path.replace(/^\//, '')}`)
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })
  return url.toString()
}

function extractMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback
  const body = payload as Record<string, unknown>
  if (body.message && typeof body.message === 'string') return body.message
  const errors = body.errors
  if (errors && typeof errors === 'object') {
    const first = Object.values(errors as Record<string, unknown>)[0]
    if (Array.isArray(first) && typeof first[0] === 'string') return first[0]
    if (typeof first === 'string') return first
  }
  return fallback
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = false, query, body, headers, ...rest } = options
  const token = auth ? getStoredSession()?.token : undefined
  const requestHeaders: Record<string, string> = { Accept: 'application/json', ...(headers as Record<string, string>) }

  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    payload = body
  } else if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }
  if (token) requestHeaders.Authorization = `Bearer ${token}`

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(buildUrl(path, query), {
      ...rest,
      headers: requestHeaders,
      body: payload,
      signal: controller.signal,
    })
  } catch (error) {
    window.clearTimeout(timeout)
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Le serveur met trop de temps à répondre.', 408)
    }
    throw new ApiError('Impossible de joindre le serveur. Vérifiez votre connexion.', 0)
  }
  window.clearTimeout(timeout)

  let json: unknown = null
  try {
    json = await response.json()
  } catch {
    json = null
  }

  if (!response.ok) {
    if (response.status === 401 && auth) {
      window.dispatchEvent(new CustomEvent('voix:unauthorized'))
    }
    throw new ApiError(extractMessage(json, `Erreur ${response.status}`), response.status, json)
  }

  return json as T
}

export const api = {
  home: () => apiRequest<{ data: HomeData }>('home'),
  settings: () => apiRequest<{ data: Record<string, Record<string, string>> }>('site/settings'),
  search: (query: Record<string, string | number | undefined>) =>
    apiRequest<Paginated<Content>>('search', { query }),
  contact: (payload: { nom: string; email: string; telephone?: string; objet?: string; message: string }) =>
    apiRequest<{ message: string }>('contact', { method: 'POST', body: payload }),

  rubrique: (rubrique: string, query: Record<string, string | number | undefined> = {}) =>
    apiRequest<Paginated<Content>>(rubrique, { query }),
  contenu: (slug: string) =>
    apiRequest<{ data: Content; similaires: Content[] }>(`contenus/${encodeURIComponent(slug)}`),

  albums: () => apiRequest<{ data: Album[] }>('albums'),
  album: (id: number | string) => apiRequest<{ data: Album }>(`albums/${id}`),

  dmsArticles: (query: Record<string, string | undefined> = {}) =>
    apiRequest<Paginated<Content>>('dms/articles', { query }),
  dmsArticle: (slug: string) =>
    apiRequest<{ data: Content }>(`dms/articles/${encodeURIComponent(slug)}`),
  dmsLike: (id: number) =>
    apiRequest<{ message: string; likes: number }>(`dms/articles/${id}/like`, { method: 'POST' }),

  marketRayons: () => apiRequest<{ data: MarketRayon[] }>('market/rayons'),
  marketJeu: (chiffre: number, prix: number) =>
    apiRequest<{ data: unknown; message: string; somme: number }>('market/jeu', {
      method: 'POST', body: { chiffre, prix },
    }),
  marketLivebets: () => apiRequest<{ data: unknown[] }>('market/livebets'),

  login: (email: string, password: string) =>
    apiRequest<{ message: string; access_token: string; user: AuthUser }>('auth/login', {
      method: 'POST', body: { email, password },
    }),
  me: () => apiRequest<{ user: AuthUser }>('auth/me', { auth: true }),
  logout: () => apiRequest<{ message: string }>('auth/logout', { method: 'POST', auth: true }),

  adminDashboard: () => apiRequest<{ data: AdminStats }>('admin/dashboard', { auth: true }),
  adminContents: (query: Record<string, string | number | undefined> = {}) =>
    apiRequest<Paginated<Content>>('admin/contenus', { auth: true, query }),
  adminContent: (id: number | string) =>
    apiRequest<{ data: Content }>(`admin/contenus/${id}`, { auth: true }),
  adminSaveContent: (payload: FormData | Record<string, unknown>, id?: number) =>
    apiRequest<{ message: string; data: Content }>(id ? `admin/contenus/${id}` : 'admin/contenus', {
      method: id ? 'PUT' : 'POST', auth: true, body: payload,
    }),
  adminDeleteContent: (id: number) =>
    apiRequest<{ message: string }>(`admin/contenus/${id}`, { method: 'DELETE', auth: true }),
  adminContentStatus: (id: number, statut: string) =>
    apiRequest<{ message: string }>(`admin/contenus/${id}/statut`, {
      method: 'PATCH', auth: true, body: { statut },
    }),

  adminCategories: (rubrique?: string) =>
    apiRequest<{ data: Category[] }>('admin/categories', { auth: true, query: { rubrique } }),
  adminSaveCategory: (payload: Record<string, unknown>, id?: number) =>
    apiRequest<{ message: string }>(id ? `admin/categories/${id}` : 'admin/categories', {
      method: id ? 'PUT' : 'POST', auth: true, body: payload,
    }),
  adminDeleteCategory: (id: number) =>
    apiRequest<{ message: string }>(`admin/categories/${id}`, { method: 'DELETE', auth: true }),

  adminMedias: (query: Record<string, string | undefined> = {}) =>
    apiRequest<Paginated<Media>>('admin/medias', { auth: true, query }),
  adminUpload: (file: File, rubrique?: string) => {
    const form = new FormData()
    form.append('fichier', file)
    if (rubrique) form.append('rubrique', rubrique)
    return apiRequest<{ message: string; data: Media }>('admin/upload', {
      method: 'POST', auth: true, body: form,
    })
  },
  adminDeleteMedia: (id: number) =>
    apiRequest<{ message: string }>(`admin/medias/${id}`, { method: 'DELETE', auth: true }),

  adminAlbums: () => apiRequest<{ data: Album[] }>('admin/albums', { auth: true }),
  adminSaveAlbum: (payload: FormData | Record<string, unknown>, id?: number) =>
    apiRequest<{ message: string; data: Album }>(id ? `admin/albums/${id}` : 'admin/albums', {
      method: id ? 'PUT' : 'POST', auth: true, body: payload,
    }),
  adminDeleteAlbum: (id: number) =>
    apiRequest<{ message: string }>(`admin/albums/${id}`, { method: 'DELETE', auth: true }),
  adminAddPhoto: (albumId: number, file: File, legende?: string) => {
    const form = new FormData()
    form.append('image', file)
    if (legende) form.append('legende', legende)
    return apiRequest<{ message: string }>(`admin/albums/${albumId}/photos`, {
      method: 'POST', auth: true, body: form,
    })
  },
  adminDeletePhoto: (albumId: number, photoId: number) =>
    apiRequest<{ message: string }>(`admin/albums/${albumId}/photos/${photoId}`, {
      method: 'DELETE', auth: true,
    }),

  adminUsers: () => apiRequest<{ data: UserAccount[] }>('admin/users', { auth: true }),
  adminRoles: () => apiRequest<{ data: Array<{ id: number; name: string; label: string }> }>('admin/roles', { auth: true }),
  adminPermissions: () => apiRequest<{ data: Array<{ id: number; name: string; label: string }> }>('admin/permissions', { auth: true }),
  adminSaveUser: (payload: Record<string, unknown>, id?: number) =>
    apiRequest<{ message: string }>(id ? `admin/users/${id}` : 'admin/users', {
      method: id ? 'PUT' : 'POST', auth: true, body: payload,
    }),
  adminDeleteUser: (id: number) =>
    apiRequest<{ message: string }>(`admin/users/${id}`, { method: 'DELETE', auth: true }),

  adminSettings: () => apiRequest<{ data: Setting[] }>('admin/settings', { auth: true }),
  adminSaveSetting: (id: number, valeur: string) =>
    apiRequest<{ message: string }>(`admin/settings/${id}`, {
      method: 'PUT', auth: true, body: { valeur },
    }),

  adminContacts: () => apiRequest<Paginated<ContactMessage>>('admin/contacts', { auth: true }),
  adminUpdateContact: (id: number, statut: string) =>
    apiRequest<{ message: string }>(`admin/contacts/${id}`, {
      method: 'PATCH', auth: true, body: { statut },
    }),
  adminDeleteContact: (id: number) =>
    apiRequest<{ message: string }>(`admin/contacts/${id}`, { method: 'DELETE', auth: true }),

  adminMarketProduits: () => apiRequest<{ data: Array<{ id: number; prix: number; designation: string | null; rayon: { nom: string } }> }>('admin/market/produits', { auth: true }),
  adminAddProduit: (rayon_id: number, prix: number, designation?: string) =>
    apiRequest<{ message: string }>('admin/market/produits', {
      method: 'POST', auth: true, body: { rayon_id, prix, designation },
    }),
  adminDeleteProduit: (id: number) =>
    apiRequest<{ message: string }>(`admin/market/produits/${id}`, { method: 'DELETE', auth: true }),
}
