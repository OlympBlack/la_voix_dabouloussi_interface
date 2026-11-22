import { useEffect, useState } from 'react'
import { api, ApiError } from '../services/api'
import type { Album } from '../types'
import { PageHero } from '../components/PageHero'
import { ErrorState, LoadingState } from '../components/States'
import { Icon } from '../components/Icons'
import { formatDate } from '../lib/format'

export function AlbumDetailPage({ id }: { id: string }) {
  const [album, setAlbum] = useState<Album | null>(null)
  const [erreur, setErreur] = useState('')
  const [indexPhoto, setIndexPhoto] = useState<number | null>(null)

  useEffect(() => {
    let annule = false
    api.album(id)
      .then((response) => { if (!annule) setAlbum(response.data) })
      .catch((e: unknown) => { if (!annule) setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue') })
    return () => { annule = true }
  }, [id])

  if (erreur) return <div className="container-site section"><ErrorState message={erreur} /></div>
  if (!album) return <div className="container-site section"><LoadingState /></div>

  const photos = album.photos ?? []
  const photoActive = indexPhoto !== null ? photos[indexPhoto] : null

  return (
    <>
      <PageHero
        eyebrow="Galeries photos"
        titre={album.titre}
        description={album.description ?? undefined}
        fil={[{ label: 'Accueil', href: '#/' }, { label: 'Galeries photos', href: '#/albums' }, { label: album.titre }]}
      />
      <section className="section">
        <div className="container-site">
          <p style={{ color: 'var(--color-muted)', marginBottom: 24 }}><Icon name="calendar" size={14} /> {formatDate(album.date_album)} — {photos.length} photo(s)</p>
          {photos.length === 0 && <div className="app-state">Cet album ne contient pas encore de photos.</div>}
          <div className="galerie">
            {photos.map((photo, index) => (
              <button type="button" key={photo.id} onClick={() => setIndexPhoto(index)} aria-label={photo.legende ?? `Photo ${index + 1}`}>
                <img src={photo.url} alt={photo.legende ?? ''} loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {photoActive && (
        <div className="modal-backdrop" onClick={() => setIndexPhoto(null)}>
          <div className="modal lightbox" onClick={(event) => event.stopPropagation()}>
            <div className="modal__head">
              <h3>{photoActive.legende ?? `Photo ${(indexPhoto ?? 0) + 1}`}</h3>
              <button type="button" className="modal__close" onClick={() => setIndexPhoto(null)} aria-label="Fermer"><Icon name="close" /></button>
            </div>
            <div className="modal__body" style={{ padding: 12 }}>
              <img src={photoActive.url} alt={photoActive.legende ?? ''} />
            </div>
            {photos.length > 1 && (
              <div className="modal__foot" style={{ justifyContent: 'space-between' }}>
                <button type="button" className="app-button app-button--outline app-button--sm" onClick={() => setIndexPhoto(((indexPhoto ?? 0) - 1 + photos.length) % photos.length)}>
                  <Icon name="chevron-left" size={14} /> Précédent
                </button>
                <button type="button" className="app-button app-button--outline app-button--sm" onClick={() => setIndexPhoto(((indexPhoto ?? 0) + 1) % photos.length)}>
                  Suivant <Icon name="chevron-right" size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
