import { useEffect, useState } from 'react'
import { api, ApiError } from '../services/api'
import type { Content, Paginated } from '../types'
import { PageHero } from '../components/PageHero'
import { ContentCard } from '../components/ContentCard'
import { EmptyState, ErrorState, LoadingState } from '../components/States'
import { TablePagination } from '../components/TablePagination'
import { Icon } from '../components/Icons'

interface RubriquePageProps {
  titre: string
  description: string
  eyebrow: string
  endpoint: string
}

const ANNEES = Array.from({ length: 22 }, (_, index) => String(new Date().getFullYear() - index))

export function RubriquePage({ titre, description, eyebrow, endpoint }: RubriquePageProps) {
  const [resultats, setResultats] = useState<Paginated<Content> | null>(null)
  const [page, setPage] = useState(1)
  const [recherche, setRecherche] = useState('')
  const [terme, setTerme] = useState('')
  const [annee, setAnnee] = useState('')
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    let annule = false
    api.rubrique(endpoint, { q: terme || undefined, annee: annee || undefined, page, per_page: 12 })
      .then((response) => { if (!annule) { setResultats(response); setErreur('') } })
      .catch((e: unknown) => { if (!annule) setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue') })
    return () => { annule = true }
  }, [endpoint, terme, annee, page])

  const changerFiltre = (action: () => void) => {
    setPage(1)
    action()
  }

  return (
    <>
      <PageHero
        eyebrow={eyebrow}
        titre={titre}
        description={description}
        fil={[{ label: 'Accueil', href: '#/' }, { label: titre }]}
      />
      <section className="section section--pale">
        <div className="container-site">
          <form className="filtres" onSubmit={(event) => { event.preventDefault(); changerFiltre(() => setTerme(recherche.trim())) }}>
            <div className="champ-recherche">
              <span><Icon name="search" size={16} /></span>
              <input
                className="app-field"
                value={recherche}
                onChange={(event) => setRecherche(event.target.value)}
                placeholder="Rechercher dans cette rubrique..."
                aria-label="Rechercher"
              />
            </div>
            <div className="app-form-group">
              <label className="app-label" htmlFor={`annee-${endpoint}`}>Année</label>
              <select
                id={`annee-${endpoint}`}
                className="app-field"
                value={annee}
                onChange={(event) => changerFiltre(() => setAnnee(event.target.value))}
              >
                <option value="">Toutes les années</option>
                {ANNEES.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
            <button type="submit" className="app-button app-button--sm"><Icon name="filter" size={14} /> Filtrer</button>
            {(terme || annee) && (
              <button
                type="button"
                className="app-button app-button--outline app-button--sm"
                onClick={() => { setRecherche(''); changerFiltre(() => { setTerme(''); setAnnee('') }) }}
              >
                Réinitialiser
              </button>
            )}
          </form>

          {erreur && <ErrorState message={erreur} />}
          {!erreur && !resultats && <LoadingState />}
          {resultats && resultats.data.length === 0 && (
            <EmptyState titre="Aucune publication" message="Aucun contenu ne correspond à cette recherche." />
          )}
          {resultats && resultats.data.length > 0 && (
            <>
              <p style={{ color: 'var(--color-muted)', fontSize: 13, marginBottom: 20 }}>
                {resultats.total} publication{resultats.total > 1 ? 's' : ''} — page {resultats.current_page}/{resultats.last_page}
              </p>
              <div className="grid grid--3">
                {resultats.data.map((content) => <ContentCard key={content.id} content={content} />)}
              </div>
              <TablePagination
                currentPage={resultats.current_page}
                lastPage={resultats.last_page}
                total={resultats.total}
                onChange={setPage}
              />
            </>
          )}
        </div>
      </section>
    </>
  )
}
