import { useState, type FormEvent } from 'react'
import { api, ApiError } from '../services/api'
import { saveSession } from '../services/session'
import { navigate } from '../hooks/useHashRoute'
import { useToast } from '../hooks/useToast'
import { PageHero } from '../components/PageHero'
import { Icon } from '../components/Icons'
import type { AuthUser } from '../types'

export function LoginPage({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enCours, setEnCours] = useState(false)
  const { succes, erreur } = useToast()

  const soumettre = (event: FormEvent) => {
    event.preventDefault()
    setEnCours(true)
    api.login(email, password)
      .then((response) => {
        saveSession({ token: response.access_token, user: response.user })
        onLogin(response.user)
        succes('Connexion réussie', `Bienvenue ${response.user.name}`)
        navigate('/admin')
      })
      .catch((e: unknown) => erreur('Connexion refusée', e instanceof ApiError ? e.message : undefined))
      .finally(() => setEnCours(false))
  }

  return (
    <>
      <PageHero
        eyebrow="Administration"
        titre="Connexion à l'espace réservé"
        description="Cet espace est réservé aux administrateurs et rédacteurs de La Voix d'Abouloussi."
        fil={[{ label: 'Accueil', href: '#/' }, { label: 'Connexion' }]}
      />
      <section className="section">
        <div className="container-site" style={{ maxWidth: 520 }}>
          <div className="app-panel">
            <form onSubmit={soumettre}>
              <div className="app-form-group">
                <label className="app-label" htmlFor="login-email">Adresse e-mail</label>
                <input id="login-email" className="app-field" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
              <div className="app-form-group">
                <label className="app-label" htmlFor="login-password">Mot de passe</label>
                <input id="login-password" className="app-field" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Votre mot de passe" />
              </div>
              <button type="submit" className="app-button" disabled={enCours} style={{ width: '100%' }}>
                <Icon name="user" size={16} /> {enCours ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
