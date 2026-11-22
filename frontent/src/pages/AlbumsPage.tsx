import { useEffect, useState } from 'react'
import { api, ApiError } from '../services/api'
import type { Album } from '../types'
import { PageHero } from '../components/PageHero'
import { ErrorState, LoadingState } from '../components/States'
import { Icon } from '../components/Icons'
import { formatDate } from '../lib/format'

export function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[] | null>(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    api.albums()
      .then((response) => setAlbums(response.data))
      .catch((e: unknown) => setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue'))
  }, [])

  return (
    <>
      <PageHero
        eyebrow="Médiathèque"
        titre="Galeries photos"
        description="Reportages, cérémonies et activités du JDA et du Parlement des Jeunes de Koko."
        fil={[{ label: 'Accueil', href: '#/' }, { label: 'Galeries photos' }]}
      />
      <section className="section section--pale">
        <div className="container-site">
          {erreur && <ErrorState message={erreur} />}
          {!erreur && !albums && <LoadingState />}
          {albums && albums.length === 0 && <div className="app-state">Aucun album publié pour le moment.</div>}
          {albums && albums.length > 0 && (
            <div className="grid grid--3">
              {albums.map((album) => (
                <article className="app-card" key={album.id}>
                  <a href={`#/albums/${album.id}`} className="app-card__media">
                    {album.url_couverture
                      ? <img src={album.url_couverture} alt={album.titre} loading="lazy" />
                      : <span className="carte-couverture"><Icon name="image" size={42} /></span>}
                    <span className="app-card__badge">{album.photos_count ?? 0} photo(s)</span>
                  </a>
                  <div className="app-card__body">
                    <div className="app-card__meta"><Icon name="calendar" size={13} /> {formatDate(album.date_album)}</div>
                    <a href={`#/albums/${album.id}`}><h3>{album.titre}</h3></a>
                    {album.description && <p>{album.description}</p>}
                    <div className="app-card__footer">
                      <a href={`#/albums/${album.id}`} className="app-button app-button--sm app-button--outline">Voir l'album <Icon name="arrow-right" size={13} /></a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
