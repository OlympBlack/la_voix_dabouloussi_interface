import { useEffect, useState } from 'react'
import { api, ApiError } from '../services/api'
import { setting } from '../config/site'
import type { Content, Paginated } from '../types'
import { PageHero } from '../components/PageHero'
import { ContentCard } from '../components/ContentCard'
import { EmptyState, ErrorState, LoadingState } from '../components/States'

export function JdaPage({ settings }: { settings: Record<string, string> }) {
  const [resultats, setResultats] = useState<Paginated<Content> | null>(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    let annule = false
    api.rubrique('jda', { per_page: 50 })
      .then((response) => { if (!annule) { setResultats(response); setErreur('') } })
      .catch((e: unknown) => { if (!annule) setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue') })
    return () => { annule = true }
  }, [])

  const intro = setting(settings, 'jda_intro')
  const objectifsTitre = setting(settings, 'jda_objectifs_titre')
  const objectifs = setting(settings, 'jda_objectifs')
  const image = setting(settings, 'jda_image')

  return (
    <>
      <PageHero
        eyebrow="Le mouvement"
        titre="Jeunes Dynamiques et Actions"
        description={intro}
        image={image}
        fil={[{ label: 'Accueil', href: '#/' }, { label: 'JDA' }]}
      />
      <section className="section">
        <div className="container-site">
          <div className="section-intro">
            <span className="section-eyebrow">Nos engagements</span>
            <h2 className="section-title">{objectifsTitre}</h2>
            <p className="texte-long">{objectifs}</p>
          </div>

          <div className="section-head">
            <div>
              <span className="section-eyebrow">Rencontres et rapports</span>
              <h2 className="section-title">Toutes les rencontres</h2>
            </div>
          </div>

          {erreur && <ErrorState message={erreur} />}
          {!erreur && !resultats && <LoadingState />}
          {resultats && resultats.data.length === 0 && (
            <EmptyState titre="Aucune rencontre" message="Les rencontres du JDA seront publiées ici." />
          )}
          {resultats && resultats.data.length > 0 && (
            <div className="grid grid--3">
              {resultats.data.map((content) => <ContentCard key={content.id} content={content} />)}
            </div>
          )}

          <div className="section-intro">
            <span className="section-eyebrow">Contact</span>
            <h2 className="section-title">Nous contacter</h2>
            <p className="texte-long">
              Tél : {setting(settings, 'jda_telephone')}<br />
              <a href={`mailto:${setting(settings, 'jda_email')}`}>{setting(settings, 'jda_email')}</a>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
