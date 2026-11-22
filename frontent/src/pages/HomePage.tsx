import { useEffect, useState } from 'react'
import { api, ApiError } from '../services/api'
import { setting } from '../config/site'
import type { Content, HomeData } from '../types'
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

export function HomePage({ settings }: { settings: Record<string, string> }) {
  const [data, setData] = useState<HomeData | null>(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    api.home()
      .then((response) => { setData(response.data); setErreur('') })
      .catch((e: unknown) => setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue'))
  }, [])

  if (erreur) return <div className="container-site section"><ErrorState message={erreur} /></div>
  if (!data) return <div className="container-site section"><LoadingState message="Chargement du site..." /></div>

  const heroTitre = setting(settings, 'hero_titre')
  const heroSousTitre = setting(settings, 'hero_sous_titre')
  const heroImage = setting(settings, 'hero_image') || setting(settings, 'carousel_1') || data.featured[0]?.image || ''

  const imagesCarousel = [
    setting(settings, 'carousel_1'),
    setting(settings, 'carousel_2'),
    setting(settings, 'carousel_3'),
  ].filter(Boolean)
  const slides: CarouselSlide[] = imagesCarousel.length > 0
    ? imagesCarousel.map((image) => ({ image, titre: heroTitre, description: '', href: '#/' }))
    : data.featured.slice(0, 5).map((content) => ({
      image: content.image,
      titre: content.titre,
      description: content.resume ?? '',
      href: contentHref(content.rubrique, content.slug),
    }))

  const objectif = setting(settings, 'accueil_objectif_texte') || data.objectif[0]?.corps || ''
  const identification = setting(settings, 'accueil_identification_texte') || data.identification[0]?.corps || ''
  const plans = [
    {
      titre: setting(settings, 'plan_demographie_titre'),
      texte: setting(settings, 'plan_demographie_texte'),
      image: data.galerie[0]?.image,
    },
    {
      titre: setting(settings, 'plan_histoire_titre'),
      texte: setting(settings, 'plan_histoire_texte'),
      image: data.galerie[1]?.image,
    },
    {
      titre: setting(settings, 'plan_geographie_titre'),
      texte: setting(settings, 'plan_geographie_texte'),
      image: data.galerie[2]?.image,
    },
  ].map((plan, index) => ({
    ...plan,
    titre: plan.titre || data.plans[index]?.titre || plan.titre,
    texte: plan.texte || data.plans[index]?.corps || '',
  }))

  const histoires: Content[] = [...data.contes, ...data.poemes]

  return (
    <>
      <section
        className="hero-accueil hero-accueil--image"
        style={{ backgroundImage: heroImage ? `linear-gradient(115deg, rgba(0, 56, 0, .9) 0%, rgba(0, 96, 0, .78) 48%, rgba(0, 32, 0, .6) 100%), url("${heroImage}")` : undefined }}
      >
        <div className="container-site">
          <span className="hero-badge"><Icon name="leaf" size={15} /> Association des Jeunes Dynamiques et Actions</span>
          <h1>{heroTitre}</h1>
          <p>{heroSousTitre}</p>
          <div className="hero-actions">
            <a href="#/journaux" className="app-button app-button--light">Mon journal <Icon name="arrow-right" size={15} /></a>
            <a href="#/dis-moi-grand-pere" className="app-button app-button--light">Dis-moi Grand-Père</a>
          </div>
        </div>
      </section>

      {slides.length > 0 && (
        <div className="container-site" style={{ marginTop: -38, position: 'relative', zIndex: 5 }}>
          <Carousel slides={slides} />
        </div>
      )}

      <section className="section section--pale" id="objectif">
        <div className="container-site">
          {sectionTitre(setting(settings, 'accueil_objectif_titre'), 'Notre raison d’être', '#/a-propos')}
          <p className="texte-long texte-large">{objectif}</p>
        </div>
      </section>

      <section className="section" id="identification">
        <div className="container-site">
          {sectionTitre(setting(settings, 'accueil_identification_titre'), 'Identité', '#/a-propos')}
          <p className="texte-long texte-large">{identification}</p>
          <div className="grille-plans">
            {plans.map((plan) => (
              <article className="carte-plan" key={plan.titre}>
                {plan.image && <img src={plan.image} alt={plan.titre} loading="lazy" />}
                <div>
                  <h3>{plan.titre}</h3>
                  <p className="texte-long">{plan.texte}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {data.galerie.length > 0 && (
        <section className="section section--pale">
          <div className="container-site">
            <div className="section-head">
              <div>
                <span className="section-eyebrow">Koko</span>
                <h2 className="section-title">Images de Koko</h2>
              </div>
            </div>
            <div className="grille-galerie">
              {data.galerie.map((image) => (
                <figure className="vignette-galerie" key={image.id}>
                  <img src={image.image ?? ''} alt={image.titre} loading="lazy" />
                  <figcaption>{image.resume || image.titre}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {data.journaux.length > 0 && (
        <section className="section" id="journaux">
          <div className="container-site">
            {sectionTitre('Mon journal', 'Archives', '#/journaux')}
            <div className="grille-journaux grille-journaux--accueil">
              {data.journaux.slice(0, 6).map((journal) => (
                <a className="carte-journal" key={journal.id} href={journal.document ?? '#'} target="_blank" rel="noreferrer" download={journal.document_nom ?? undefined}>
                  <span className="carte-journal__icone"><Icon name="download" /></span>
                  <span className="carte-journal__texte">
                    <strong>{journal.titre}</strong>
                    <small>{journal.document_nom}</small>
                  </span>
                  <span className="carte-journal__action">Ouvrir</span>
                </a>
              ))}
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

      {histoires.length > 0 && (
        <section className="section">
          <div className="container-site">
            {sectionTitre('Dis-moi Grand-Père', 'Contes et poèmes', '#/dis-moi-grand-pere')}
            <p className="texte-long texte-large" style={{ marginBottom: 28 }}>{setting(settings, 'dgp_intro_texte')}</p>
            <div className="grid grid--3">
              {histoires.slice(0, 6).map((content) => <ContentCard key={`${content.rubrique}-${content.id}`} content={content} compact />)}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
