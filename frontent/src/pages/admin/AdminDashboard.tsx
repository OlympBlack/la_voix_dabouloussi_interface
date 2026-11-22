import type { AppRoute } from '../../hooks/useHashRoute'
import type { AuthUser } from '../../types'

export function AdminDashboard({ route, user }: { route: AppRoute; user: AuthUser | null }) {
  return (
    <>
      <div className="admin-topbar">
        <div>
          <span className="section-eyebrow">Administration</span>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Pilotage du site</h1>
        </div>
        {user && <span className="app-badge app-badge--success">{user.role}</span>}
      </div>
      <div className="app-panel">
        <p>Onglet : {route.name === 'admin' ? route.tab : 'tableau-de-bord'}</p>
        <p>Les outils CRUD seront disponibles à l'étape administration.</p>
      </div>
    </>
  )
}
