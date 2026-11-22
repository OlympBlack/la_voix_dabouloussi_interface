import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../services/api'
import type { Category } from '../../types'
import { useToast } from '../../components/ToastViewport'
import { EmptyState, ErrorState, LoadingState } from '../../components/States'
import { Icon } from '../../components/Icons'
import { rubriqueLabel } from '../../lib/format'
import { AdminModal, AdminPageHeader, ActionButtons, ConfirmDialog } from './AdminUI'

const RUBRIQUES = ['journal', 'jda', 'parlement', 'commission', 'conte', 'poeme', 'actualite', 'dms', 'objectif', 'identification', 'plan', 'page']

interface Formulaire {
  rubrique: string
  nom: string
  description: string
  ordre: string
}

const VIDE: Formulaire = { rubrique: 'journal', nom: '', description: '', ordre: '0' }

export function CategoriesAdmin() {
  const { succes, erreur: notifierErreur } = useToast()
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [rubrique, setRubrique] = useState('')
  const [erreur, setErreur] = useState('')
  const [formulaire, setFormulaire] = useState<Formulaire | null>(null)
  const [idEdit, setIdEdit] = useState<number | null>(null)
  const [enCours, setEnCours] = useState(false)
  const [suppression, setSuppression] = useState<Category | null>(null)

  const charger = useCallback(() => {
    api.adminCategories(rubrique || undefined)
      .then((response) => setCategories(response.data))
      .catch((e: unknown) => setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue'))
  }, [rubrique])

  useEffect(() => { charger() }, [charger])

  const enregistrer = (event: FormEvent) => {
    event.preventDefault()
    if (!formulaire) return
    setEnCours(true)
    api.adminSaveCategory({ ...formulaire, ordre: Number(formulaire.ordre) }, idEdit ?? undefined)
      .then((response) => { succes(idEdit ? 'Catégorie mise à jour' : 'Catégorie créée', response.message); setFormulaire(null); charger() })
      .catch((e: unknown) => notifierErreur('Enregistrement impossible', e instanceof ApiError ? e.message : undefined))
      .finally(() => setEnCours(false))
  }

  return (
    <>
      <AdminPageHeader
        titre="Catégories"
        description="Organisez les contenus par rubrique et par catégorie."
        actions={<button type="button" className="app-button" onClick={() => { setIdEdit(null); setFormulaire(VIDE) }}><Icon name="plus" size={16} /> Nouvelle catégorie</button>}
      />
      <div className="app-panel">
        <div className="filtres">
          <div className="app-form-group">
            <label className="app-label">Filtrer par rubrique</label>
            <select className="app-field" value={rubrique} onChange={(event) => setRubrique(event.target.value)}>
              <option value="">Toutes les rubriques</option>
              {RUBRIQUES.map((item) => <option key={item} value={item}>{rubriqueLabel(item)}</option>)}
            </select>
          </div>
        </div>
        {erreur && <ErrorState message={erreur} />}
        {!erreur && !categories && <LoadingState />}
        {categories && categories.length === 0 && <EmptyState titre="Aucune catégorie" />}
        {categories && categories.length > 0 && (
          <div className="table-responsive">
            <table className="app-table">
              <thead><tr><th>Nom</th><th>Rubrique</th><th>Ordre</th><th>Contenus</th><th>Actions</th></tr></thead>
              <tbody>
                {categories.map((categorie) => (
                  <tr key={categorie.id}>
                    <td><strong>{categorie.nom}</strong><br /><span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{categorie.slug}</span></td>
                    <td>{rubriqueLabel(categorie.rubrique)}</td>
                    <td>{categorie.ordre}</td>
                    <td>{categorie.contenus_count ?? 0}</td>
                    <td>
                      <ActionButtons
                        onEdit={() => { setIdEdit(categorie.id); setFormulaire({ rubrique: categorie.rubrique, nom: categorie.nom, description: categorie.description ?? '', ordre: String(categorie.ordre) }) }}
                        onDelete={() => setSuppression(categorie)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formulaire && (
        <AdminModal
          titre={idEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          onClose={() => setFormulaire(null)}
          actions={
            <>
              <button type="button" className="app-button app-button--outline" onClick={() => setFormulaire(null)}>Annuler</button>
              <button type="submit" form="formulaire-categorie" className="app-button" disabled={enCours}>Enregistrer</button>
            </>
          }
        >
          <form id="formulaire-categorie" onSubmit={enregistrer}>
            <div className="formulaire-grille">
              <div className="app-form-group">
                <label className="app-label">Rubrique</label>
                <select className="app-field" value={formulaire.rubrique} onChange={(event) => setFormulaire({ ...formulaire, rubrique: event.target.value })} required>
                  {RUBRIQUES.map((item) => <option key={item} value={item}>{rubriqueLabel(item)}</option>)}
                </select>
              </div>
              <div className="app-form-group">
                <label className="app-label">Ordre d'affichage</label>
                <input className="app-field" type="number" min={0} value={formulaire.ordre} onChange={(event) => setFormulaire({ ...formulaire, ordre: event.target.value })} />
              </div>
              <div className="app-form-group app-form-group--full">
                <label className="app-label">Nom</label>
                <input className="app-field" value={formulaire.nom} onChange={(event) => setFormulaire({ ...formulaire, nom: event.target.value })} required />
              </div>
              <div className="app-form-group app-form-group--full">
                <label className="app-label">Description</label>
                <textarea className="app-field" rows={4} value={formulaire.description} onChange={(event) => setFormulaire({ ...formulaire, description: event.target.value })} />
              </div>
            </div>
          </form>
        </AdminModal>
      )}

      {suppression && (
        <ConfirmDialog
          message={`Supprimer la catégorie « ${suppression.nom} » ?`}
          onAnnuler={() => setSuppression(null)}
          onConfirmer={() => {
            api.adminDeleteCategory(suppression.id)
              .then(() => { succes('Catégorie supprimée'); setSuppression(null); charger() })
              .catch((e: unknown) => notifierErreur('Suppression impossible', e instanceof ApiError ? e.message : undefined))
          }}
        />
      )}
    </>
  )
}
