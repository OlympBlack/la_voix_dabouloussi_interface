import { useCallback, useState, type ReactNode } from 'react'
import { ToastContext, type ToastKind } from '../hooks/useToast'
import { Icon, type IconName } from './Icons'

interface Toast {
  id: number
  kind: ToastKind
  titre: string
  message?: string
}

const COULEURS: Record<ToastKind, { fond: string; texte: string; icone: IconName }> = {
  success: { fond: '#e7f6e7', texte: '#006400', icone: 'check' },
  error: { fond: '#fdecea', texte: '#c0392b', icone: 'alert' },
  info: { fond: '#e8f2fb', texte: '#1f6fa8', icone: 'info' },
  warning: { fond: '#fff7e8', texte: '#b7791f', icone: 'alert' },
}

let compteur = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const retirer = useCallback((id: number) => {
    setToasts((liste) => liste.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback((titre: string, message?: string, kind: ToastKind = 'info') => {
    const id = ++compteur
    setToasts((liste) => [...liste, { id, titre, message, kind }])
    window.setTimeout(() => retirer(id), 5000)
  }, [retirer])

  const succes = useCallback((titre: string, message?: string) => notify(titre, message, 'success'), [notify])
  const erreur = useCallback((titre: string, message?: string) => notify(titre, message, 'error'), [notify])

  return (
    <ToastContext.Provider value={{ notify, succes, erreur }}>
      {children}
      <div className="toast-viewport" role="status" aria-live="polite">
        {toasts.map((toast) => {
          const couleur = COULEURS[toast.kind]
          return (
            <div key={toast.id} className="toast-item">
              <span className="toast-item__accent" style={{ background: couleur.texte }} />
              <span className="toast-item__icon" style={{ background: couleur.fond, color: couleur.texte }}>
                <Icon name={couleur.icone} />
              </span>
              <div>
                <h4>{toast.titre}</h4>
                {toast.message && <p>{toast.message}</p>}
              </div>
              <button type="button" className="toast-item__close" onClick={() => retirer(toast.id)} aria-label="Fermer">
                <Icon name="close" size={14} />
              </button>
              <span className="toast-item__progress" style={{ background: couleur.texte }} />
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
