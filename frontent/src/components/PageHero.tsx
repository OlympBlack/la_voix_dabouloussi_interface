import type { ReactNode } from 'react'
import { Icon } from './Icons'

interface PageHeroProps {
  eyebrow: string
  titre: string
  description?: string
  fil?: Array<{ label: string; href?: string }>
  children?: ReactNode
}

export function PageHero({ eyebrow, titre, description, fil, children }: PageHeroProps) {
  return (
    <section className="page-hero">
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
