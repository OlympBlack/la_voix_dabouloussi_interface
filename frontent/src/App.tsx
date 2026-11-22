import { useCallback, useEffect, useState } from 'react'
import { useHashRoute, type AppRoute } from './hooks/useHashRoute'
import { api } from './services/api'
import { clearSession, getStoredSession } from './services/session'
import { flatSettings } from './config/site'
import type { AuthUser } from './types'
import { ToastProvider, useToast } from './components/ToastViewport'
import { AdminLayout, SiteLayout } from './components/Layouts'
import { PageHero } from './components/PageHero'
import { Icon } from './components/Icons'
import { HomePage } from './pages/HomePage'

const TITRES: Partial<Record<AppRoute['name'], { titre: string; description: string; eyebrow: string }>> = {
  journaux: { titre: 'Nos journaux', description: 'Les éditions et numéros publiés par La Voix d’Abouloussi.', eyebrow: 'Publications' },
  jda: { titre: 'Jeunesse Développement Abouloussi', description: 'Les actualités, rapports et actions du JDA.', eyebrow: 'Le mouvement' },
  parlement: { titre: 'Parlement des Jeunes de Koko', description: 'Les sessions, débats et commissions des jeunes parlementaires.', eyebrow: 'Le mouvement' },
  albums: { titre: 'Galeries photos', description: 'Les albums et reportages visuels de l’association.', eyebrow: 'Médiathèque' },
  dms: { titre: 'Dis-moi Grand-Père', description: 'Contes, sagesses et récits du patrimoine.', eyebrow: 'Patrimoine' },
  marche: { titre: 'SuperMarché + LIVBET', description: 'Les rayons, produits et jeux de la plateforme marchande.', eyebrow: 'Marché' },
  contes: { titre: 'Contes', description: 'Les contes écrits et collectés par la jeunesse.', eyebrow: 'Littérature' },
  poemes: { titre: 'Poèmes', description: 'La poésie des jeunes de la Voix d’Abouloussi.', eyebrow: 'Littérature' },
  actualites: { titre: 'Actualités', description: 'Toutes les nouvelles du mouvement et de la région.', eyebrow: 'Publications' },
  aPropos: { titre: 'À propos', description: 'Objectifs, identification et plan d’action de l’association.', eyebrow: 'Découvrir' },
  contact: { titre: 'Contact', description: 'Écrivez à l’équipe de La Voix d’Abouloussi.', eyebrow: 'Nous joindre' },
  recherche: { titre: 'Recherche', description: 'Retrouvez un article, un journal, un conte ou un poème.', eyebrow: 'Explorer' },
  login: { titre: 'Connexion', description: 'Espace réservé aux administrateurs et rédacteurs.', eyebrow: 'Administration' },
  mentions: { titre: 'Mentions légales', description: 'Informations légales et éditoriales du site.', eyebrow: 'Informations' },
}

function Chantier({ route }: { route: AppRoute }) {
  const infos = TITRES[route.name] ?? { titre: 'Page en reconstruction', description: '', eyebrow: 'La Voix d’Abouloussi' }
  return (
    <>
      <PageHero {...infos} fil={[{ label: 'Accueil', href: '#/' }, { label: infos.titre }]} />
      <section className="section">
        <div className="container-site">
          <div className="app-panel">
            <h3><Icon name="settings" size={18} /> Structure en cours de reconstruction</h3>
            <p>Cette rubrique est présente dans la matrice de migration et sera alimentée à l’étape suivante.</p>
          </div>
        </div>
      </section>
    </>
  )
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
        <div className="admin-topbar">
          <div>
            <span className="section-eyebrow">Administration</span>
            <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Pilotage du site</h1>
          </div>
        </div>
        <div className="app-panel"><p>Les outils CRUD seront disponibles à l’étape administration.</p></div>
      </AdminLayout>
    )
  }

  return (
    <SiteLayout route={route} settings={settings} user={user} onLogout={deconnecter}>
      {route.name === 'home' ? <HomePage /> : <Chantier route={route} />}
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
