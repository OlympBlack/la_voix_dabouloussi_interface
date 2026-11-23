import imageDgp from '../assets/dis_moi_grand_pere.jpeg'
import type { Content } from '../types'
import { contentHref, formatDate, rubriqueLabel } from '../lib/format'
import { Icon } from './Icons'

interface ContentCardProps {
  content: Content
  compact?: boolean
  showResume?: boolean
}

export function ContentCard({ content, compact = false, showResume = true }: ContentCardProps) {
  return (
    <article className={`app-card ${compact ? 'app-card--compact' : ''}`}>
      <a href={contentHref(content.rubrique, content.slug)} className="app-card__media" aria-label={content.titre}>
        {content.image ? (
          <img src={content.image} alt={content.titre} loading="lazy" />
        ) : content.rubrique === 'conte' || content.rubrique === 'poeme' ? (
          <img src={imageDgp} alt={content.titre} loading="lazy" />
        ) : (
          <span className="carte-couverture"><Icon name={content.document ? 'file' : 'feather'} size={42} /></span>
        )}
        <span className="app-card__badge">{rubriqueLabel(content.rubrique)}</span>
      </a>
      <div className="app-card__body">
        <div className="app-card__meta">
          <Icon name="calendar" size={13} />
          {formatDate(content.date_publication ?? content.created_at)}
          {content.auteur && <><span>·</span><span>{content.auteur}</span></>}
        </div>
        <a href={contentHref(content.rubrique, content.slug)}><h3>{content.titre}</h3></a>
        {showResume && content.resume && <p>{content.resume}</p>}
        <div className="app-card__footer">
          <a href={contentHref(content.rubrique, content.slug)} className="app-button app-button--sm app-button--outline">
            Lire <Icon name="arrow-right" size={13} />
          </a>
          {content.document && <Icon name="download" size={16} aria-label="Document disponible" />}
        </div>
      </div>
    </article>
  )
}
