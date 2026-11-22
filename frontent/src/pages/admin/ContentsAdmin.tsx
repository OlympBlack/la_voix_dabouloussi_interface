import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../services/api'
import type { Category, Content, Paginated } from '../../types'
import { useToast } from '../../hooks/useToast'
import { EmptyState, ErrorState, LoadingState } from '../../components/States'
import { TablePagination } from '../../components/TablePagination'
import { Icon } from '../../components/Icons'
import { formatShortDate, rubriqueLabel } from '../../lib/format'
import { AdminModal, AdminPageHeader, ActionButtons, ConfirmDialog } from './AdminUI'

const RUBRIQUES = ['journal', 'jda', 'parlement', 'commission', 'conte', 'poeme', 'actualite', 'objectif', 'identification', 'plan', 'page']
const STATUTS = ['brouillon', 'publie', 'archive']

interface Formulaire {
  rubrique: string
  titre: string
  resume: string
  corps: string
  auteur: string
  date_publication: string
  statut: string
  categorie_id: string
  document_nom: string
  a_la_une: boolean
}

const VIDE: Formulaire = {
  rubrique: 'journal', titre: '', resume: '', corps: '', auteur: '',
  date_publication: '', statut: 'brouillon', categorie_id: '', document_nom: '', a_la_une: false,
}

