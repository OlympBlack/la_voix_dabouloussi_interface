import { Icon } from './Icons'
import { setting } from '../config/site'

const LIENS_EXPLOITATION = [
  { label: 'Journaux', href: '#/journaux' },
  { label: 'Le JDA', href: '#/jda' },
  { label: 'Parlement des Jeunes', href: '#/parlement' },
  { label: 'Galeries photos', href: '#/albums' },
  { label: 'Marché', href: '#/marche' },
]

const LIENS_DECOUVRIR = [
  { label: 'Dis-moi Grand-Père', href: '#/dms' },
  { label: 'Contes', href: '#/contes' },
  { label: 'Poèmes', href: '#/poemes' },
  { label: 'Actualités', href: '#/actualites' },
  { label: 'Nous contacter', href: '#/contact' },
]

export function SiteFooter({ settings }: { settings: Record<string, string> }) {
  return (
    <footer className="site-footer">
      <div className="container-site">
        <div className="footer-grid">
          <div>
            <a href="#/" className="brand" style={{ marginBottom: 18 }}>
              <span className="brand-mark">VA</span>
              <span className="brand-texte">
                <strong style={{ color: '#fff' }}>La Voix d'Abouloussi</strong>
                <span>Association • Jeunesse • Développement</span>
              </span>
            </a>
            <p style={{ fontSize: 13.5, marginBottom: 18 }}>
              L'association des Jeunesses Développement Abouloussi donne la parole aux jeunes
              et porte leurs idées à travers le JDA, le Parlement des Jeunes de Koko et ses publications.
            </p>
            <div className="footer-contact">
              <span><Icon name="map" size={14} /> {setting(settings, 'adresse')}</span>
              <span><Icon name="phone" size={14} /> {setting(settings, 'telephone')} · {setting(settings, 'telephone2')}</span>
              <span><Icon name="mail" size={14} /> {setting(settings, 'email')}</span>
            </div>
          </div>
          <div>
            <h4>Explorer</h4>
            <ul>{LIENS_EXPLOITATION.map((lien) => <li key={lien.href}><a href={lien.href}>{lien.label}</a></li>)}</ul>
          </div>
          <div>
            <h4>Découvrir</h4>
            <ul>{LIENS_DECOUVRIR.map((lien) => <li key={lien.href}><a href={lien.href}>{lien.label}</a></li>)}</ul>
          </div>
          <div>
            <h4>Informations</h4>
            <ul>
              <li><a href="#/a-propos">À propos de nous</a></li>
              <li><a href="#/mentions-legales">Mentions légales</a></li>
              <li><a href="#/contact">Contact</a></li>
              <li><a href="#/admin">Espace administrateur</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} La Voix d'Abouloussi — Tous droits réservés.</span>
          <span>Site réalisé par le <a href="#/jda">JDA</a></span>
        </div>
      </div>
    </footer>
  )
}
