import { useEffect, useState } from 'react'
import { PageHero } from '../components/PageHero'
import { Icon } from '../components/Icons'

const imagesKokoDecouverte = Object.entries(
  import.meta.glob('../assets/koko_decouverte/*', { eager: true, query: '?url', import: 'default' }) as Record<string, string>,
)
  .sort(([a], [b]) => a.localeCompare(b, 'fr'))
  .map(([chemin, url]) => ({ id: chemin, url }))

export function KokoDecouvertePage() {
  const [indexActif, setIndexActif] = useState<number | null>(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    if (indexActif === null) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIndexActif(null)
      if (event.key === '+' || event.key === '=') setZoom((valeur) => Math.min(4, valeur + 0.25))
      if (event.key === '-') setZoom((valeur) => Math.max(0.5, valeur - 0.25))
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [indexActif])

  const ouvrir = (index: number) => {
    setIndexActif(index)
    setZoom(1)
  }

  return (
    <>
      <PageHero
        eyebrow="Découverte"
        titre="Koko, mon beau village"
        description="Un regard sur Koko, ses visages et ses lieux à travers cette galerie de photographies."
        fil={[{ label: 'Accueil', href: '#/' }, { label: 'Koko, mon beau village' }]}
      />
      <section className="section section--pale">
        <div className="container-site">
          <div className="grille-galerie">
            {imagesKokoDecouverte.map((image, index) => (
              <figure className="vignette-galerie" key={image.id}>
                <button type="button" className="vignette-galerie__button" onClick={() => ouvrir(index)} aria-label="Agrandir l'image">
                  <img src={image.url} alt="Koko, mon beau village" loading="lazy" />
                </button>
              </figure>
            ))}
          </div>
        </div>
      </section>
      {indexActif !== null && (
        <div className="modal-backdrop galerie-lightbox" onClick={() => setIndexActif(null)} role="presentation">
          <div
            className="galerie-lightbox__content"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Visualisation de l'image"
          >
            <button type="button" className="galerie-lightbox__close" onClick={() => setIndexActif(null)} aria-label="Fermer">
              <Icon name="close" size={18} />
            </button>
            <div className="galerie-lightbox__viewport">
              <img
                src={imagesKokoDecouverte[indexActif].url}
                alt="Koko, mon beau village"
                style={{ transform: `scale(${zoom})` }}
              />
            </div>
            <div className="galerie-lightbox__toolbar">
              <button type="button" onClick={() => setZoom((valeur) => Math.max(0.5, valeur - 0.25))} aria-label="Dézoomer">−</button>
              <span>{Math.round(zoom * 100)}%</span>
              <button type="button" onClick={() => setZoom((valeur) => Math.min(4, valeur + 0.25))} aria-label="Zoomer">+</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
