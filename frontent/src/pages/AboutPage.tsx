import { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { Content, HomeData } from '../types'
import { PageHero } from '../components/PageHero'
import { Icon } from '../components/Icons'
import { nettoyerHtml } from '../lib/sanitize'

function Bloc({ content, titre }: { content: Content | undefined; titre: string }) {
  if (!content) return null
  return (
    <div className="app-panel" style={{ marginBottom: 20 }}>
      <h3>{content.titre || titre}</h3>
      <div className="article-lecture__corps" dangerouslySetInnerHTML={{ __html: nettoyerHtml(content.corps ?? content.resume) }} />
    </div>
  )
}

export function AboutPage() {
  const [data, setData] = useState<HomeData | null>(null)

  useEffect(() => {
    api.home().then((response) => setData(response.data)).catch(() => {})
  }, [])

  return (
    <>
      <PageHero
        eyebrow="Découvrir"
        titre="À propos de La Voix d'Abouloussi"
        description="Une association de jeunesse qui informe, forme et donne une voix à la commune d'Abouloussi depuis les années 2000."
        fil={[{ label: 'Accueil', href: '#/' }, { label: 'À propos' }]}
      />
      <section className="section">
        <div className="container-site">
          <div className="grid grid--2" style={{ alignItems: 'start' }}>
            <div>
              <span className="section-eyebrow">Notre identité</span>
              <h2 className="section-title">Jeunes Dynamiques et Actions</h2>
              <p className="texte-justifie">
                La Voix d'Abouloussi est le magazine de l'association des Jeunes Dynamiques et Actions (JDA).
                Elle publie Mon journal, anime le Parlement des Jeunes de Koko et accompagne les initiatives
                locales dans l'éducation, la culture, l'environnement et la citoyenneté.
              </p>
              <p className="texte-justifie">
                Nos rubriques historiques — JDA, Parlement, Dis-moi Grand-Père, SuperMarché et LIVBET —
                sont aujourd'hui réunies dans une seule plateforme pour préserver et diffuser la mémoire du mouvement.
              </p>
              <div className="stats-grid" style={{ marginTop: 28 }}>
                <div className="stat-card"><span>Rubriques</span><strong>11</strong></div>
                <div className="stat-card"><span>Des administrateurs</span><strong>4</strong></div>
                <div className="stat-card"><span>Parlement</span><strong>Koko</strong></div>
              </div>
            </div>
            <div>
              <Bloc content={data?.identification[0]} titre="Identification" />
              <Bloc content={data?.objectif[0]} titre="Objectifs" />
            </div>
          </div>
        </div>
      </section>

      <section className="section section--pale">
        <div className="container-site">
          <div className="section-head">
            <div>
              <span className="section-eyebrow">Nos engagements</span>
              <h2 className="section-title">Les piliers du mouvement</h2>
            </div>
          </div>
          <div className="grid grid--3">
            {[
              { icone: 'book' as const, titre: 'Informer', texte: 'Publier journaux, rapports et actualités pour rendre les actions visibles.' },
              { icone: 'users' as const, titre: 'Former', texte: 'Donner une tribune aux jeunes via le Parlement et les commissions.' },
              { icone: 'leaf' as const, titre: 'Transmettre', texte: 'Préserver contes, poèmes et récits de Dis-moi Grand-Père.' },
            ].map((pilier) => (
              <div className="app-panel" key={pilier.titre}>
                <span className="app-badge app-badge--success"><Icon name={pilier.icone} size={16} /></span>
                <h3 style={{ marginTop: 14 }}>{pilier.titre}</h3>
                <p style={{ margin: 0 }}>{pilier.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
