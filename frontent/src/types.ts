export type Rubrique =
  | 'journal' | 'jda' | 'parlement' | 'commission' | 'conte' | 'poeme'
  | 'actualite' | 'dms' | 'objectif' | 'identification' | 'plan'
  | 'administrateur' | 'page' | 'image';

export type Statut = 'brouillon' | 'publie' | 'archive';

export interface Content {
  id: number;
  rubrique: Rubrique;
  titre: string;
  slug: string;
  resume: string | null;
  corps: string | null;
  auteur: string | null;
  date_publication: string | null;
  statut: Statut;
  image: string | null;
  document: string | null;
  document_nom: string | null;
  meta: Record<string, unknown>;
  a_la_une: boolean;
  vues: number;
  likes?: number | null;
  categorie: { id: number; nom: string; slug: string } | null;
  created_at: string | null;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface HomeData {
  featured: Content[];
  journaux: Content[];
  actualites: Content[];
  jda: Content[];
  parlement: Content[];
  contes: Content[];
  poemes: Content[];
  dms: Content[];
  objectif: Content[];
  identification: Content[];
}

export interface AlbumPhoto {
  id: number;
  image: string;
  url: string;
  legende: string | null;
  ordre: number;
}

export interface Album {
  id: number;
  titre: string;
  slug: string;
  description: string | null;
  rubrique: string;
  couverture: string | null;
  url_couverture: string | null;
  date_album: string | null;
  statut: Statut;
  photos_count?: number;
  photos?: AlbumPhoto[];
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  actif: boolean;
  permissions: string[];
}

export interface AdminStats {
  journaux: number;
  articles: number;
  parlement: number;
  contes: number;
  poemes: number;
  total_contenus: number;
  publies: number;
  brouillons: number;
  archives: number;
  albums: number;
  medias: number;
  categories: number;
  utilisateurs: number;
  messages: number;
  par_rubrique: Record<string, number>;
  recent: Array<Pick<Content, 'id' | 'titre' | 'rubrique' | 'statut' | 'date_publication'>>;
}

export interface Media {
  id: number;
  nom: string;
  chemin: string;
  url: string;
  type: 'image' | 'document';
  mime: string | null;
  taille: number;
  alt: string | null;
  rubrique: string | null;
}

export interface Category {
  id: number;
  rubrique: string;
  nom: string;
  slug: string;
  description: string | null;
  ordre: number;
  contenus_count?: number;
}

export interface ContactMessage {
  id: number;
  nom: string;
  email: string;
  telephone: string | null;
  objet: string | null;
  message: string;
  statut: string;
  created_at: string;
}

export interface Setting {
  id: number;
  cle: string;
  libelle: string;
  valeur: string | null;
  groupe: string;
}

export interface MarketRayon {
  id: number;
  nom: string;
  taux: number;
  produits_count: number;
  prix_max: number | null;
  prix_min: number | null;
  total_ht: number;
  produits: Array<{ id: number; prix: number; designation: string | null }>;
}

export interface UserAccount {
  id: number;
  name: string;
  email: string;
  role: string;
  actif: boolean;
  permissions: string[];
}
