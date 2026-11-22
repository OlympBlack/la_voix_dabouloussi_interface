import { useEffect, useState } from 'react'
import { api, ApiError } from '../services/api'
import type { HomeData } from '../types'
import { Carousel, type CarouselSlide } from '../components/Carousel'
import { ContentCard } from '../components/ContentCard'
import { ErrorState, LoadingState } from '../components/States'
import { contentHref } from '../lib/format'
import { Icon } from '../components/Icons'

function sectionTitre(titre: string, sousTitre: string, href: string) {
  return (
    <div className="section-head">
      <div>
        <span className="section-eyebrow">{sousTitre}</span>
        <h2 className="section-title">{titre}</h2>
      </div>
      <a href={href} className="app-button app-button--outline app-button--sm">Tout voir <Icon name="arrow-right" size={14} /></a>
    </div>
  )
}

export function HomePage() {
  const [data, setData] = useState<HomeData | null>(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    api.home()
      .then((response) => setData(response.data))
      .catch((e: unknown) => setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue'))
  }, [])

  if (erreur) return <div className="container-site section"><ErrorState message={erreur} /></div>
  if (!data) return <div className="container-site section"><LoadingState message="Chargement du site..." /></div>

  const slides: CarouselSlide[] = data.featured.slice(0, 5).map((content) => ({
    image: content.image,
    titre: content.titre,
    description: content.resume ?? '',
    href: contentHref(content.rubrique, content.slug),
  }))

  return (
    <>
      <section className="hero-accueil">
        <div className="container-site">
          <span className="hero-badge"><Icon name="leaf" size={15} /> Association des Jeunesses Développement Abouloussi</span>
          <h1>La voix des jeunes d'Abouloussi, du Bénin et d'ailleurs</h1>
          <p>Journaux, actualités du JDA, travaux du Parlement des Jeunes de Koko, contes, poèmes et mémoire associative.</p>
          <div className="hero-actions">
            <a href="#/journaux" className="app-button app-button--light">Lire les journaux <Icon name="arrow-right" size={15} /></a>
            <a href="#/a-propos" className="app-button app-button--light">Découvrir l'association</a>
          </div>
        </div>
      </section>

      <div className="container-site" style={{ marginTop: -38, position: 'relative', zIndex: 5 }}>
        <Carousel slides={slides} />
      </div>

      {data.journaux.length > 0 && (
        <section className="section">
          <div className="container-site">
            {sectionTitre('Nos journaux', 'À la une', '#/journaux')}
            <div className="grid grid--3">
              {data.journaux.slice(0, 3).map((content) => <ContentCard key={content.id} content={content} />)}
            </div>
          </div>
        </section>
      )}

      <section className="section section--pale">
        <div className="container-site">
          {sectionTitre('Le JDA et le Parlement', 'Le mouvement', '#/jda')}
          <div className="grid grid--3">
            {[...data.jda.slice(0, 2), ...data.parlement.slice(0, 1)].map((content) => (
              <ContentCard key={`${content.rubrique}-${content.id}`} content={content} />
            ))}
          </div>
        </div>
      </section>

      {data.dms.length > 0 && (
        <section className="section">
          <div className="container-site">
            {sectionTitre('Dis-moi Grand-Père', 'La rubrique culte', '#/dms')}
            <div className="grid grid--3">
              {data.dms.slice(0, 3).map((content) => <ContentCard key={content.id} content={content} compact />)}
            </div>
          </div>
        </section>
      )}

      {(data.contes.length > 0 || data.poemes.length > 0) && (
        <section className="section section--pale">
          <div className="container-site">
            {sectionTitre('Contes et poèmes', 'Littérature', '#/contes')}
            <div className="grid grid--4">
              {[...data.contes.slice(0, 2), ...data.poemes.slice(0, 2)].map((content) => (
                <ContentCard key={`${content.rubrique}-${content.id}`} content={content} compact />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
