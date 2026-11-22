import { useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../services/api'
import type { MarketRayon } from '../../types'
import { useToast } from '../../components/ToastViewport'
import { ErrorState, LoadingState } from '../../components/States'
import { Icon } from '../../components/Icons'
import { formatNumber } from '../../lib/format'
import { AdminPageHeader, ConfirmDialog } from './AdminUI'

interface Produit {
  id: number
  prix: number
  designation: string | null
  rayon: { nom: string }
}

export function MarketAdmin() {
  const { succes, erreur: notifierErreur } = useToast()
  const [rayons, setRayons] = useState<MarketRayon[] | null>(null)
  const [produits, setProduits] = useState<Produit[] | null>(null)
  const [erreur, setErreur] = useState('')
  const [rayonId, setRayonId] = useState('')
  const [prix, setPrix] = useState('')
  const [designation, setDesignation] = useState('')
  const [enCours, setEnCours] = useState(false)
  const [suppression, setSuppression] = useState<Produit | null>(null)

  const charger = () => {
    api.adminMarketRayons()
      .then((response) => {
        setRayons(response.data)
        if (!rayonId && response.data.length > 0) setRayonId(String(response.data[0].id))
      })
      .catch((e: unknown) => setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue'))
    api.adminMarketProduits()
      .then((response) => setProduits(response.data))
      .catch((e: unknown) => setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue'))
  }

  useEffect(() => { charger() }, [])

  const ajouter = (event: FormEvent) => {
    event.preventDefault()
    setEnCours(true)
    api.adminAddProduit(Number(rayonId), Number(prix), designation || undefined)
      .then((response) => { succes('Produit ajouté', response.message); setPrix(''); setDesignation(''); charger() })
      .catch((e: unknown) => notifierErreur('Ajout impossible', e instanceof ApiError ? e.message : undefined))
      .finally(() => setEnCours(false))
  }

  return (
    <>
      <AdminPageHeader titre="SuperMarché et LIVBET" description="Gérez les rayons, les prix et les produits du jeu." />
      <div className="grid grid--2" style={{ alignItems: 'start' }}>
        <div className="app-panel">
          <h3>Ajouter un produit</h3>
          {erreur && <ErrorState message={erreur} />}
          {!erreur && !rayons && <LoadingState />}
          {rayons && rayons.length === 0 && <p>Aucun rayon enregistré dans la base.</p>}
          {rayons && rayons.length > 0 && (
            <form onSubmit={ajouter}>
              <div className="app-form-group">
                <label className="app-label">Rayon</label>
                <select className="app-field" value={rayonId} onChange={(event) => setRayonId(event.target.value)} required>
                  {rayons.map((rayon) => <option key={rayon.id} value={rayon.id}>{rayon.nom} ({rayon.taux} %)</option>)}
                </select>
              </div>
              <div className="app-form-group">
                <label className="app-label">Prix (FCFA)</label>
                <input className="app-field" type="number" min={0} step="0.01" value={prix} onChange={(event) => setPrix(event.target.value)} required />
              </div>
              <div className="app-form-group">
                <label className="app-label">Désignation</label>
                <input className="app-field" value={designation} onChange={(event) => setDesignation(event.target.value)} />
              </div>
              <button type="submit" className="app-button" disabled={enCours}><Icon name="plus" size={16} /> Ajouter</button>
            </form>
          )}
        </div>
        <div className="app-panel">
          <h3>Rayons du jour</h3>
          {rayons?.map((rayon) => (
            <div key={rayon.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--color-line)' }}>
              <div className="row row--between"><strong>{rayon.nom}</strong><span className="app-badge app-badge--success">{rayon.produits_count} produit(s)</span></div>
              <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>
                Min {formatNumber(Number(rayon.prix_min ?? 0))} — Max {formatNumber(Number(rayon.prix_max ?? 0))} FCFA
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="app-panel" style={{ marginTop: 20 }}>
        <h3>Produits enregistrés</h3>
        {!produits && <LoadingState />}
        {produits && produits.length === 0 && <p>Aucun produit enregistré.</p>}
        {produits && produits.length > 0 && (
          <div className="table-responsive">
            <table className="app-table">
              <thead><tr><th>Désignation</th><th>Rayon</th><th>Prix</th><th></th></tr></thead>
              <tbody>
                {produits.map((produit) => (
                  <tr key={produit.id}>
                    <td>{produit.designation ?? `Produit ${produit.id}`}</td>
                    <td>{produit.rayon?.nom ?? '—'}</td>
                    <td>{formatNumber(Number(produit.prix))} FCFA</td>
                    <td>
                      <button type="button" className="app-button app-button--danger app-button--sm app-button--icon" onClick={() => setSuppression(produit)} aria-label="Supprimer"><Icon name="trash" size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {suppression && (
        <ConfirmDialog
          message={`Supprimer le produit « ${suppression.designation ?? suppression.id} » ?`}
          onAnnuler={() => setSuppression(null)}
          onConfirmer={() => {
            api.adminDeleteProduit(suppression.id)
              .then(() => { succes('Produit supprimé'); setSuppression(null); charger() })
              .catch((e: unknown) => notifierErreur('Suppression impossible', e instanceof ApiError ? e.message : undefined))
          }}
        />
      )}
    </>
  )
}
