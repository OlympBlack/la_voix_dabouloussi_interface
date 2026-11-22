import { useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../services/api'
import type { AppRoute } from '../hooks/useHashRoute'
import { navigate } from '../hooks/useHashRoute'
import type { Content, Paginated } from '../types'
import { PageHero } from '../components/PageHero'
import { ContentCard } from '../components/ContentCard'
import { EmptyState, ErrorState, LoadingState } from '../components/States'
import { TablePagination } from '../components/TablePagination'
import { Icon } from '../components/Icons'

const RUBRIQUES = [
  ['', 'Toutes les rubriques'],
  ['journal', 'Journaux'],
  ['jda', 'JDA'],
  ['parlement', 'Parlement'],
  ['commission', 'Commissions'],
  ['conte', 'Contes'],
  ['poeme', 'Poèmes'],
  ['actualite', 'Actualités'],
  ['dms', 'Dis-moi Grand-Père'],
]

export function SearchPage({ route }: { route: AppRoute & { name: 'recherche' } }) {
  const params = new URLSearchParams(route.query)
  const qInitiale = params.get('q') ?? ''
  const rubriqueInitiale = params.get('rubrique') ?? ''
  const [recherche, setRecherche] = useState(qInitiale)
  const [rubrique, setRubrique] = useState(rubriqueInitiale)
  const [page, setPage] = useState(1)
  const [resultats, setResultats] = useState<Paginated<Content> | null>(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    let annule = false
    api.search({ q: qInitiale || undefined, rubrique: rubriqueInitiale || undefined, page, per_page: 12 })
      .then((response) => { if (!annule) { setResultats(response); setErreur('') } })
      .catch((e: unknown) => { if (!annule) setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue') })
    return () => { annule = true }
  }, [qInitiale, rubriqueInitiale, page])

  const soumettre = (event: FormEvent) => {
    event.preventDefault()
    setPage(1)
    const query = new URLSearchParams()
    if (recherche.trim()) query.set('q', recherche.trim())
    if (rubrique) query.set('rubrique', rubrique)
    navigate(`/recherche?${query.toString()}`)
  }

  return (
    <>
      <PageHero
        eyebrow="Explorer"
        titre="Rechercher dans les archives"
        description="Mots-clés, auteurs, titres : retrouvez les publications de La Voix d'Abouloussi."
        fil={[{ label: 'Accueil', href: '#/' }, { label: 'Recherche' }]}
      />
      <section className="section section--pale">
        <div className="container-site">
          <form className="filtres" onSubmit={soumettre}>
            <div className="champ-recherche">
              <span><Icon name="search" size={16} /></span>
              <input
                className="app-field"
                value={recherche}
                onChange={(event) => setRecherche(event.target.value)}
                placeholder="Votre recherche..."
                aria-label="Votre recherche"
              />
            </div>
            <div className="app-form-group">
              <label className="app-label" htmlFor="rubrique-recherche">Rubrique</label>
              <select id="rubrique-recherche" className="app-field" value={rubrique} onChange={(event) => setRubrique(event.target.value)}>
                {RUBRIQUES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <button type="submit" className="app-button app-button--sm"><Icon name="search" size={14} /> Rechercher</button>
          </form>

          {qInitiale && <p style={{ marginBottom: 24 }}>Résultats pour <strong>« {qInitiale} »</strong></p>}
          {erreur && <ErrorState message={erreur} />}
          {!erreur && !resultats && <LoadingState />}
          {resultats && resultats.data.length === 0 && (
            <EmptyState titre="Aucun résultat" message="Essayez un autre mot-clé ou une autre rubrique." />
          )}
          {resultats && resultats.data.length > 0 && (
            <>
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
