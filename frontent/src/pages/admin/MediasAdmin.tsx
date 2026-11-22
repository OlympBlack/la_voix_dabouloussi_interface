import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../services/api'
import type { Media, Paginated } from '../../types'
import { useToast } from '../../components/ToastViewport'
import { EmptyState, ErrorState, LoadingState } from '../../components/States'
import { TablePagination } from '../../components/TablePagination'
import { Icon } from '../../components/Icons'
import { AdminPageHeader, ConfirmDialog } from './AdminUI'

export function MediasAdmin() {
  const { succes, erreur: notifierErreur } = useToast()
  const [resultats, setResultats] = useState<Paginated<Media> | null>(null)
  const [type, setType] = useState('')
  const [recherche, setRecherche] = useState('')
  const [terme, setTerme] = useState('')
  const [page, setPage] = useState(1)
  const [fichier, setFichier] = useState<File | null>(null)
  const [rubrique, setRubrique] = useState('')
  const [erreur, setErreur] = useState('')
  const [enCours, setEnCours] = useState(false)
  const [suppression, setSuppression] = useState<Media | null>(null)

  const charger = useCallback(() => {
    api.adminMedias({ type: type || undefined, q: terme || undefined, page: String(page) })
      .then(setResultats)
      .catch((e: unknown) => setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue'))
  }, [type, terme, page])

  useEffect(() => { charger() }, [charger])

  const televerser = (event: FormEvent) => {
    event.preventDefault()
    if (!fichier) return
    setEnCours(true)
    api.adminUpload(fichier, rubrique || undefined)
      .then((response) => { succes('Fichier téléversé', response.message); setFichier(null); setRubrique(''); charger() })
      .catch((e: unknown) => notifierErreur('Téléversement impossible', e instanceof ApiError ? e.message : undefined))
      .finally(() => setEnCours(false))
  }

  const copier = (url: string) => {
    navigator.clipboard?.writeText(url)
      .then(() => succes('URL copiée'))
      .catch(() => notifierErreur('Copie impossible'))
  }

  return (
    <>
      <AdminPageHeader titre="Médiathèque" description="Images et documents utilisés dans les contenus et albums." />
      <div className="app-panel" style={{ marginBottom: 20 }}>
        <form onSubmit={televerser} className="filtres" style={{ marginBottom: 0 }}>
          <div className="app-form-group">
            <label className="app-label">Fichier</label>
            <input className="app-field" type="file" onChange={(event) => setFichier(event.target.files?.[0] ?? null)} required />
          </div>
          <div className="app-form-group">
            <label className="app-label">Rubrique (optionnel)</label>
            <input className="app-field" value={rubrique} onChange={(event) => setRubrique(event.target.value)} placeholder="ex. jda" />
          </div>
          <button type="submit" className="app-button" disabled={enCours || !fichier}><Icon name="plus" size={16} /> {enCours ? 'Envoi...' : 'Téléverser'}</button>
        </form>
      </div>

      <div className="app-panel">
        <form className="filtres" onSubmit={(event) => { event.preventDefault(); setPage(1); setTerme(recherche.trim()) }}>
          <div className="champ-recherche">
            <span><Icon name="search" size={16} /></span>
            <input className="app-field" value={recherche} onChange={(event) => setRecherche(event.target.value)} placeholder="Nom du fichier..." />
          </div>
          <div className="app-form-group">
            <label className="app-label">Type</label>
            <select className="app-field" value={type} onChange={(event) => { setType(event.target.value); setPage(1) }}>
              <option value="">Tous</option>
              <option value="image">Images</option>
              <option value="document">Documents</option>
            </select>
          </div>
          <button type="submit" className="app-button app-button--outline app-button--sm">Filtrer</button>
        </form>

        {erreur && <ErrorState message={erreur} />}
        {!erreur && !resultats && <LoadingState />}
        {resultats && resultats.data.length === 0 && <EmptyState titre="Aucun média" message="Téléversez un premier fichier." />}
        {resultats && resultats.data.length > 0 && (
          <>
            <div className="media-grille">
              {resultats.data.map((media) => (
                <div className="media-item" key={media.id}>
                  {media.type === 'image'
                    ? <img src={media.url} alt={media.alt ?? media.nom} loading="lazy" />
                    : <div className="carte-couverture" style={{ height: 120 }}><Icon name="file" size={36} /></div>}
                  <div className="media-item__infos">
                    <strong>{media.nom}</strong><br />
                    <span>{media.rubrique ?? 'bibliothèque'} · {Math.round(media.taille / 1024)} Ko</span>
                  </div>
                  <div className="media-item__actions">
                    <button type="button" className="app-button app-button--outline app-button--sm" onClick={() => copier(media.url)}>Copier l'URL</button>
                    <button type="button" className="app-button app-button--danger app-button--sm" onClick={() => setSuppression(media)}><Icon name="trash" size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
            <TablePagination currentPage={resultats.current_page} lastPage={resultats.last_page} total={resultats.total} onChange={setPage} />
          </>
        )}
      </div>

      {suppression && (
        <ConfirmDialog
          message={`Supprimer le fichier « ${suppression.nom} » ?`}
          onAnnuler={() => setSuppression(null)}
          onConfirmer={() => {
            api.adminDeleteMedia(suppression.id)
              .then(() => { succes('Média supprimé'); setSuppression(null); charger() })
              .catch((e: unknown) => notifierErreur('Suppression impossible', e instanceof ApiError ? e.message : undefined))
          }}
        />
      )}
    </>
  )
}
