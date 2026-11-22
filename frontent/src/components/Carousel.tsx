import { useEffect, useState } from 'react'
import { navigate } from '../hooks/useHashRoute'
import { Icon } from './Icons'

export interface CarouselSlide {
  image: string | null
  titre: string
  description: string
  href: string
}

interface CarouselProps {
  slides: CarouselSlide[]
  intervale?: number
  libelleBouton?: string
  className?: string
}

export function Carousel({ slides, intervale = 10000, libelleBouton = 'En savoir plus', className = '' }: CarouselProps) {
  const [actif, setActif] = useState(0)
  const [pause, setPause] = useState(false)

  useEffect(() => {
    if (pause || slides.length <= 1) return
    const timer = window.setInterval(() => {
      setActif((index) => (index + 1) % slides.length)
    }, intervale)
    return () => window.clearInterval(timer)
  }, [pause, slides.length, intervale])

  if (!slides.length) return null

  const aller = (index: number) => setActif(((index % slides.length) + slides.length) % slides.length)

  return (
    <div className={`carousel ${className}`.trim()} onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}>
      <div className="carousel-viewport">
        {slides.map((slide, index) => (
          <div key={`${slide.href}-${index}`} className={`carousel-slide ${index === actif ? 'actif' : ''}`}>
            {slide.image ? (
              <img src={slide.image} alt={slide.titre} />
            ) : (
              <div className="carte-couverture" style={{ height: '100%' }}><Icon name="leaf" size={64} /></div>
            )}
            <span className="carousel-overlay" />
            <div className="carousel-caption">
              <h3>{slide.titre}</h3>
              <p>{slide.description}</p>
              <a
                href={slide.href}
                onClick={(event) => {
                  if (slide.href.startsWith('#/')) {
                    event.preventDefault()
                    navigate(slide.href)
                  }
                }}
                className="app-button app-button--light app-button--sm"
              >
                {libelleBouton} <Icon name="arrow-right" size={14} />
              </a>
            </div>
          </div>
        ))}
        {slides.length > 1 && (
          <>
            <button type="button" className="carousel-control carousel-control--prev" onClick={() => aller(actif - 1)} aria-label="Diapositive précédente">
              <Icon name="chevron-left" />
            </button>
            <button type="button" className="carousel-control carousel-control--next" onClick={() => aller(actif + 1)} aria-label="Diapositive suivante">
              <Icon name="chevron-right" />
            </button>
            <div className="carousel-dots">
              {slides.map((slide, index) => (
                <button
                  type="button"
                  key={`${slide.href}-dot-${index}`}
                  className={index === actif ? 'actif' : ''}
                  onClick={() => aller(index)}
                  aria-label={`Aller à la diapositive ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
