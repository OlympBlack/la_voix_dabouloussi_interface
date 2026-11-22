import { useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../services/api'
import type { MarketRayon } from '../types'
import { useToast } from '../components/ToastViewport'
import { PageHero } from '../components/PageHero'
import { ErrorState, LoadingState } from '../components/States'
import { Icon } from '../components/Icons'
import { formatNumber } from '../lib/format'

interface Livebet {
  id: number
  chiffre: number
  prix_ht: number
  resultat: string
  message: string
  created_at: string
}

export function MarchePage() {
  const [rayons, setRayons] = useState<MarketRayon[] | null>(null)
  const [livebets, setLivebets] = useState<Livebet[]>([])
  const [erreur, setErreur] = useState('')
  const [chiffre, setChiffre] = useState(1)
  const [prix, setPrix] = useState('')
  const [resultat, setResultat] = useState<{ message: string; somme: number } | null>(null)
  const [enCours, setEnCours] = useState(false)
  const { succes, erreur: notifierErreur } = useToast()

  useEffect(() => {
    api.marketRayons()
      .then((response) => {
        setRayons(response.data)
        const max = Math.max(0, ...response.data.map((rayon) => Number(rayon.prix_max ?? 0)))
        if (max > 0) setPrix(String(max))
      })
      .catch((e: unknown) => setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue'))
    api.marketLivebets().then((response) => setLivebets(response.data as Livebet[])).catch(() => {})
  }, [])

  const jouer = (event: FormEvent) => {
    event.preventDefault()
    setEnCours(true)
    api.marketJeu(chiffre, Number(prix))
      .then((response) => {
        setResultat({ message: response.message, somme: response.somme })
        succes('Résultat du jeu', response.message)
        return api.marketLivebets()
      })
      .then((response) => setLivebets(response.data as Livebet[]))
      .catch((e: unknown) => notifierErreur('Jeu impossible', e instanceof ApiError ? e.message : undefined))
      .finally(() => setEnCours(false))
  }

  return (
    <>
      <PageHero
        eyebrow="Marché"
        titre="SuperMarché + LIVBET"
        description="Les rayons du SuperMarché, les prix du jour et le jeu LIVBET de La Voix d'Abouloussi."
        fil={[{ label: 'Accueil', href: '#/' }, { label: 'SuperMarché + LIVBET' }]}
      />
      <section className="section">
        <div className="container-site">
          {erreur && <ErrorState message={erreur} />}
          {!erreur && !rayons && <LoadingState />}
          {rayons && (
            <>
              <div className="section-head">
                <div>
                  <span className="section-eyebrow">Rayons du jour</span>
                  <h2 className="section-title">Prix et disponibilités</h2>
                </div>
              </div>
              {rayons.length === 0 && <div className="app-state">Aucun rayon enregistré pour le moment.</div>}
              <div className="grid grid--3">
                {rayons.map((rayon) => (
                  <div className="app-panel" key={rayon.id}>
                    <div className="row row--between">
                      <h3 style={{ margin: 0 }}>{rayon.nom}</h3>
                      <span className="app-badge app-badge--success">{rayon.produits_count} produit(s)</span>
                    </div>
                    <p style={{ marginTop: 12, color: 'var(--color-muted)' }}>
                      Prix : {rayon.prix_min !== null ? formatNumber(Number(rayon.prix_min)) : '—'} à {rayon.prix_max !== null ? formatNumber(Number(rayon.prix_max)) : '—'} FCFA
                    </p>
                    <p>Taux : {rayon.taux} % — Total HT : {formatNumber(Number(rayon.total_ht))} FCFA</p>
                    {rayon.produits.length > 0 && (
                      <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13 }}>
                        {rayon.produits.slice(0, 6).map((produit) => (
                          <li key={produit.id}>{produit.designation ?? `Produit ${produit.id}`} — {formatNumber(Number(produit.prix))} FCFA</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="section section--pale">
        <div className="container-site">
          <div className="grid grid--2" style={{ alignItems: 'start' }}>
            <div className="app-panel">
              <span className="section-eyebrow">LIVBET</span>
              <h2 className="section-title">Le jeu du chiffre gagnant</h2>
              <p>Choisissez un chiffre et indiquez le prix maximal enregistré. La somme des multiples du chiffre doit donner le prix maximal moins un.</p>
              <form onSubmit={jouer}>
                <div className="formulaire-grille">
                  <div className="app-form-group">
                    <label className="app-label" htmlFor="chiffre-jeu">Votre chiffre</label>
                    <input id="chiffre-jeu" className="app-field" type="number" min={1} max={1000000} value={chiffre} onChange={(event) => setChiffre(Number(event.target.value))} required />
                  </div>
                  <div className="app-form-group">
                    <label className="app-label" htmlFor="prix-jeu">Prix maximal (FCFA)</label>
                    <input id="prix-jeu" className="app-field" type="number" min={0} step="0.01" value={prix} onChange={(event) => setPrix(event.target.value)} required />
                  </div>
                </div>
                <button type="submit" className="app-button" disabled={enCours}><Icon name="play" size={15} /> {enCours ? 'Calcul...' : 'Jouer'}</button>
              </form>
              {resultat && (
                <div className="app-panel app-panel--muted" style={{ marginTop: 20 }}>
                  <h4>{resultat.message}</h4>
                  <p style={{ margin: 0 }}>Somme calculée : {formatNumber(resultat.somme)} FCFA</p>
                </div>
              )}
            </div>
            <div className="app-panel">
              <h3>Derniers jeux</h3>
              {livebets.length === 0 && <p>Aucune partie jouée pour le moment.</p>}
              <div className="table-responsive">
                <table className="app-table">
                  <thead><tr><th>Chiffre</th><th>Prix</th><th>Résultat</th></tr></thead>
                  <tbody>
                    {livebets.slice(0, 12).map((bet) => (
                      <tr key={bet.id}>
                        <td>{bet.chiffre}</td>
                        <td>{formatNumber(Number(bet.prix_ht))}</td>
                        <td><span className={`app-badge ${bet.resultat === 'gagne' ? 'app-badge--success' : 'app-badge--muted'}`}>{bet.resultat}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
