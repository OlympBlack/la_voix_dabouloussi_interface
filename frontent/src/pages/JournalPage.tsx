import { useEffect, useState } from 'react'
import { api, ApiError } from '../services/api'
import { setting } from '../config/site'
import type { Content } from '../types'
import { PageHero } from '../components/PageHero'
import { ErrorState, LoadingState } from '../components/States'
import { Icon } from '../components/Icons'

export function JournalPage({ settings }: { settings: Record<string, string> }) {
  const [journaux, setJournaux] = useState<Content[] | null>(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    let annule = false
    api.rubrique('journaux', { per_page: 50 })
      .then((response) => { if (!annule) { setJournaux(response.data); setErreur('') } })
      .catch((e: unknown) => { if (!annule) setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue') })
    return () => { annule = true }
  }, [])

  const blocs = [
    {
      titre: setting(settings, 'journal_titre_1'),
      texte: setting(settings, 'journal_texte_1'),
      image: setting(settings, 'journal_image_1'),
    },
    {
      titre: setting(settings, 'journal_titre_2'),
      texte: setting(settings, 'journal_texte_2'),
      image: setting(settings, 'journal_image_2'),
    },
  ]

  return (
    <>
      <PageHero
        eyebrow="Mon journal"
        titre="Mon journal"
        description={setting(settings, 'journal_telechargement_texte')}
        fil={[{ label: 'Accueil', href: '#/' }, { label: 'Mon journal' }]}
      />
      <section className="section section--pale">
        <div className="container-site">
          {blocs.map((bloc, index) => (
            <article className={`journal-bloc ${index % 2 === 1 ? 'journal-bloc--inverse' : ''}`} key={bloc.titre}>
              {bloc.image && (
                <div className="journal-bloc__image">
                  <img src={bloc.image} alt={bloc.titre} loading="lazy" />
                </div>
              )}
              <div className="journal-bloc__contenu">
                <h2>{bloc.titre}</h2>
                <p className="texte-long">{bloc.texte}</p>
              </div>
            </article>
          ))}

          <div className="journal-telechargements">
            <div className="journal-telechargements__titre">
              <span className="section-eyebrow">Archives</span>
              <h2>{setting(settings, 'journal_telechargement_titre')}</h2>
              <p>{setting(settings, 'journal_telechargement_texte')}</p>
            </div>

            {erreur && <ErrorState message={erreur} />}
            {!erreur && !journaux && <LoadingState />}
            {journaux && (
              <div className="grille-journaux">
                {journaux.map((journal) => (
                  <a
                    className="carte-journal"
                    key={journal.id}
                    href={journal.document ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    download={journal.document_nom ?? undefined}
                  >
                    <span className="carte-journal__icone"><Icon name="download" /></span>
                    <span className="carte-journal__texte">
                      <strong>{journal.titre}</strong>
                      <small>{journal.document_nom}</small>
                    </span>
                    <span className="carte-journal__action">Ouvrir</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
