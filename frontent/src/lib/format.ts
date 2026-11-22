export function formatDate(value: string | null | undefined): string {
  if (!value) return 'Date inconnue'
  const date = new Date(value.includes('T') ? value : `${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return 'Date inconnue'
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

export function formatShortDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value.includes('T') ? value : `${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value)
}

export function contentHref(rubrique: string, slug: string): string {
  const sections: Record<string, string> = {
    journal: 'journaux',
    jda: 'jda',
    parlement: 'parlement',
    commission: 'parlement',
    conte: 'contes',
    poeme: 'poemes',
    actualite: 'actualites',
    dms: 'dms',
  }
  return `#/${sections[rubrique] ?? 'contenus'}/${encodeURIComponent(slug)}`
}

export function rubriqueLabel(rubrique: string): string {
  const labels: Record<string, string> = {
    journal: 'Journal',
    jda: 'JDA',
    parlement: 'Parlement',
    commission: 'Commission',
    conte: 'Conte',
    poeme: 'Poème',
    actualite: 'Actualité',
    dms: 'Dis-moi Grand-Père',
    objectif: 'Objectif',
    identification: 'Identification',
    plan: 'Plan',
    administrateur: 'Administration',
    page: 'Page',
    image: 'Image',
  }
  return labels[rubrique] ?? rubrique
}
