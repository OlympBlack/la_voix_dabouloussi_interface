import type { ReactNode } from 'react'
import { Icon } from './Icons'

interface PageHeroProps {
  eyebrow: string
  titre: string
  description?: string
  image?: string
  fil?: Array<{ label: string; href?: string }>
  children?: ReactNode
}

export function PageHero({ eyebrow, titre, description, image, fil, children }: PageHeroProps) {
  return (
    <section
      className={image ? 'page-hero page-hero--image' : 'page-hero'}
      style={image ? { backgroundImage: `url(${image})` } : undefined}
    >
      <div className="container-site">
        {fil && (
          <ol className="fil-ariane">
            {fil.map((item) => (
              <li key={item.label}>
                {item.href ? <a href={item.href}>{item.label}</a> : <span>{item.label}</span>}
              </li>
            ))}
          </ol>
        )}
        <span className="hero-badge"><Icon name="leaf" size={14} />{eyebrow}</span>
        <h1>{titre}</h1>
        {description && <p>{description}</p>}
        {children}
      </div>
    </section>
  )
}
