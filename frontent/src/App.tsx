import { useEffect, useState } from 'react'
import { api, ApiError } from './services/api'
import type { HomeData } from './types'

export default function App() {
  const [data, setData] = useState<HomeData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.home()
      .then((response) => setData(response.data))
      .catch((e: unknown) => setError(e instanceof ApiError ? e.message : 'Erreur inconnue'))
  }, [])

  return (
    <main className="container-site section">
      <span className="section-eyebrow">La Voix d'Abouloussi</span>
      <h1>Reconstruction — préparation technique</h1>
      {error && <div className="app-panel">{error}</div>}
      {!error && !data && <div className="app-state"><div className="app-spinner" />Chargement des données...</div>}
      {data && (
        <div className="stats-grid">
          <div className="stat-card"><span>Journaux</span><strong>{data.journaux.length}</strong></div>
          <div className="stat-card"><span>Actualités</span><strong>{data.actualites.length}</strong></div>
          <div className="stat-card"><span>JDA</span><strong>{data.jda.length}</strong></div>
          <div className="stat-card"><span>Parlement</span><strong>{data.parlement.length}</strong></div>
        </div>
      )}
    </main>
  )
}
