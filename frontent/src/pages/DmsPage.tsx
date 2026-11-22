import { useEffect, useState } from 'react'
import { api, ApiError } from '../services/api'
import type { Content, Paginated } from '../types'
import { PageHero } from '../components/PageHero'
import { ContentCard } from '../components/ContentCard'
import { EmptyState, ErrorState, LoadingState } from '../components/States'
import { TablePagination } from '../components/TablePagination'

export function DmsPage() {
  const [resultats, setResultats] = useState<Paginated<Content> | null>(null)
  const [page, setPage] = useState(1)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    let annule = false
    api.dmsArticles({ page: String(page), per_page: '12' })
      .then((response) => { if (!annule) setResultats(response) })
      .catch((e: unknown) => { if (!annule) setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue') })
    return () => { annule = true }
  }, [page])

  return (
    <>
      <PageHero
        eyebrow="Patrimoine"
        titre="Dis-moi Grand-Père"
        description="Les récits, contes et sagesses transmis par les aînés, racontés par la jeunesse d'Abouloussi."
        fil={[{ label: 'Accueil', href: '#/' }, { label: 'Dis-moi Grand-Père' }]}
      />
      <section className="section section--pale">
        <div className="container-site">
          {erreur && <ErrorState message={erreur} />}
          {!erreur && !resultats && <LoadingState />}
          {resultats && resultats.data.length === 0 && <EmptyState titre="Aucun récit" message="Les prochains récits arrivent bientôt." />}
          {resultats && resultats.data.length > 0 && (
            <>
              <div className="grid grid--3">
                {resultats.data.map((content) => <ContentCard key={content.id} content={content} />)}
              </div>
              <TablePagination currentPage={resultats.current_page} lastPage={resultats.last_page} total={resultats.total} onChange={setPage} />
            </>
          )}
        </div>
      </section>
    </>
  )
}
