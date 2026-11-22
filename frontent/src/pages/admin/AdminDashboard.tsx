import { useEffect, useState } from 'react'
import { api, ApiError } from '../../services/api'
import type { AdminStats } from '../../types'
import { ErrorState, LoadingState } from '../../components/States'
import { Icon } from '../../components/Icons'
import { formatShortDate, rubriqueLabel } from '../../lib/format'
import { AdminPageHeader } from './AdminUI'
import { ContentsAdmin } from './ContentsAdmin'
import { CategoriesAdmin } from './CategoriesAdmin'
import { MediasAdmin } from './MediasAdmin'
import { AlbumsAdmin } from './AlbumsAdmin'
import { UsersAdmin } from './UsersAdmin'
import { ContactsAdmin } from './ContactsAdmin'
import { SettingsAdmin } from './SettingsAdmin'
import { MarketAdmin } from './MarketAdmin'
import type { AppRoute } from '../../hooks/useHashRoute'

function TableauDeBord() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    api.adminDashboard()
      .then((response) => setStats(response.data))
      .catch((e: unknown) => setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue'))
  }, [])

  if (erreur) return <ErrorState message={erreur} />
  if (!stats) return <LoadingState />

  const cartes = [
    { label: 'Contenus', valeur: stats.total_contenus, icone: 'file' as const },
    { label: 'Publiés', valeur: stats.publies, icone: 'check' as const },
    { label: 'Brouillons', valeur: stats.brouillons, icone: 'edit' as const },
    { label: 'Albums', valeur: stats.albums, icone: 'image' as const },
    { label: 'Médias', valeur: stats.medias, icone: 'folder' as const },
    { label: 'Messages', valeur: stats.messages, icone: 'mail' as const },
    { label: 'Utilisateurs', valeur: stats.utilisateurs, icone: 'users' as const },
    { label: 'Catégories', valeur: stats.categories, icone: 'layout' as const },
  ]

  return (
    <>
      <AdminPageHeader titre="Tableau de bord" description="Vue d'ensemble de La Voix d'Abouloussi." />
      <div className="stats-grid">
        {cartes.map((carte) => (
          <div className="stat-card" key={carte.label}>
            <span><Icon name={carte.icone} size={13} /> {carte.label}</span>
            <strong>{carte.valeur}</strong>
          </div>
        ))}
      </div>
      <div className="grid grid--2">
        <div className="app-panel">
          <h3>Contenus par rubrique</h3>
          <div className="table-responsive">
            <table className="app-table">
              <thead><tr><th>Rubrique</th><th>Nombre</th></tr></thead>
              <tbody>
                {Object.entries(stats.par_rubrique).map(([rubrique, nombre]) => (
                  <tr key={rubrique}><td>{rubriqueLabel(rubrique)}</td><td>{nombre}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="app-panel">
          <h3>Contenus récents</h3>
          <div className="table-responsive">
            <table className="app-table">
              <thead><tr><th>Titre</th><th>Rubrique</th><th>Date</th><th>Statut</th></tr></thead>
              <tbody>
                {stats.recent.map((item) => (
                  <tr key={item.id}>
                    <td>{item.titre}</td>
                    <td>{rubriqueLabel(item.rubrique)}</td>
                    <td>{formatShortDate(item.date_publication)}</td>
                    <td><span className={`app-badge ${item.statut === 'publie' ? 'app-badge--success' : 'app-badge--muted'}`}>{item.statut}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

export function AdminDashboard({ route }: { route: AppRoute }) {
  const onglet = route.name === 'admin' ? route.tab : 'tableau-de-bord'
  switch (onglet) {
    case 'contenus': return <ContentsAdmin />
    case 'categories': return <CategoriesAdmin />
    case 'medias': return <MediasAdmin />
    case 'albums': return <AlbumsAdmin />
    case 'utilisateurs': return <UsersAdmin />
    case 'contacts': return <ContactsAdmin />
    case 'parametres': return <SettingsAdmin />
    case 'marche': return <MarketAdmin />
    default: return <TableauDeBord />
  }
}
