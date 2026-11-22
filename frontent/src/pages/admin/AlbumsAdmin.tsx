import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../services/api'
import type { Album } from '../../types'
import { useToast } from '../../hooks/useToast'
import { EmptyState, ErrorState, LoadingState } from '../../components/States'
import { Icon } from '../../components/Icons'
import { formatShortDate, rubriqueLabel } from '../../lib/format'
import { AdminModal, AdminPageHeader, ActionButtons, ConfirmDialog } from './AdminUI'

const RUBRIQUES = ['jda', 'parlement', 'journal', 'actualite', 'dms', 'page']

interface Formulaire {
  titre: string
  description: string
  rubrique: string
  date_album: string
  statut: string
}

const VIDE: Formulaire = { titre: '', description: '', rubrique: 'jda', date_album: '', statut: 'publie' }

export function AlbumsAdmin() {
  const { succes, erreur: notifierErreur } = useToast()
  const [albums, setAlbums] = useState<Album[] | null>(null)
  const [erreur, setErreur] = useState('')
  const [formulaire, setFormulaire] = useState<Formulaire | null>(null)
  const [idEdit, setIdEdit] = useState<number | null>(null)
  const [couverture, setCouverture] = useState<File | null>(null)
  const [enCours, setEnCours] = useState(false)
  const [suppression, setSuppression] = useState<Album | null>(null)
  const [galerie, setGalerie] = useState<Album | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const [legende, setLegende] = useState('')

  const charger = useCallback(() => {
    api.adminAlbums()
      .then((response) => setAlbums(response.data))
      .catch((e: unknown) => setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue'))
  }, [])

  useEffect(() => { charger() }, [charger])

  const ouvrirGalerie = (album: Album) => {
    api.album(album.id)
      .then((response) => setGalerie(response.data))
      .catch((e: unknown) => notifierErreur('Chargement impossible', e instanceof ApiError ? e.message : undefined))
  }

  const enregistrer = (event: FormEvent) => {
    event.preventDefault()
    if (!formulaire) return
    setEnCours(true)
    const donnees = new FormData()
    Object.entries(formulaire).forEach(([cle, valeur]) => donnees.append(cle, String(valeur ?? '')))
    if (couverture) donnees.append('couverture', couverture)
    api.adminSaveAlbum(donnees, idEdit ?? undefined)
      .then((response) => { succes(idEdit ? 'Album mis à jour' : 'Album créé', response.message); setFormulaire(null); charger() })
      .catch((e: unknown) => notifierErreur('Enregistrement impossible', e instanceof ApiError ? e.message : undefined))
      .finally(() => setEnCours(false))
  }

  const ajouterPhoto = (event: FormEvent) => {
    event.preventDefault()
    if (!galerie || !photo) return
    setEnCours(true)
    api.adminAddPhoto(galerie.id, photo, legende || undefined)
      .then((response) => { succes('Photo ajoutée', response.message); setPhoto(null); setLegende(''); ouvrirGalerie(galerie); charger() })
      .catch((e: unknown) => notifierErreur('Ajout impossible', e instanceof ApiError ? e.message : undefined))
      .finally(() => setEnCours(false))
  }

  return (
    <>
      <AdminPageHeader
        titre="Albums photos"
        description="Créez des galeries et ajoutez des reportages visuels."
        actions={<button type="button" className="app-button" onClick={() => { setIdEdit(null); setFormulaire(VIDE); setCouverture(null) }}><Icon name="plus" size={16} /> Nouvel album</button>}
      />
      <div className="app-panel">
        {erreur && <ErrorState message={erreur} />}
        {!erreur && !albums && <LoadingState />}
        {albums && albums.length === 0 && <EmptyState titre="Aucun album" message="Créez une première galerie." />}
        {albums && albums.length > 0 && (
          <div className="table-responsive">
            <table className="app-table">
              <thead><tr><th>Album</th><th>Rubrique</th><th>Date</th><th>Photos</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {albums.map((album) => (
                  <tr key={album.id}>
                    <td>
                      <div className="row" style={{ flexWrap: 'nowrap' }}>
                        {album.url_couverture && <img src={album.url_couverture} alt="" style={{ width: 48, height: 38, objectFit: 'cover', borderRadius: 6 }} />}
                        <div><strong>{album.titre}</strong><br /><span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{album.slug}</span></div>
                      </div>
                    </td>
                    <td>{rubriqueLabel(album.rubrique)}</td>
                    <td>{formatShortDate(album.date_album)}</td>
                    <td>
                      <button type="button" className="app-button app-button--outline app-button--sm" onClick={() => ouvrirGalerie(album)}>
                        <Icon name="image" size={13} /> {album.photos_count ?? 0} photo(s)
                      </button>
                    </td>
                    <td><span className={`app-badge ${album.statut === 'publie' ? 'app-badge--success' : 'app-badge--muted'}`}>{album.statut}</span></td>
                    <td><ActionButtons onEdit={() => { setIdEdit(album.id); setFormulaire({ titre: album.titre, description: album.description ?? '', rubrique: album.rubrique, date_album: album.date_album ?? '', statut: album.statut }); setCouverture(null) }} onDelete={() => setSuppression(album)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formulaire && (
        <AdminModal
          titre={idEdit ? 'Modifier l’album' : 'Nouvel album'}
          onClose={() => setFormulaire(null)}
          actions={
            <>
              <button type="button" className="app-button app-button--outline" onClick={() => setFormulaire(null)}>Annuler</button>
              <button type="submit" form="formulaire-album" className="app-button" disabled={enCours}>Enregistrer</button>
            </>
          }
        >
          <form id="formulaire-album" className="formulaire-grille" onSubmit={enregistrer}>
            <div className="app-form-group app-form-group--full">
              <label className="app-label">Titre</label>
              <input className="app-field" value={formulaire.titre} onChange={(event) => setFormulaire({ ...formulaire, titre: event.target.value })} required />
            </div>
            <div className="app-form-group">
              <label className="app-label">Rubrique</label>
              <select className="app-field" value={formulaire.rubrique} onChange={(event) => setFormulaire({ ...formulaire, rubrique: event.target.value })}>
                {RUBRIQUES.map((rubrique) => <option key={rubrique} value={rubrique}>{rubriqueLabel(rubrique)}</option>)}
              </select>
            </div>
            <div className="app-form-group">
              <label className="app-label">Date de l'album</label>
              <input className="app-field" type="date" value={formulaire.date_album} onChange={(event) => setFormulaire({ ...formulaire, date_album: event.target.value })} />
            </div>
            <div className="app-form-group">
              <label className="app-label">Statut</label>
              <select className="app-field" value={formulaire.statut} onChange={(event) => setFormulaire({ ...formulaire, statut: event.target.value })}>
                <option value="publie">Publié</option>
                <option value="brouillon">Brouillon</option>
                <option value="archive">Archivé</option>
              </select>
            </div>
            <div className="app-form-group">
              <label className="app-label">Image de couverture</label>
              <input className="app-field" type="file" accept="image/*" onChange={(event) => setCouverture(event.target.files?.[0] ?? null)} />
            </div>
            <div className="app-form-group app-form-group--full">
              <label className="app-label">Description</label>
              <textarea className="app-field" rows={4} value={formulaire.description} onChange={(event) => setFormulaire({ ...formulaire, description: event.target.value })} />
            </div>
          </form>
        </AdminModal>
      )}

      {galerie && (
        <AdminModal titre={`Photos — ${galerie.titre}`} onClose={() => setGalerie(null)} large>
          <form onSubmit={ajouterPhoto} className="filtres">
            <div className="app-form-group">
              <label className="app-label">Nouvelle photo</label>
              <input className="app-field" type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} required />
            </div>
            <div className="app-form-group">
              <label className="app-label">Légende</label>
              <input className="app-field" value={legende} onChange={(event) => setLegende(event.target.value)} />
            </div>
            <button type="submit" className="app-button" disabled={enCours || !photo}><Icon name="plus" size={15} /> Ajouter</button>
          </form>
          <div className="galerie" style={{ marginTop: 20 }}>
            {(galerie.photos ?? []).map((item) => (
              <div className="media-item" key={item.id}>
                <img src={item.url} alt={item.legende ?? ''} />
                <div className="media-item__infos">{item.legende ?? `Photo ${item.ordre + 1}`}</div>
                <div className="media-item__actions">
                  <button
                    type="button"
                    className="app-button app-button--danger app-button--sm"
                    onClick={() => {
                      api.adminDeletePhoto(galerie.id, item.id)
                        .then(() => { succes('Photo supprimée'); ouvrirGalerie(galerie); charger() })
                        .catch((e: unknown) => notifierErreur('Suppression impossible', e instanceof ApiError ? e.message : undefined))
                    }}
                  >
                    <Icon name="trash" size={13} /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </AdminModal>
      )}

      {suppression && (
        <ConfirmDialog
          message={`Supprimer l'album « ${suppression.titre} » et toutes ses photos ?`}
          onAnnuler={() => setSuppression(null)}
          onConfirmer={() => {
            api.adminDeleteAlbum(suppression.id)
              .then(() => { succes('Album supprimé'); setSuppression(null); charger() })
              .catch((e: unknown) => notifierErreur('Suppression impossible', e instanceof ApiError ? e.message : undefined))
          }}
        />
      )}
    </>
  )
}
