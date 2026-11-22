import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../services/api'
import { useToast } from '../hooks/useToast'
import { PageHero } from '../components/PageHero'
import { Icon } from '../components/Icons'
import { setting } from '../config/site'

export function ContactPage({ settings }: { settings: Record<string, string> }) {
  const { succes, erreur } = useToast()
  const [formulaire, setFormulaire] = useState({ nom: '', email: '', telephone: '', objet: '', message: '' })
  const [enCours, setEnCours] = useState(false)

  const modifier = (cle: keyof typeof formulaire, valeur: string) => {
    setFormulaire((etat) => ({ ...etat, [cle]: valeur }))
  }

  const soumettre = (event: FormEvent) => {
    event.preventDefault()
    setEnCours(true)
    api.contact(formulaire)
      .then((response) => {
        succes('Message envoyé', response.message)
        setFormulaire({ nom: '', email: '', telephone: '', objet: '', message: '' })
      })
      .catch((e: unknown) => erreur('Envoi impossible', e instanceof ApiError ? e.message : undefined))
      .finally(() => setEnCours(false))
  }

  return (
    <>
      <PageHero
        eyebrow="Nous joindre"
        titre="Contact"
        description="Une question, une proposition de sujet ou un partenariat ? Écrivez-nous, nous vous répondrons."
        fil={[{ label: 'Accueil', href: '#/' }, { label: 'Contact' }]}
      />
      <section className="section">
        <div className="container-site">
          <div className="grid grid--2" style={{ alignItems: 'start' }}>
            <div className="app-panel">
              <h3>Envoyer un message</h3>
              <form onSubmit={soumettre}>
                <div className="formulaire-grille">
                  <div className="app-form-group">
                    <label className="app-label" htmlFor="contact-nom">Nom complet *</label>
                    <input id="contact-nom" className="app-field" required value={formulaire.nom} onChange={(event) => modifier('nom', event.target.value)} />
                  </div>
                  <div className="app-form-group">
                    <label className="app-label" htmlFor="contact-email">E-mail *</label>
                    <input id="contact-email" className="app-field" type="email" required value={formulaire.email} onChange={(event) => modifier('email', event.target.value)} />
                  </div>
                  <div className="app-form-group">
                    <label className="app-label" htmlFor="contact-telephone">Téléphone</label>
                    <input id="contact-telephone" className="app-field" value={formulaire.telephone} onChange={(event) => modifier('telephone', event.target.value)} />
                  </div>
                  <div className="app-form-group">
                    <label className="app-label" htmlFor="contact-objet">Objet</label>
                    <input id="contact-objet" className="app-field" value={formulaire.objet} onChange={(event) => modifier('objet', event.target.value)} />
                  </div>
                  <div className="app-form-group app-form-group--full">
                    <label className="app-label" htmlFor="contact-message">Message *</label>
                    <textarea id="contact-message" className="app-field" rows={7} minLength={10} required value={formulaire.message} onChange={(event) => modifier('message', event.target.value)} />
                  </div>
                </div>
                <button type="submit" className="app-button" disabled={enCours}><Icon name="send" size={16} /> {enCours ? 'Envoi...' : 'Envoyer le message'}</button>
              </form>
            </div>
            <div>
              <div className="app-panel app-panel--muted">
                <h3>Nos coordonnées</h3>
                <div className="stack">
                  <span><Icon name="map" size={16} /> {setting(settings, 'adresse')}</span>
                  <span><Icon name="phone" size={16} /> {setting(settings, 'telephone')}</span>
                  <span><Icon name="phone" size={16} /> {setting(settings, 'telephone2')}</span>
                  <span><Icon name="mail" size={16} /> {setting(settings, 'email')}</span>
                  <span><Icon name="mail" size={16} /> {setting(settings, 'email2')}</span>
                </div>
              </div>
              <div className="app-panel" style={{ marginTop: 20 }}>
                <h3>Administration</h3>
                <p>Administrateurs historiques : Jules-christ GBASSI, Oswald GNASSOUNOU, Ulrich KOUDOGBO et Delco ADOGBO.</p>
                <div className="equipe-cards">
                  {[
                    { image: setting(settings, 'equipe_1'), nom: setting(settings, 'contact_admin_1') },
                    { image: setting(settings, 'equipe_2'), nom: setting(settings, 'contact_admin_2') },
                  ].map((personne, index) => (
                    <figure className="equipe-card" key={personne.nom || index}>
                      {personne.image ? (
                        <img src={personne.image} alt={personne.nom} loading="lazy" />
                      ) : (
                        <span className="carte-couverture"><Icon name="user" size={36} /></span>
                      )}
                      <figcaption>{personne.nom}</figcaption>
                    </figure>
                  ))}
                </div>
                <a href="#/connexion" className="app-button app-button--outline app-button--sm">Accéder à l'espace réservé <Icon name="arrow-right" size={14} /></a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
