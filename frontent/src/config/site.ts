export interface NavLink {
  label: string
  href: string
  match: string[]
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Accueil', href: '#/', match: ['home'] },
  { label: 'Journaux', href: '#/journaux', match: ['journaux'] },
  { label: 'JDA', href: '#/jda', match: ['jda', 'albumDetail'] },
  { label: 'Parlement', href: '#/parlement', match: ['parlement'] },
  { label: 'Dis-moi Grand-Père', href: '#/dms', match: ['dms', 'dmsArticle'] },
  { label: 'Marché', href: '#/marche', match: ['marche'] },
  { label: 'Contact', href: '#/contact', match: ['contact'] },
]

export const PUBLICATION_LINKS: NavLink[] = [
  { label: 'Actualités', href: '#/actualites', match: ['actualites'] },
  { label: 'Contes', href: '#/contes', match: ['contes'] },
  { label: 'Poèmes', href: '#/poemes', match: ['poemes'] },
]

export const MOUVEMENT_LINKS: NavLink[] = [
  { label: 'Le JDA', href: '#/jda', match: ['jda'] },
  { label: 'Parlement des Jeunes', href: '#/parlement', match: ['parlement'] },
  { label: 'Galeries photos', href: '#/albums', match: ['albums', 'albumDetail'] },
]

export const FOOTER_LINKS: NavLink[] = [
  { label: 'À propos', href: '#/a-propos', match: ['aPropos'] },
  { label: 'Mentions légales', href: '#/mentions-legales', match: ['mentions'] },
]

export const DEFAULTS = {
  adresse: '08 BP 0266 Cotonou, Bénin',
  email: 'lavoixdabouloussi@gmail.com',
  email2: 'contact@lavoixdabouloussi.org',
  telephone: '+229 01 97 52 74 24',
  telephone2: '+229 96 11 47 52',
}

export function flatSettings(groupes?: Record<string, Record<string, string>>): Record<string, string> {
  const result: Record<string, string> = {}
  Object.values(groupes ?? {}).forEach((groupe) => {
    Object.entries(groupe).forEach(([cle, valeur]) => {
      if (valeur) result[cle] = valeur
    })
  })
  return result
}

export function setting(settings: Record<string, string>, cle: keyof typeof DEFAULTS): string {
  return settings[cle] ?? DEFAULTS[cle]
}
