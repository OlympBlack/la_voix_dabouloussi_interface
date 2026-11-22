import { useCallback, useEffect, useState } from 'react'
import { api, ApiError } from '../../services/api'
import type { ContactMessage, Paginated } from '../../types'
import { useToast } from '../../hooks/useToast'
import { EmptyState, ErrorState, LoadingState } from '../../components/States'
import { TablePagination } from '../../components/TablePagination'
import { Icon } from '../../components/Icons'
import { formatShortDate } from '../../lib/format'
import { AdminPageHeader, ConfirmDialog } from './AdminUI'

const STATUTS = ['nouveau', 'traite', 'archive']

export function ContactsAdmin() {
  const { succes, erreur: notifierErreur } = useToast()
  const [resultats, setResultats] = useState<Paginated<ContactMessage> | null>(null)
  const [statut, setStatut] = useState('')
  const [page, setPage] = useState(1)
  const [erreur, setErreur] = useState('')
  const [suppression, setSuppression] = useState<ContactMessage | null>(null)

  const charger = useCallback(() => {
    api.adminContacts({ statut: statut || undefined, page })
      .then(setResultats)
      .catch((e: unknown) => setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue'))
  }, [statut, page])

  useEffect(() => { charger() }, [charger])

  const changerStatut = (contact: ContactMessage, valeur: string) => {
    api.adminUpdateContact(contact.id, valeur)
      .then(() => { succes('Statut mis à jour'); charger() })
      .catch((e: unknown) => notifierErreur('Mise à jour impossible', e instanceof ApiError ? e.message : undefined))
  }

  return (
    <>
      <AdminPageHeader titre="Messages reçus" description="Suivez et traitez les messages du formulaire de contact." />
      <div className="app-panel">
        <div className="filtres">
          <div className="app-form-group">
            <label className="app-label">Statut</label>
            <select className="app-field" value={statut} onChange={(event) => { setStatut(event.target.value); setPage(1) }}>
              <option value="">Tous</option>
              {STATUTS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>
        {erreur && <ErrorState message={erreur} />}
        {!erreur && !resultats && <LoadingState />}
        {resultats && resultats.data.length === 0 && <EmptyState titre="Aucun message" />}
        {resultats && resultats.data.length > 0 && (
          <>
            <div className="table-responsive">
              <table className="app-table">
                <thead><tr><th>Date</th><th>Expéditeur</th><th>Objet</th><th>Message</th><th>Statut</th><th></th></tr></thead>
                <tbody>
                  {resultats.data.map((contact) => (
                    <tr key={contact.id}>
                      <td>{formatShortDate(contact.created_at)}</td>
                      <td><strong>{contact.nom}</strong><br /><span style={{ fontSize: 12 }}>{contact.email}</span><br /><span style={{ fontSize: 12 }}>{contact.telephone}</span></td>
                      <td>{contact.objet ?? '—'}</td>
                      <td style={{ maxWidth: 360 }}>{contact.message}</td>
                      <td>
                        <select className="app-field" style={{ width: 120, padding: '5px 8px', fontSize: 12 }} value={contact.statut} onChange={(event) => changerStatut(contact, event.target.value)}>
                          {STATUTS.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                      </td>
                      <td>
                        <button type="button" className="app-button app-button--danger app-button--sm app-button--icon" onClick={() => setSuppression(contact)} aria-label="Supprimer"><Icon name="trash" size={13} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination currentPage={resultats.current_page} lastPage={resultats.last_page} total={resultats.total} onChange={setPage} />
          </>
        )}
      </div>
      {suppression && (
        <ConfirmDialog
          message={`Supprimer le message de « ${suppression.nom} » ?`}
          onAnnuler={() => setSuppression(null)}
          onConfirmer={() => {
            api.adminDeleteContact(suppression.id)
              .then(() => { succes('Message supprimé'); setSuppression(null); charger() })
              .catch((e: unknown) => notifierErreur('Suppression impossible', e instanceof ApiError ? e.message : undefined))
          }}
        />
      )}
    </>
  )
}
