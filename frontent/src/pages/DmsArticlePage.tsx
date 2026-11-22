import { useEffect, useState } from 'react'
import { api, ApiError } from '../services/api'
import type { Content } from '../types'
import { useToast } from '../components/ToastViewport'
import { PageHero } from '../components/PageHero'
import { ErrorState, LoadingState } from '../components/States'
import { ContentCard } from '../components/ContentCard'
import { Icon } from '../components/Icons'
import { formatDate } from '../lib/format'
import { nettoyerHtml } from '../lib/sanitize'

export function DmsArticlePage({ slug }: { slug: string }) {
  const [content, setContent] = useState<Content | null>(null)
  const [similaires, setSimilaires] = useState<Content[]>([])
  const [erreur, setErreur] = useState('')
  const [likes, setLikes] = useState(0)
  const [enCours, setEnCours] = useState(false)
  const { succes, erreur: notifierErreur } = useToast()

  useEffect(() => {
    let annule = false
    api.dmsArticle(slug)
      .then((response) => {
        if (annule) return
        setContent(response.data)
        setLikes(response.data.likes ?? 0)
      })
      .catch((e: unknown) => { if (!annule) setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue') })
    api.dmsArticles({ per_page: '4' })
      .then((response) => { if (!annule) setSimilaires(response.data.filter((item) => item.slug !== slug).slice(0, 3)) })
      .catch(() => {})
    return () => { annule = true }
  }, [slug])

  const aimer = () => {
    if (!content || enCours) return
    setEnCours(true)
    api.dmsLike(content.id)
      .then((response) => { setLikes(response.likes); succes('Merci !', 'Votre appréciation a été enregistrée.') })
      .catch((e: unknown) => notifierErreur('Impossible d’enregistrer', e instanceof ApiError ? e.message : undefined))
      .finally(() => setEnCours(false))
  }

  if (erreur) return <div className="container-site section"><ErrorState message={erreur} /></div>
  if (!content) return <div className="container-site section"><LoadingState /></div>

  return (
    <>
      <PageHero
        eyebrow="Dis-moi Grand-Père"
        titre={content.titre}
        description={content.resume ?? undefined}
        fil={[{ label: 'Accueil', href: '#/' }, { label: 'Dis-moi Grand-Père', href: '#/dms' }, { label: content.titre }]}
      />
      <section className="section">
        <div className="container-site">
          <div className="article-lecture">
            {content.image && <img src={content.image} alt={content.titre} style={{ width: '100%', borderRadius: 'var(--radius)', marginBottom: 30 }} />}
            <div className="article-lecture__meta">
              <span><Icon name="calendar" size={14} /> {formatDate(content.date_publication ?? content.created_at)}</span>
              {content.auteur && <span><Icon name="user" size={14} /> {content.auteur}</span>}
            </div>
            <div className="article-lecture__corps" dangerouslySetInnerHTML={{ __html: nettoyerHtml(content.corps) }} />
            <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 14 }}>
              <button type="button" className="app-button app-button--outline" onClick={aimer} disabled={enCours}>
                <Icon name="heart" size={17} /> J'aime · {likes}
              </button>
              {content.document && (
                <a className="document-download" href={content.document} download={content.document_nom ?? undefined} target="_blank" rel="noreferrer">
                  <Icon name="download" size={18} /> Télécharger
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
      {similaires.length > 0 && (
        <section className="section section--pale">
          <div className="container-site">
            <div className="section-head"><h2 className="section-title">À lire aussi</h2></div>
            <div className="grid grid--3">
              {similaires.map((item) => <ContentCard key={item.id} content={item} compact />)}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
