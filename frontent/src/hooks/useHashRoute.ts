import { useEffect, useState } from 'react'

export type AppRoute =
  | { name: 'home'; path: string }
  | { name: 'journaux'; path: string }
  | { name: 'jda'; path: string }
  | { name: 'parlement'; path: string }
  | { name: 'contes'; path: string }
  | { name: 'poemes'; path: string }
  | { name: 'actualites'; path: string }
  | { name: 'albums'; path: string }
  | { name: 'albumDetail'; path: string; id: string }
  | { name: 'histoire'; path: string }
  | { name: 'marche'; path: string }
  | { name: 'aPropos'; path: string }
  | { name: 'kokoDecouverte'; path: string }
  | { name: 'contact'; path: string }
  | { name: 'recherche'; path: string; query: string }
  | { name: 'detail'; path: string; slug: string; rubrique: string }
  | { name: 'login'; path: string }
  | { name: 'admin'; path: string; tab: string; query: string }
  | { name: 'mentions'; path: string }
  | { name: 'notFound'; path: string }

function readHash(): { path: string; query: string } {
  const brut = window.location.hash.replace(/^#+/, '')
  const [rawPath, ...reste] = brut.split('?')
  const path = rawPath ? (rawPath.startsWith('/') ? rawPath : `/${rawPath}`) : '/'
  return { path: path.replace(/\/+$/, '') || '/', query: reste.join('?') }
}

export function parseRoute(path: string, query = ''): AppRoute {
  const segments = path.split('/').filter(Boolean)
  const first = segments[0] ?? ''

  switch (first) {
    case '':
      return { name: 'home', path }
    case 'journaux':
      return { name: 'journaux', path }
    case 'jda':
      return { name: 'jda', path }
    case 'parlement':
    case 'pjk':
      return { name: 'parlement', path }
    case 'contes':
      return { name: 'contes', path }
    case 'poemes':
      return { name: 'poemes', path }
    case 'actualites':
      return { name: 'actualites', path }
    case 'albums':
      return segments[1]
        ? { name: 'albumDetail', path, id: segments[1] }
        : { name: 'albums', path }
    case 'dis-moi-grand-pere':
      return { name: 'histoire', path }
    case 'marche':
      return { name: 'marche', path }
    case 'a-propos':
      return { name: 'aPropos', path }
    case 'koko-decouverte':
      return { name: 'kokoDecouverte', path }
    case 'contact':
      return { name: 'contact', path }
    case 'recherche':
      return { name: 'recherche', path, query }
    case 'connexion':
      return { name: 'login', path }
    case 'admin':
      return { name: 'admin', path, tab: segments[1] ?? 'tableau-de-bord', query }
    case 'mentions-legales':
      return { name: 'mentions', path }
    default: {
      const rubriques = ['journaux', 'jda', 'parlement', 'contes', 'poemes', 'actualites']
      const rubrique = rubriques.includes(first) ? first : 'contenus'
      return segments[1]
        ? { name: 'detail', path, slug: decodeURIComponent(segments[1]), rubrique }
        : { name: 'notFound', path }
    }
  }
}

export function useHashRoute(): AppRoute {
  const [route, setRoute] = useState<AppRoute>(() => {
    const { path, query } = readHash()
    return parseRoute(path, query)
  })

  useEffect(() => {
    const onChange = () => {
      const { path, query } = readHash()
      setRoute(parseRoute(path, query))
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}

export function navigate(path: string): void {
  const cible = path.startsWith('#') ? path : `#${path.startsWith('/') ? path : `/${path}`}`
  if (window.location.hash === cible) {
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    return
  }
  window.location.hash = cible
}
