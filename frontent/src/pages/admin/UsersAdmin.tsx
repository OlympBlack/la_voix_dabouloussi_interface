import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../services/api'
import type { UserAccount } from '../../types'
import { useToast } from '../../hooks/useToast'
import { EmptyState, ErrorState, LoadingState } from '../../components/States'
import { Icon } from '../../components/Icons'
import { AdminModal, AdminPageHeader, ActionButtons, ConfirmDialog } from './AdminUI'

interface Role { id: number; name: string; label: string }
interface Permission { id: number; name: string; label: string }

interface Formulaire {
  name: string
  email: string
  password: string
  role: string
  actif: boolean
  permissions: number[]
}

const VIDE: Formulaire = { name: '', email: '', password: '', role: 'redacteur', actif: true, permissions: [] }

export function UsersAdmin() {
  const { succes, erreur: notifierErreur } = useToast()
  const [users, setUsers] = useState<UserAccount[] | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [erreur, setErreur] = useState('')
  const [formulaire, setFormulaire] = useState<Formulaire | null>(null)
  const [idEdit, setIdEdit] = useState<number | null>(null)
  const [enCours, setEnCours] = useState(false)
  const [suppression, setSuppression] = useState<UserAccount | null>(null)

  const charger = useCallback(() => {
    api.adminUsers().then((response) => setUsers(response.data)).catch((e: unknown) => setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue'))
  }, [])

  useEffect(() => {
    charger()
    api.adminRoles().then((response) => setRoles(response.data)).catch(() => {})
    api.adminPermissions().then((response) => setPermissions(response.data)).catch(() => {})
  }, [charger])

  const enregistrer = (event: FormEvent) => {
    event.preventDefault()
    if (!formulaire) return
    setEnCours(true)
    const donnees: Record<string, unknown> = {
      name: formulaire.name,
      email: formulaire.email,
      role: formulaire.role,
      actif: formulaire.actif,
      permissions: formulaire.permissions,
    }
    if (formulaire.password) donnees.password = formulaire.password
    api.adminSaveUser(donnees, idEdit ?? undefined)
      .then((response) => { succes(idEdit ? 'Utilisateur mis à jour' : 'Utilisateur créé', response.message); setFormulaire(null); charger() })
      .catch((e: unknown) => notifierErreur('Enregistrement impossible', e instanceof ApiError ? e.message : undefined))
      .finally(() => setEnCours(false))
  }

  const basculerPermission = (id: number) => {
    setFormulaire((etat) => {
      if (!etat) return etat
      const liste = etat.permissions.includes(id)
        ? etat.permissions.filter((item) => item !== id)
        : [...etat.permissions, id]
      return { ...etat, permissions: liste }
    })
  }

  return (
    <>
      <AdminPageHeader
        titre="Utilisateurs et permissions"
        description="Gérez les accès à l'administration."
        actions={<button type="button" className="app-button" onClick={() => { setIdEdit(null); setFormulaire(VIDE) }}><Icon name="plus" size={16} /> Nouvel utilisateur</button>}
      />
      <div className="app-panel">
        {erreur && <ErrorState message={erreur} />}
        {!erreur && !users && <LoadingState />}
        {users && users.length === 0 && <EmptyState titre="Aucun utilisateur" />}
        {users && users.length > 0 && (
          <div className="table-responsive">
            <table className="app-table">
              <thead><tr><th>Nom</th><th>E-mail</th><th>Rôle</th><th>Permissions</th><th>Actif</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td><strong>{user.name}</strong></td>
                    <td>{user.email}</td>
                    <td><span className="app-badge app-badge--primary">{user.role}</span></td>
                    <td style={{ fontSize: 12 }}>{user.permissions.join(', ') || '—'}</td>
                    <td><span className={`app-badge ${user.actif ? 'app-badge--success' : 'app-badge--muted'}`}>{user.actif ? 'oui' : 'non'}</span></td>
                    <td>
                      <ActionButtons
                        onEdit={() => {
                          setIdEdit(user.id)
                          setFormulaire({
                            name: user.name,
                            email: user.email,
                            password: '',
                            role: user.role,
                            actif: user.actif,
                            permissions: permissions.filter((permission) => user.permissions.includes(permission.name)).map((permission) => permission.id),
                          })
                        }}
                        onDelete={() => setSuppression(user)}
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
          titre={idEdit ? 'Modifier l’utilisateur' : 'Nouvel utilisateur'}
          onClose={() => setFormulaire(null)}
          actions={
            <>
              <button type="button" className="app-button app-button--outline" onClick={() => setFormulaire(null)}>Annuler</button>
              <button type="submit" form="formulaire-utilisateur" className="app-button" disabled={enCours}>Enregistrer</button>
            </>
          }
        >
          <form id="formulaire-utilisateur" className="formulaire-grille" onSubmit={enregistrer}>
            <div className="app-form-group">
              <label className="app-label">Nom complet</label>
              <input className="app-field" value={formulaire.name} onChange={(event) => setFormulaire({ ...formulaire, name: event.target.value })} required />
            </div>
            <div className="app-form-group">
              <label className="app-label">E-mail</label>
              <input className="app-field" type="email" value={formulaire.email} onChange={(event) => setFormulaire({ ...formulaire, email: event.target.value })} required />
            </div>
            <div className="app-form-group">
              <label className="app-label">Mot de passe {idEdit && '(laisser vide pour conserver)'}</label>
              <input className="app-field" type="password" minLength={8} value={formulaire.password} onChange={(event) => setFormulaire({ ...formulaire, password: event.target.value })} required={!idEdit} />
            </div>
            <div className="app-form-group">
              <label className="app-label">Rôle</label>
              <select className="app-field" value={formulaire.role} onChange={(event) => setFormulaire({ ...formulaire, role: event.target.value })}>
                {roles.map((role) => <option key={role.id} value={role.name}>{role.label}</option>)}
              </select>
            </div>
            <div className="app-form-group app-form-group--full">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
                <input type="checkbox" checked={formulaire.actif} onChange={(event) => setFormulaire({ ...formulaire, actif: event.target.checked })} />
                Compte actif
              </label>
            </div>
            <div className="app-form-group app-form-group--full">
              <label className="app-label">Permissions supplémentaires</label>
              <div className="row">
                {permissions.map((permission) => (
                  <label key={permission.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <input type="checkbox" checked={formulaire.permissions.includes(permission.id)} onChange={() => basculerPermission(permission.id)} />
                    {permission.label}
                  </label>
                ))}
              </div>
            </div>
          </form>
        </AdminModal>
      )}

      {suppression && (
        <ConfirmDialog
          message={`Supprimer le compte de « ${suppression.name} » ?`}
          onAnnuler={() => setSuppression(null)}
          onConfirmer={() => {
            api.adminDeleteUser(suppression.id)
              .then(() => { succes('Utilisateur supprimé'); setSuppression(null); charger() })
              .catch((e: unknown) => notifierErreur('Suppression impossible', e instanceof ApiError ? e.message : undefined))
          }}
        />
      )}
    </>
  )
}
