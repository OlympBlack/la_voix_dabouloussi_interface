import { useEffect, useState } from 'react'
import { api, ApiError } from '../services/api'
import type { Content } from '../types'
import { PageHero } from '../components/PageHero'
import { ContentCard } from '../components/ContentCard'
import { ErrorState, LoadingState } from '../components/States'
import { Icon } from '../components/Icons'
import { contentHref, formatDate, rubriqueLabel } from '../lib/format'
import { nettoyerHtml } from '../lib/sanitize'

export function DetailPage({ slug }: { slug: string }) {
  const [donnees, setDonnees] = useState<{ data: Content; similaires: Content[] } | null>(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    let annule = false
    api.contenu(slug)
      .then((response) => { if (!annule) setDonnees(response) })
      .catch((e: unknown) => { if (!annule) setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue') })
    return () => { annule = true }
  }, [slug])

  if (erreur) return <div className="container-site section"><ErrorState message={erreur} /></div>
  if (!donnees) return <div className="container-site section"><LoadingState /></div>

  const { data: content, similaires } = donnees
  const estPoeme = content.rubrique === 'poeme'
  const racine = contentHref(content.rubrique, content.slug).replace(`/${encodeURIComponent(content.slug)}`, '')

  return (
    <>
      <PageHero
        eyebrow={rubriqueLabel(content.rubrique)}
        titre={content.titre}
        description={content.resume ?? undefined}
        fil={[
          { label: 'Accueil', href: '#/' },
          { label: rubriqueLabel(content.rubrique), href: `${racine.startsWith('#') ? racine : `#${racine}`}` },
          { label: content.titre },
        ]}
      />
      <section className="section">
        <div className="container-site">
          <div className="article-lecture">
            {content.image && <img src={content.image} alt={content.titre} style={{ width: '100%', borderRadius: 'var(--radius)', marginBottom: 30 }} />}
            <div className="article-lecture__meta">
              <span><Icon name="calendar" size={14} /> {formatDate(content.date_publication ?? content.created_at)}</span>
              {content.auteur && <span><Icon name="user" size={14} /> {content.auteur}</span>}
              {content.categorie && <span><Icon name="folder" size={14} /> {content.categorie.nom}</span>}
              <span><Icon name="eye" size={14} /> {content.vues} vues</span>
            </div>
            <div className={estPoeme ? 'poeme-lecture' : 'article-lecture__corps'}>
              {estPoeme
                ? <p style={{ whiteSpace: 'pre-line' }}>{nettoyerHtml(content.corps).replace(/<[^>]*>/g, '')}</p>
                : <div dangerouslySetInnerHTML={{ __html: nettoyerHtml(content.corps) }} />}
            </div>
            {content.document && (
              <div style={{ marginTop: 36 }}>
                <a className="document-download" href={content.document} download={content.document_nom ?? undefined} target="_blank" rel="noreferrer">
                  <Icon name="download" size={20} /> {content.document_nom ?? 'Télécharger le document'}
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {similaires.length > 0 && (
        <section className="section section--pale">
          <div className="container-site">
            <div className="section-head">
              <h2 className="section-title">À lire aussi</h2>
            </div>
            <div className="grid grid--3">
              {similaires.map((item) => <ContentCard key={item.id} content={item} />)}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
