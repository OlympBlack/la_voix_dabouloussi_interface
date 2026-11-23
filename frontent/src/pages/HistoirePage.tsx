import { useEffect, useState } from 'react'
import imageDgp from '../assets/dis_moi_grand_pere.jpeg'
import { api, ApiError } from '../services/api'
import { setting } from '../config/site'
import type { Content, HomeData } from '../types'
import { PageHero } from '../components/PageHero'
import { ContentCard } from '../components/ContentCard'
import { ErrorState, LoadingState } from '../components/States'
import { Icon } from '../components/Icons'

const NUMERO_WHATSAPP = '22954470002'
const DEPOTS = ['Un conte', 'Un poème', 'Une légende', 'Un proverbe', 'Un autre texte']

function lienWhatsapp(depot: string): string {
  const message = `Bonjour, je souhaite déposer ${depot.toLowerCase()} dans la rubrique Dis-moi Grand-Père.`
  return `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`
}

function groupe(titre: string, contenus: Content[]) {
  return (
    <>
      <div className="section-head">
        <div>
          <span className="section-eyebrow">Patrimoine itcha</span>
          <h2 className="section-title">{titre}</h2>
        </div>
      </div>
      <div className="grid grid--3">
        {contenus.map((content) => <ContentCard key={content.id} content={content} />)}
      </div>
    </>
  )
}

export function HistoirePage({ settings }: { settings: Record<string, string> }) {
  const [data, setData] = useState<HomeData | null>(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    api.home()
      .then((response) => { setData(response.data); setErreur('') })
      .catch((e: unknown) => setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue'))
  }, [])

  const intro = setting(settings, 'dgp_intro_texte')

  return (
    <>
      <PageHero
        eyebrow="Patrimoine"
        titre="Dis-moi Grand-Père"
        description={intro}
        image={imageDgp}
        fil={[{ label: 'Accueil', href: '#/' }, { label: 'Dis-moi Grand-Père' }]}
      />
      <section className="section">
        <div className="container-site">
          {erreur && <ErrorState message={erreur} />}
          {!erreur && !data && <LoadingState />}
          {data && (
            <>
              {groupe('Contes', data.contes)}
              {groupe('Poèmes', data.poemes)}
            </>
          )}

          <div className="section-depot">
            <div className="section-head">
              <div>
                <span className="section-eyebrow">Vous avez une histoire ?</span>
                <h2 className="section-title">Déposez votre conte, poème, légende ou proverbe</h2>
                <p className="texte-long">
                  Choisissez ce que vous souhaitez partager et contactez-nous directement sur WhatsApp.
                </p>
              </div>
            </div>
            <div className="row">
              {DEPOTS.map((depot) => (
                <a
                  key={depot}
                  href={lienWhatsapp(depot)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="app-button app-button--outline app-button--sm"
                >
                  <Icon name="send" size={14} /> {depot}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
