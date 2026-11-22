import { Icon, type IconName } from './Icons'

interface StateProps {
  titre?: string
  message?: string
  action?: { label: string; onClick: () => void }
}

export function LoadingState({ message = 'Chargement des données...' }: StateProps) {
  return (
    <div className="app-state" role="status">
      <div className="app-spinner" />
      <p>{message}</p>
    </div>
  )
}

export function EmptyState({ titre = 'Aucune donnée', message, action }: StateProps) {
  return (
    <div className="app-state">
      <div className="app-state__title">{titre}</div>
      {message && <p>{message}</p>}
      {action && (
        <button type="button" className="app-button app-button--outline" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}

export function ErrorState({ titre = 'Une erreur est survenue', message, action }: StateProps) {
  return (
    <div className="app-state">
      <div style={{ color: 'var(--color-danger)' }}><Icon name="alert" size={34} /></div>
      <div className="app-state__title" style={{ marginTop: 10 }}>{titre}</div>
      {message && <p>{message}</p>}
      {action && (
        <button type="button" className="app-button" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}

export function StateIcon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <Icon name={name} size={size} />
}
