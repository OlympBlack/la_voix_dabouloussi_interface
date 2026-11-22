import { PageHero } from '../components/PageHero'
import { Icon } from '../components/Icons'
import { setting } from '../config/site'

export function MentionsPage({ settings }: { settings: Record<string, string> }) {
  return (
    <>
      <PageHero
        eyebrow="Informations"
        titre="Mentions légales"
        description="Informations éditoriales et légales concernant le site de La Voix d'Abouloussi."
        fil={[{ label: 'Accueil', href: '#/' }, { label: 'Mentions légales' }]}
      />
      <section className="section">
        <div className="container-site" style={{ maxWidth: 860 }}>
          <div className="app-panel">
            <h3>Éditeur du site</h3>
            <p>Association des Jeunes Dynamiques et Actions (JDA), {setting(settings, 'adresse')}.</p>
            <p>Contact : {setting(settings, 'email')} — {setting(settings, 'telephone')}</p>
          </div>
          <div className="app-panel" style={{ marginTop: 20 }}>
            <h3>Direction de la publication</h3>
            <p>Les administrateurs historiques de la Voix d'Abouloussi : Jules-christ GBASSI, Oswald GNASSOUNOU, Ulrich KOUDOGBO et Delco ADOGBO.</p>
          </div>
          <div className="app-panel" style={{ marginTop: 20 }}>
            <h3>Propriété intellectuelle</h3>
            <p>Les textes, photographies, journaux et documents publiés sur ce site sont la propriété de l'association ou de leurs auteurs respectifs. Toute reproduction nécessite une autorisation écrite.</p>
          </div>
          <div className="app-panel" style={{ marginTop: 20 }}>
            <h3>Hébergement et technicalité</h3>
            <p>Le site est composé d'une interface React et d'une API Laravel. Les données éditoriales sont hébergées dans la base de l'association.</p>
            <p><Icon name="mail" size={14} /> {setting(settings, 'email2')}</p>
          </div>
        </div>
      </section>
    </>
  )
}
