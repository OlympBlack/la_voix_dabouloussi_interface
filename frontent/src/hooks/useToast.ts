import { createContext, useContext } from 'react'

export type ToastKind = 'success' | 'error' | 'info' | 'warning'

export interface ToastContextValue {
  notify: (titre: string, message?: string, kind?: ToastKind) => void
  succes: (titre: string, message?: string) => void
  erreur: (titre: string, message?: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast doit etre utilise dans ToastProvider')
  return value
}
