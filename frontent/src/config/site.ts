import { API_BASE_URL } from '../services/api'

export interface NavLink {
  label: string
  href: string
  match: string[]
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Accueil', href: '#/', match: ['home'] },
  { label: 'Mon journal', href: '#/journaux', match: ['journaux'] },
  { label: 'JDA', href: '#/jda', match: ['jda', 'albumDetail'] },
  { label: 'PJK', href: '#/parlement', match: ['parlement'] },
  { label: 'Dis-moi Grand-Père', href: '#/dis-moi-grand-pere', match: ['histoire'] },
  { label: 'Contact', href: '#/contact', match: ['contact'] },
]

export const PUBLICATION_LINKS: NavLink[] = [
  { label: 'Actualités', href: '#/actualites', match: ['actualites'] },
  { label: 'Contes', href: '#/contes', match: ['contes'] },
  { label: 'Poèmes', href: '#/poemes', match: ['poemes'] },
]

export const MOUVEMENT_LINKS: NavLink[] = [
  { label: 'Jeunes Dynamiques et Actions', href: '#/jda', match: ['jda'] },
  { label: 'PJK', href: '#/parlement', match: ['parlement'] },
  { label: 'Galeries photos', href: '#/albums', match: ['albums', 'albumDetail'] },
]

export const FOOTER_LINKS: NavLink[] = [
  { label: 'À propos', href: '#/a-propos', match: ['aPropos'] },
  { label: 'Mentions légales', href: '#/mentions-legales', match: ['mentions'] },
]

export const DEFAULTS = {
  adresse: '08 BP 0266 Cotonou, Bénin',
  email: 'karintobe@hotmail.com',
  email2: 'contact@lavoixdabouloussi.org',
  telephone: '(+229) 01 66 39 10 89',
  telephone2: '+229 96 11 47 52',
  hero_titre: "LA VOIX D'ABOULOUSSI",
  hero_sous_titre: "La voix d'Abouloussi est un magazine de jeunesse créé en 2006. L'objectif est d'amener les élèves à s'approprier de leur propre culture à travers les histoires qu'on leurs raconte et au même titre que leurs parents à s'informer mais surtout les faire lire;",
  hero_image: '',
  carousel_1: '',
  carousel_2: '',
  carousel_3: '',
  accueil_objectif_titre: 'Objectif',
  accueil_objectif_texte: '',
  accueil_identification_titre: 'IDENTIFICATION',
  accueil_identification_texte: '',
  plan_demographie_titre: 'DEMOGRAPHIE',
  plan_demographie_texte: '',
  plan_histoire_titre: 'HISTOIRE',
  plan_histoire_texte: '',
  plan_geographie_titre: 'GEOGRAPHIE',
  plan_geographie_texte: '',
  journal_titre_1: 'La Voix d\'Abouloussi',
  journal_texte_1: '',
  journal_image_1: '',
  journal_titre_2: 'les divinités à koko',
  journal_texte_2: '',
  journal_image_2: '',
  journal_telechargement_titre: 'Télécharger les journaux',
  journal_telechargement_texte: 'Le journal est au numéro 9 grâce à la participation des gens de tout horizon du Bénin. Alors vous pouvez les télécharger en cliquant sur le bouton ouvrir de chaque numéro',
  contact_admin_1: 'Karin OSTERTAG',
  contact_admin_2: 'Ademonla Hyacinth ATTOUNON',
  equipe_1: '',
  equipe_2: '',
  jda_image: '',
  jda_intro: "L'ONG Jeunes Dynamiques et Actions (JDA) est une organisation à but non lucratif règle par la loi de 1901. Elle est politiquement neutre et d'énvergure nationale.",
  jda_objectifs_titre: 'Objetifs',
  jda_objectifs: "L'ONG Jeunes Dynamiques et Actions (JDA) a pour objectif de:\n- oeuvrer pour l'excellence en milieu scolaire\n- Promouvoir l'entrepreneuriat des jeunes\n- Pormouvoir le droit des jeunes, des femmes et des enfants ainsi que des personnes handicapées\n- Oeuvre pour la restauration du couvert végétal.",
  pjk_image: '',
  pjk_intro: 'Il s’agit d’un parlement local créé en 2017 et parrainé par la Fondation Tobé. Ce parlement est composé des responsables de classe du CEG-Koko. Il est le fruit de l’expérience de l’ancien Jeune parlementaire du Bénin Duconois ADJAKOSSA avec l’accompagnement de Hyacinthe Adémonla ATTOUNON, ressortissants de l’école Ayékè.',
  pjk_mission: 'Briser le joug de la honte de parler en publique (ce qui s’observe chez nombre d’apprenants de la localité) et amener les responsable à débattre des problèmes que rencontrent les élèves durant leur cursus en vue de trouver des voies de sortie.',
  pjk_organisation: 'Le Parlement des Jeunes de Koko est composé de cinq commissions à savoir : la commission Environnement, commission Education Scolaire, Commission Education Sexuelle, Commission Loisirs et Culture et la Commission Education Civique et Sociale.',
  dgp_intro_titre: 'Contes, Legendes & Proverbes',
  dgp_intro_texte: 'Dans la quête permanente des fondements de la société itcha, cette rubrique est dédiée au partage des contes et histoires recueillies et des recherches menées auprès des personnes ressources, garants de la culture itcha, qui la protègent, la conservent et la transmettent chaque jour.',
  dgp_intro_image: '',
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

export function mediaUrl(valeur: string): string {
  if (!valeur) return ''
  if (/^https?:\/\//.test(valeur)) return valeur

  const chemin = valeur.replace(/^\.?\//, '')
  const relatif = chemin.startsWith('media/') ? `storage/${chemin}` : chemin
  if (relatif.startsWith('storage/')) {
    return `${API_BASE_URL.replace(/\/api\/?$/, '')}/${relatif}`
  }

  return `/${chemin}`
}

export function setting(settings: Record<string, string>, cle: keyof typeof DEFAULTS): string {
  const valeur = settings[cle] ?? DEFAULTS[cle]
  return cle.endsWith('_image') || cle.startsWith('equipe_') || cle.startsWith('carousel_') || cle.startsWith('slider_')
    ? mediaUrl(valeur)
    : valeur
}
