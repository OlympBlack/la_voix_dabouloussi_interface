import { Fragment, useState } from 'react'
import type { AppRoute } from '../hooks/useHashRoute'
import type { AuthUser } from '../types'
import { setting } from '../config/site'
import { Icon } from './Icons'

interface SiteHeaderProps {
  route: AppRoute
  settings: Record<string, string>
  user: AuthUser | null
  onLogout: () => void
}

interface NavItem {
  label: string
  href: string
  match: string[]
  rubriques?: string[]
}

const LIENS: NavItem[] = [
  { label: 'Accueil', href: '#/', match: ['home'] },
  { label: 'Mon journal', href: '#/journaux', match: ['journaux'], rubriques: ['journal'] },
  { label: 'JDA', href: '#/jda', match: ['jda', 'albumDetail'], rubriques: ['jda'] },
  { label: 'PJK', href: '#/parlement', match: ['parlement'], rubriques: ['parlement', 'commission'] },
  { label: 'Dis-moi Grand-Père', href: '#/dis-moi-grand-pere', match: ['histoire'], rubriques: ['conte', 'poeme'] },
  { label: 'Contact', href: '#/contact', match: ['contact'] },
]

const SOUS_MENUS: Array<{ label: string; liens: Array<{ label: string; href: string; match: string[] }> }> = [
  {
    label: 'Le Mouvement',
    liens: [
      { label: 'Jeunes Dynamiques et Actions', href: '#/jda', match: ['jda'] },
      { label: 'PJK', href: '#/parlement', match: ['parlement'] },
      { label: 'Galeries photos', href: '#/albums', match: ['albums', 'albumDetail'] },
      { label: 'Nos objectifs', href: '#/a-propos', match: ['aPropos'] },
    ],
  },
]

function estActif(match: string[], route: AppRoute, rubriques: string[] = []): boolean {
  if (match.includes(route.name)) return true
  return route.name === 'detail' && rubriques.includes(route.rubrique)
}

export function SiteHeader({ route, settings, user, onLogout }: SiteHeaderProps) {
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [sousMenuOuvert, setSousMenuOuvert] = useState<string | null>(null)

  return (
    <>
      <div className="sub-header">
        <div className="container-fluide">
          <ul className="left-info">
            <li><Icon name="map" size={13} />{setting(settings, 'adresse')}</li>
            <li><Icon name="phone" size={13} />{setting(settings, 'telephone')}</li>
            <li><Icon name="mail" size={13} />{setting(settings, 'email')}</li>
          </ul>
          <ul className="right-icons">
            <li>Association • Jeunes Dynamiques et Actions</li>
          </ul>
        </div>
      </div>

      <header className="site-header">
        <div className="container-fluide">
          <a href="#/" className="brand" aria-label="Accueil La Voix d'Abouloussi">
            <span className="brand-mark">VA</span>
            <span className="brand-texte">
              <strong>La Voix d'Abouloussi</strong>
              <span>Mon journal & Jeunesse</span>
            </span>
          </a>

          <nav aria-label="Navigation principale">
            <ul className="colcampus-nav">
              {LIENS.map((lien, index) => (
                <Fragment key={lien.label}>
                  <li className={`nav-item ${estActif(lien.match, route, lien.rubriques ?? []) ? 'active' : ''}`}>
                    <a href={lien.href} className="nav-link">{lien.label}</a>
                  </li>
                  {index === 2 && SOUS_MENUS.map((sousMenu) => {
                    const ouvert = sousMenuOuvert === sousMenu.label
                    const actif = sousMenu.liens.some((lienEnfant) => estActif(lienEnfant.match, route))
                    return (
                      <li className={`nav-item nav-dropdown ${actif ? 'active' : ''}`} key={sousMenu.label}>
                        <button
                          type="button"
                          className="nav-link"
                          onClick={() => setSousMenuOuvert(ouvert ? null : sousMenu.label)}
                          aria-expanded={ouvert}
                        >
                          {sousMenu.label} <Icon name="chevron-down" size={13} />
                        </button>
                        {ouvert && (
                          <div className="nav-dropdown-menu">
                            {sousMenu.liens.map((lienEnfant) => (
                              <a key={lienEnfant.href} href={lienEnfant.href}>{lienEnfant.label}</a>
                            ))}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </Fragment>
              ))}
            </ul>
          </nav>

          <div className="header-actions-group">
            <a href="#/recherche" className="header-search-btn" aria-label="Rechercher"><Icon name="search" /></a>
            {user ? (
              <>
                <a href="#/admin" className="header-login-btn"><Icon name="layout" size={16} /><span>{user.name.split(' ')[0]}</span></a>
                <button type="button" className="header-action-btn" onClick={onLogout} aria-label="Se déconnecter"><Icon name="logout" size={17} /></button>
              </>
            ) : (
              <a href="#/connexion" className="header-login-btn"><Icon name="user" size={16} /><span>Connexion</span></a>
            )}
            <button type="button" className="navbar-toggler-btn" onClick={() => setMenuOuvert(true)} aria-label="Ouvrir le menu">
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>

      {menuOuvert && (
        <>
          <button type="button" className="mobile-nav-backdrop" onClick={() => setMenuOuvert(false)} aria-label="Fermer le menu" />
          <aside className="mobile-drawer">
            <div className="row row--between" style={{ marginBottom: 24 }}>
              <span className="brand-mark">VA</span>
              <button type="button" className="navbar-toggler-btn" onClick={() => setMenuOuvert(false)} aria-label="Fermer"><Icon name="close" /></button>
            </div>
            <ul className="colcampus-nav">
              {LIENS.map((lien) => (
                <li key={lien.label} className={estActif(lien.match, route, lien.rubriques ?? []) ? 'active' : ''}>
                  <a href={lien.href} className="nav-link">{lien.label}<Icon name="chevron-right" size={14} /></a>
                </li>
              ))}
              {SOUS_MENUS.flatMap((sousMenu) => sousMenu.liens).map((lien) => (
                <li key={`mobile-${lien.href}`}>
                  <a href={lien.href} className="nav-link">{lien.label}<Icon name="chevron-right" size={14} /></a>
                </li>
              ))}
            </ul>
          </aside>
        </>
      )}
    </>
  )
}
