import { useCallback, useEffect, useState } from 'react'
import { useHashRoute } from './hooks/useHashRoute'
import { api } from './services/api'
import { clearSession, getStoredSession } from './services/session'
import { flatSettings } from './config/site'
import type { AuthUser } from './types'
import { ToastProvider } from './components/ToastViewport'
import { useToast } from './hooks/useToast'
import { AdminLayout, SiteLayout } from './components/Layouts'
import { HomePage } from './pages/HomePage'
import { JournalPage } from './pages/JournalPage'
import { JdaPage } from './pages/JdaPage'
import { ParlementPage } from './pages/ParlementPage'
import { HistoirePage } from './pages/HistoirePage'
import { RubriquePage } from './pages/RubriquePage'
import { SearchPage } from './pages/SearchPage'
import { DetailPage } from './pages/DetailPage'
import { AlbumsPage } from './pages/AlbumsPage'
import { AlbumDetailPage } from './pages/AlbumDetailPage'
import { MarchePage } from './pages/MarchePage'
import { AboutPage } from './pages/AboutPage'
import { KokoDecouvertePage } from './pages/KokoDecouvertePage'
import { ContactPage } from './pages/ContactPage'
import { LoginPage } from './pages/LoginPage'
import { MentionsPage } from './pages/MentionsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import type { AppRoute } from './hooks/useHashRoute'

function Page({ route, settings, onLogin }: { route: AppRoute; settings: Record<string, string>; onLogin: (user: AuthUser) => void }) {
  switch (route.name) {
    case 'home':
      return <HomePage settings={settings} />
    case 'journaux':
      return <JournalPage settings={settings} />
    case 'jda':
      return <JdaPage settings={settings} />
    case 'parlement':
      return <ParlementPage settings={settings} />
    case 'contes':
      return <RubriquePage titre="Contes" description="Les contes écrits et collectés par la jeunesse d'Abouloussi." eyebrow="Littérature" endpoint="contes" />
    case 'poemes':
      return <RubriquePage titre="Poèmes" description="La poésie des jeunes de la Voix d'Abouloussi." eyebrow="Littérature" endpoint="poemes" />
    case 'actualites':
      return <RubriquePage titre="Actualités" description="Toutes les nouvelles du mouvement et de la région." eyebrow="Publications" endpoint="actualites" />
    case 'albums':
      return <AlbumsPage />
    case 'albumDetail':
      return <AlbumDetailPage id={route.id} />
    case 'histoire':
      return <HistoirePage settings={settings} />
    case 'marche':
      return <MarchePage />
    case 'aPropos':
      return <AboutPage />
    case 'kokoDecouverte':
      return <KokoDecouvertePage />
    case 'contact':
      return <ContactPage settings={settings} />
    case 'recherche':
      return <SearchPage route={route} />
    case 'detail':
      return <DetailPage slug={route.slug} />
    case 'login':
      return <LoginPage onLogin={onLogin} />
    case 'mentions':
      return <MentionsPage settings={settings} />
    default:
      return <NotFoundPage />
  }
}

function Application() {
  const route = useHashRoute()
  const { erreur } = useToast()
  const [user, setUser] = useState<AuthUser | null>(() => getStoredSession()?.user ?? null)
  const [settings, setSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    api.settings().then((response) => setSettings(flatSettings(response.data))).catch(() => {})
  }, [])

  const deconnecter = useCallback(() => {
    api.logout().catch(() => {}).finally(() => {
      clearSession()
      setUser(null)
    })
  }, [])

  useEffect(() => {
    const onUnauthorized = () => {
      clearSession()
      setUser(null)
      erreur('Session expirée', 'Veuillez vous reconnecter.')
    }
    window.addEventListener('voix:unauthorized', onUnauthorized)
    return () => window.removeEventListener('voix:unauthorized', onUnauthorized)
  }, [erreur])

  if (route.name === 'admin') {
    return (
      <AdminLayout route={route} settings={settings} user={user} onLogout={deconnecter}>
        <AdminDashboard route={route} />
      </AdminLayout>
    )
  }

  return (
    <SiteLayout route={route} settings={settings} user={user} onLogout={deconnecter}>
      <Page route={route} settings={settings} onLogin={setUser} />
    </SiteLayout>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <Application />
    </ToastProvider>
  )
}
