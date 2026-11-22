import { useEffect, useState, type ReactNode } from 'react'
import type { AppRoute } from '../hooks/useHashRoute'
import type { AuthUser } from '../types'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { Icon, type IconName } from './Icons'

interface LayoutProps {
  route: AppRoute
  settings: Record<string, string>
  user: AuthUser | null
  onLogout: () => void
  children: ReactNode
}

export function SiteLayout({ route, settings, user, onLogout, children }: LayoutProps) {
  const [afficherRetour, setAfficherRetour] = useState(false)

  useEffect(() => {
    const onScroll = () => setAfficherRetour(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="site-shell">
      <SiteHeader route={route} settings={settings} user={user} onLogout={onLogout} />
      <main id="contenu-principal">{children}</main>
      <SiteFooter settings={settings} />
      {afficherRetour && (
        <button
          type="button"
          className="retour-haut"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Retour en haut"
        >
          <Icon name="arrow-up" />
        </button>
      )}
    </div>
  )
}

const ONGLETS: Array<{ slug: string; label: string; icone: IconName }> = [
  { slug: 'tableau-de-bord', label: 'Tableau de bord', icone: 'layout' },
  { slug: 'contenus', label: 'Contenus', icone: 'file' },
  { slug: 'categories', label: 'Catégories', icone: 'folder' },
  { slug: 'medias', label: 'Médiathèque', icone: 'image' },
  { slug: 'albums', label: 'Albums photos', icone: 'image' },
  { slug: 'utilisateurs', label: 'Utilisateurs', icone: 'users' },
  { slug: 'contacts', label: 'Messages', icone: 'mail' },
  { slug: 'parametres', label: 'Paramètres', icone: 'settings' },
  { slug: 'marche', label: 'Marché / LIVBET', icone: 'shopping' },
]

export function AdminLayout({ route, settings, user, onLogout, children }: LayoutProps) {
  const ongletActif = route.name === 'admin' ? route.tab : 'tableau-de-bord'

  return (
    <div className="site-shell">
      <SiteHeader route={route} settings={settings} user={user} onLogout={onLogout} />
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div style={{ padding: '0 12px 18px', color: '#fff', fontWeight: 700 }}>
            <Icon name="layout" size={16} /> Espace administrateur
          </div>
          <nav aria-label="Navigation administration">
            {ONGLETS.map((onglet) => (
              <a
                key={onglet.slug}
                href={`#/admin/${onglet.slug}`}
                className={ongletActif === onglet.slug ? 'actif' : ''}
              >
                <Icon name={onglet.icone} size={16} /> {onglet.label}
              </a>
            ))}
            <a href="#/"><Icon name="external" size={16} /> Voir le site</a>
          </nav>
        </aside>
        <div className="admin-contenu">{children}</div>
      </div>
    </div>
  )
}