export function ContentsAdmin() {
  const { succes, erreur: notifierErreur } = useToast()
  const [resultats, setResultats] = useState<Paginated<Content> | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [filtres, setFiltres] = useState({ q: '', rubrique: '', statut: '', page: 1 })
  const [erreur, setErreur] = useState('')
  const [formulaire, setFormulaire] = useState<Formulaire | null>(null)
  const [idEdit, setIdEdit] = useState<number | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [document, setDocument] = useState<File | null>(null)
  const [enCours, setEnCours] = useState(false)
  const [suppression, setSuppression] = useState<Content | null>(null)

  const charger = useCallback(() => {
    api.adminContents({ q: filtres.q || undefined, rubrique: filtres.rubrique || undefined, statut: filtres.statut || undefined, page: filtres.page })
      .then((response) => { setResultats(response); setErreur('') })
      .catch((e: unknown) => setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue'))
  }, [filtres])

  useEffect(() => { charger() }, [charger])

  useEffect(() => {
    api.adminCategories(filtres.rubrique || undefined).then((response) => setCategories(response.data)).catch(() => {})
  }, [filtres.rubrique, formulaire?.rubrique])

  const modifier = (cle: keyof Formulaire, valeur: string | boolean) => {
    setFormulaire((etat) => etat ? { ...etat, [cle]: valeur } : etat)
  }

  const ouvrirCreation = () => {
    setIdEdit(null)
    setFormulaire(VIDE)
    setImage(null)
    setDocument(null)
  }

  const ouvrirEdition = (content: Content) => {
    setEnCours(true)
    api.adminContent(content.id)
      .then((response) => {
        const data = response.data
        setIdEdit(data.id)
        setFormulaire({
          rubrique: data.rubrique,
          titre: data.titre,
          resume: data.resume ?? '',
          corps: data.corps ?? '',
          auteur: data.auteur ?? '',
          date_publication: data.date_publication ?? '',
          statut: data.statut,
          categorie_id: data.categorie ? String(data.categorie.id) : '',
          document_nom: data.document_nom ?? '',
          a_la_une: data.a_la_une,
        })
        setImage(null)
        setDocument(null)
      })
      .catch((e: unknown) => notifierErreur('Chargement impossible', e instanceof ApiError ? e.message : undefined))
      .finally(() => setEnCours(false))
  }

  const enregistrer = (event: FormEvent) => {
    event.preventDefault()
    if (!formulaire) return
    setEnCours(true)
    const donnees = new FormData()
    Object.entries(formulaire).forEach(([cle, valeur]) => {
      if (cle === 'a_la_une') return
      donnees.append(cle, String(valeur ?? ''))
    })
    donnees.append('a_la_une', formulaire.a_la_une ? '1' : '0')
    if (image) donnees.append('image', image)
    if (document) donnees.append('document', document)
    api.adminSaveContent(donnees, idEdit ?? undefined)
      .then((response) => {
        succes(idEdit ? 'Contenu mis à jour' : 'Contenu créé', response.message)
        setFormulaire(null)
        charger()
      })
      .catch((e: unknown) => notifierErreur('Enregistrement impossible', e instanceof ApiError ? e.message : undefined))
      .finally(() => setEnCours(false))
  }

  const changerStatut = (content: Content, statut: string) => {
    api.adminContentStatus(content.id, statut)
      .then(() => { succes('Statut mis à jour'); charger() })
      .catch((e: unknown) => notifierErreur('Mise à jour impossible', e instanceof ApiError ? e.message : undefined))
  }

  const confirmerSuppression = () => {
    if (!suppression) return
    api.adminDeleteContent(suppression.id)
      .then(() => { succes('Contenu supprimé'); setSuppression(null); charger() })
      .catch((e: unknown) => notifierErreur('Suppression impossible', e instanceof ApiError ? e.message : undefined))
  }

  return (
    <>
      <AdminPageHeader
        titre="Gestion des contenus"
        description="Créez, publiez et archivez tous les contenus éditoriaux."
        actions={<button type="button" className="app-button" onClick={ouvrirCreation}><Icon name="plus" size={16} /> Nouveau contenu</button>}
      />
      <div className="app-panel">
        <div className="filtres" style={{ marginBottom: 20 }}>
          <div className="champ-recherche">
            <span><Icon name="search" size={16} /></span>
            <input className="app-field" value={filtres.q} onChange={(event) => setFiltres({ ...filtres, q: event.target.value, page: 1 })} placeholder="Titre du contenu..." />
          </div>
          <div className="app-form-group">
            <label className="app-label">Rubrique</label>
            <select className="app-field" value={filtres.rubrique} onChange={(event) => setFiltres({ ...filtres, rubrique: event.target.value, page: 1 })}>
              <option value="">Toutes</option>
              {RUBRIQUES.map((rubrique) => <option key={rubrique} value={rubrique}>{rubriqueLabel(rubrique)}</option>)}
            </select>
          </div>
          <div className="app-form-group">
            <label className="app-label">Statut</label>
            <select className="app-field" value={filtres.statut} onChange={(event) => setFiltres({ ...filtres, statut: event.target.value, page: 1 })}>
              <option value="">Tous</option>
              {STATUTS.map((statut) => <option key={statut} value={statut}>{statut}</option>)}
            </select>
          </div>
        </div>

        {erreur && <ErrorState message={erreur} />}
        {!erreur && !resultats && <LoadingState />}
        {resultats && resultats.data.length === 0 && <EmptyState titre="Aucun contenu" message="Ajustez les filtres ou créez un nouveau contenu." />}
        {resultats && resultats.data.length > 0 && (
          <>
            <div className="table-responsive">
              <table className="app-table">
                <thead>
                  <tr><th>Titre</th><th>Rubrique</th><th>Date</th><th>Statut</th><th>Vues</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {resultats.data.map((content) => (
                    <tr key={content.id}>
                      <td><strong>{content.titre}</strong><br /><span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{content.slug}</span></td>
                      <td>{rubriqueLabel(content.rubrique)}</td>
                      <td>{formatShortDate(content.date_publication ?? content.created_at)}</td>
                      <td>
                        <select
                          className="app-field"
                          style={{ width: 130, padding: '5px 8px', fontSize: 12 }}
                          value={content.statut}
                          onChange={(event) => changerStatut(content, event.target.value)}
                        >
                          {STATUTS.map((statut) => <option key={statut} value={statut}>{statut}</option>)}
                        </select>
                      </td>
                      <td>{content.vues}</td>
                      <td><ActionButtons onEdit={() => ouvrirEdition(content)} onDelete={() => setSuppression(content)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination currentPage={resultats.current_page} lastPage={resultats.last_page} total={resultats.total} onChange={(page) => setFiltres({ ...filtres, page })} />
          </>
        )}
      </div>

      {formulaire && (
        <AdminModal
          titre={idEdit ? 'Modifier le contenu' : 'Nouveau contenu'}
          onClose={() => setFormulaire(null)}
          large
          actions={
            <>
              <button type="button" className="app-button app-button--outline" onClick={() => setFormulaire(null)}>Annuler</button>
              <button type="submit" form="formulaire-contenu" className="app-button" disabled={enCours}>{enCours ? 'Enregistrement...' : 'Enregistrer'}</button>
            </>
          }
        >
          <form id="formulaire-contenu" className="formulaire-grille" onSubmit={enregistrer}>
            <div className="app-form-group">
              <label className="app-label">Rubrique</label>
              <select className="app-field" value={formulaire.rubrique} onChange={(event) => modifier('rubrique', event.target.value)} required>
                {RUBRIQUES.map((rubrique) => <option key={rubrique} value={rubrique}>{rubriqueLabel(rubrique)}</option>)}
              </select>
            </div>
            <div className="app-form-group">
              <label className="app-label">Statut</label>
              <select className="app-field" value={formulaire.statut} onChange={(event) => modifier('statut', event.target.value)} required>
                {STATUTS.map((statut) => <option key={statut} value={statut}>{statut}</option>)}
              </select>
            </div>
            <div className="app-form-group app-form-group--full">
              <label className="app-label">Titre</label>
              <input className="app-field" value={formulaire.titre} onChange={(event) => modifier('titre', event.target.value)} required />
            </div>
            <div className="app-form-group app-form-group--full">
              <label className="app-label">Résumé</label>
              <textarea className="app-field" rows={3} value={formulaire.resume} onChange={(event) => modifier('resume', event.target.value)} />
            </div>
            <div className="app-form-group">
              <label className="app-label">Auteur</label>
              <input className="app-field" value={formulaire.auteur} onChange={(event) => modifier('auteur', event.target.value)} />
            </div>
            <div className="app-form-group">
              <label className="app-label">Date de publication</label>
              <input className="app-field" type="date" value={formulaire.date_publication} onChange={(event) => modifier('date_publication', event.target.value)} />
            </div>
            <div className="app-form-group">
              <label className="app-label">Catégorie</label>
              <select className="app-field" value={formulaire.categorie_id} onChange={(event) => modifier('categorie_id', event.target.value)}>
                <option value="">Aucune</option>
                {categories.map((categorie) => <option key={categorie.id} value={categorie.id}>{categorie.nom}</option>)}
              </select>
            </div>
            <div className="app-form-group">
              <label className="app-label">Nom du document</label>
              <input className="app-field" value={formulaire.document_nom} onChange={(event) => modifier('document_nom', event.target.value)} />
            </div>
            <div className="app-form-group app-form-group--full">
              <label className="app-label">Corps</label>
              <textarea className="app-field" rows={8} value={formulaire.corps} onChange={(event) => modifier('corps', event.target.value)} />
            </div>
            <div className="app-form-group">
              <label className="app-label">Image de couverture</label>
              <input className="app-field" type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] ?? null)} />
            </div>
            <div className="app-form-group">
              <label className="app-label">Document (PDF, Word...)</label>
              <input className="app-field" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip" onChange={(event) => setDocument(event.target.files?.[0] ?? null)} />
            </div>
            <div className="app-form-group app-form-group--full">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
                <input type="checkbox" checked={formulaire.a_la_une} onChange={(event) => modifier('a_la_une', event.target.checked)} />
                Mettre à la une
              </label>
            </div>
          </form>
        </AdminModal>
      )}

      {suppression && <ConfirmDialog message={`Supprimer définitivement « ${suppression.titre} » ?`} onConfirmer={confirmerSuppression} onAnnuler={() => setSuppression(null)} />}
    </>
  )
}
