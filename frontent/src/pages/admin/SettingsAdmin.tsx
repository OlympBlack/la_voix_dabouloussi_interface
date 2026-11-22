import { useEffect, useState, type FormEvent } from 'react'
import { api, ApiError } from '../../services/api'
import type { Setting } from '../../types'
import { useToast } from '../../components/ToastViewport'
import { ErrorState, LoadingState } from '../../components/States'
import { AdminPageHeader } from './AdminUI'

export function SettingsAdmin() {
  const { succes, erreur: notifierErreur } = useToast()
  const [settings, setSettings] = useState<Setting[] | null>(null)
  const [erreur, setErreur] = useState('')
  const [valeurs, setValeurs] = useState<Record<number, string>>({})
  const [enCours, setEnCours] = useState<number | null>(null)

  useEffect(() => {
    api.adminSettings()
      .then((response) => {
        setSettings(response.data)
        setValeurs(Object.fromEntries(response.data.map((item) => [item.id, item.valeur ?? ''])))
      })
      .catch((e: unknown) => setErreur(e instanceof ApiError ? e.message : 'Erreur inconnue'))
  }, [])

  const enregistrer = (event: FormEvent, setting: Setting) => {
    event.preventDefault()
    setEnCours(setting.id)
    api.adminSaveSetting(setting.id, valeurs[setting.id] ?? '')
      .then((response) => succes('Paramètre enregistré', response.message))
      .catch((e: unknown) => notifierErreur('Enregistrement impossible', e instanceof ApiError ? e.message : undefined))
      .finally(() => setEnCours(null))
  }

  const groupes = (settings ?? []).reduce<Record<string, Setting[]>>((acc, item) => {
    ;(acc[item.groupe] ??= []).push(item)
    return acc
  }, {})

  return (
    <>
      <AdminPageHeader titre="Paramètres du site" description="Coordonnées et textes affichés dans l'en-tête et le pied de page." />
      <div className="app-panel">
        {erreur && <ErrorState message={erreur} />}
        {!erreur && !settings && <LoadingState />}
        {settings && Object.entries(groupes).map(([groupe, liste]) => (
          <div key={groupe} style={{ marginBottom: 28 }}>
            <h3 style={{ textTransform: 'capitalize' }}>{groupe}</h3>
            {liste.map((setting) => (
              <form key={setting.id} className="formulaire-grille" onSubmit={(event) => enregistrer(event, setting)}>
                <div className="app-form-group">
                  <label className="app-label" htmlFor={`setting-${setting.id}`}>{setting.libelle}</label>
                  <input
                    id={`setting-${setting.id}`}
                    className="app-field"
                    value={valeurs[setting.id] ?? ''}
                    onChange={(event) => setValeurs({ ...valeurs, [setting.id]: event.target.value })}
                  />
                  <span className="app-aide">Clé : {setting.cle}</span>
                </div>
                <div className="app-form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" className="app-button app-button--sm" disabled={enCours === setting.id}>{enCours === setting.id ? 'Enregistrement...' : 'Enregistrer'}</button>
                </div>
              </form>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
