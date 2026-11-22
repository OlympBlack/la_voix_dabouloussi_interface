import { PageHero } from '../components/PageHero'
import { Icon } from '../components/Icons'

export function NotFoundPage() {
  return (
    <>
      <PageHero
        eyebrow="Erreur 404"
        titre="Cette page n'existe pas"
        description="Le lien demandé est introuvable ou la page a été déplacée lors de la reconstruction du site."
        fil={[{ label: 'Accueil', href: '#/' }, { label: 'Page introuvable' }]}
      />
      <section className="section">
        <div className="container-site">
          <div className="app-state">
            <div className="app-state__title"><Icon name="alert" size={30} /> Page introuvable</div>
            <a href="#/" className="app-button" style={{ marginTop: 18 }}>Retour à l'accueil <Icon name="arrow-right" size={15} /></a>
          </div>
        </div>
      </section>
    </>
  )
}
