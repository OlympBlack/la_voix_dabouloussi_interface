import { useEffect, useState } from 'react'
import { api, ApiError } from '../services/api'
import { setting } from '../config/site'
import type { Content, Paginated } from '../types'
import { PageHero } from '../components/PageHero'
import { ContentCard } from '../components/ContentCard'
import { EmptyState, ErrorState, LoadingState } from '../components/States'
import { contentHref } from '../lib/format'
import { Icon } from '../components/Icons'

const COMMISSIONS = [
  ['1- La Commission Environnement', "Cette commission se charge des questions de gestion de l'environnement. Elle organise des journées de salubrité et de reboisement dans les villages en vue de lutter contre la DAL et la désertification. Sensibilise pour l'atteinte des ODD."],
  ['2- La commission Education Sexuelle', "Elle travaille en collaboration avec les agents de santé de l'arrondissement de Koko, ceux de l'hôpital de Bantè et l'hôpital de zone de Savalou. Les points capitaux de ses interventions sont la lutte contre les grossesses en milieu scolaire, l'éducation à la santé sexuelle et l'encouragement à l'utilisation des méthodes de contraception. Cette commission dispose d'une cellule de consultation en conseils et accompagnement en cas de difficulté."],
  ['3- La Commission Education Scolaire', "C'est la commission la plus proche de l'administration et de l'Association des Parents d'Elève. Elle veille au bon déroulement des activités pédagogiques et exhorte surtout les élèves à donner le meilleur d'eux-mêmes. Elle initie depuis 2017 l'organisation des séances de renforcement des capacités en collaboration avec la Fondation Tobé."],
  ['4- La Commission Loisirs et Culture', 'Elle se charge des animations culturelles par la recherche et la valorisation des pratiques des savoir-faire, savoir-vivre et savoir-être itcha. La valorisation des rythmes itcha en vogue et ceux délaissés. Cette commission excite les apprenants à prendre goût de la chose culturelle.'],
  ['5- La Commission Education Civique et Sociale', 'Cette commission travaille avec le Surveillant Général pour instaurer la discipline au CEG-Koko et sensibilise la population au respect des codes de la route.'],
]

export function ParlementPage({ settings }: { settings: Record<string, string> }) {
  const [resultats, setResultats] = useState<Paginated<Content> | null>(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    let annule = false
    api.rubrique('parlement', { per_page: 50 })
      .then((response) => { if (!annule) { setResultats(response); setErreur('') } })
      .catch((e: unknown) => { if (!annule) setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue') })
    return () => { annule = true }
  }, [])

  const contenus = resultats?.data ?? []
  const intro = setting(settings, 'pjk_intro')
  const mission = setting(settings, 'pjk_mission')
  const organisation = setting(settings, 'pjk_organisation')

  return (
    <>
      <PageHero
        eyebrow="PJK"
        titre="Le Parlement des Jeunes de Koko"
        description={intro}
        fil={[{ label: 'Accueil', href: '#/' }, { label: 'PJK' }]}
      />
      <section className="section">
        <div className="container-site">
          <div className="section-intro">
            <span className="section-eyebrow">Le mouvement</span>
            <h2 className="section-title">Le Parlement des Jeunes de Koko</h2>
            <p className="texte-long">{intro}</p>
          </div>
          <div className="section-intro">
            <span className="section-eyebrow">Pourquoi ?</span>
            <h2 className="section-title">Mission</h2>
            <p className="texte-long">{mission}</p>
          </div>
          <div className="section-intro">
            <span className="section-eyebrow">Comment ?</span>
            <h2 className="section-title">Organisation</h2>
            <p className="texte-long">{organisation}</p>
          </div>

          <div className="section-head">
            <div>
              <span className="section-eyebrow">Les cinq piliers</span>
              <h2 className="section-title">Les commissions</h2>
            </div>
          </div>
          <div className="grid grid--3">
            {COMMISSIONS.map(([titreParDefaut, texteParDefaut], index) => {
              const titre = settings[`pjk_commission_${index + 1}_titre`] ?? titreParDefaut
              const texte = settings[`pjk_commission_${index + 1}_texte`] ?? texteParDefaut
              const contenu = contenus.find((item) => item.titre === titre)
              return (
                <article className="app-card" key={titre}>
                  <div className="app-card__body">
                    <h3>{titre}</h3>
                    <p>{texte}</p>
                    {contenu && (
                      <div className="app-card__footer">
                        <a href={contentHref('parlement', contenu.slug)} className="app-button app-button--sm app-button--outline">
                          Lire <Icon name="arrow-right" size={13} />
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>

          <div className="section-head">
            <div>
              <span className="section-eyebrow">Vie du parlement</span>
              <h2 className="section-title">Séances et rencontres</h2>
            </div>
          </div>
          {erreur && <ErrorState message={erreur} />}
          {!erreur && !resultats && <LoadingState />}
          {resultats && resultats.data.length === 0 && (
            <EmptyState titre="Aucune séance" message="Les séances du PJK seront publiées ici." />
          )}
          {contenus.length > 0 && (
            <div className="grid grid--3">
              {contenus.map((content) => <ContentCard key={content.id} content={content} />)}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
