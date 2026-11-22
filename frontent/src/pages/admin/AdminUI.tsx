import type { ReactNode } from 'react'
import { Icon } from '../../components/Icons'

export function AdminPageHeader({ titre, description, actions }: { titre: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="admin-topbar">
      <div>
        <span className="section-eyebrow">Administration</span>
        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>{titre}</h1>
        {description && <p style={{ margin: '6px 0 0', color: 'var(--color-muted)' }}>{description}</p>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </div>
  )
}

export function AdminModal({ titre, onClose, children, actions, large = false }: {
  titre: string
  onClose: () => void
  children: ReactNode
  actions?: ReactNode
  large?: boolean
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal ${large ? 'modal--large' : ''}`} onClick={(event) => event.stopPropagation()}>
        <div className="modal__head">
          <h3>{titre}</h3>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Fermer"><Icon name="close" /></button>
        </div>
        <div className="modal__body">{children}</div>
        {actions && <div className="modal__foot">{actions}</div>}
      </div>
    </div>
  )
}

export function ConfirmDialog({ message, onConfirmer, onAnnuler }: {
  message: string
  onConfirmer: () => void
  onAnnuler: () => void
}) {
  return (
    <AdminModal
      titre="Confirmer la suppression"
      onClose={onAnnuler}
      actions={
        <>
          <button type="button" className="app-button app-button--outline" onClick={onAnnuler}>Annuler</button>
          <button type="button" className="app-button app-button--danger" onClick={onConfirmer}>Supprimer</button>
        </>
      }
    >
      <p style={{ margin: 0 }}>{message}</p>
    </AdminModal>
  )
}

export function ActionButtons({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
      <button type="button" className="app-button app-button--outline app-button--sm app-button--icon" onClick={onEdit} aria-label="Modifier"><Icon name="edit" size={14} /></button>
      <button type="button" className="app-button app-button--danger app-button--sm app-button--icon" onClick={onDelete} aria-label="Supprimer"><Icon name="trash" size={14} /></button>
    </div>
  )
}
