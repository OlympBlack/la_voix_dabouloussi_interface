import { useEffect, useState } from 'react'
import { api, ApiError } from '../services/api'
import { setting } from '../config/site'
import type { Content, HomeData } from '../types'
import { PageHero } from '../components/PageHero'
import { ContentCard } from '../components/ContentCard'
import { ErrorState, LoadingState } from '../components/States'

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

  const titre = setting(settings, 'dgp_intro_titre')
  const intro = setting(settings, 'dgp_intro_texte')
  const image = setting(settings, 'dgp_intro_image')

  return (
    <>
      <PageHero
        eyebrow="Patrimoine"
        titre="Dis-moi Grand-Père"
        description={intro}
        fil={[{ label: 'Accueil', href: '#/' }, { label: 'Dis-moi Grand-Père' }]}
      />
      <section className="section">
        <div className="container-site">
          <div className="section-intro">
            <span className="section-eyebrow">La rubrique</span>
            <h2 className="section-title">{titre}</h2>
            {image && <img className="image-intro" src={image} alt={titre} loading="lazy" />}
            <p className="texte-long">{intro}</p>
          </div>

          {erreur && <ErrorState message={erreur} />}
          {!erreur && !data && <LoadingState />}
          {data && (
            <>
              {groupe('Contes', data.contes)}
              {groupe('Poèmes', data.poemes)}
            </>
          )}
        </div>
      </section>
    </>
  )
}
