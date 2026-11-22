# Audit et matrice de correspondance — La Voix d'Abouloussi (reconstruction)

Audit réalisé en lecture seule sur :
- `/home/firstone/JC/voixdabouloussi_ancien` (source éditoriale, **jamais modifiée**) ;
- `/home/firstone/JC/colocation_new` (source technique/frontend) ;
- répertoire courant (destination : `backend/` Laravel 13 vierge, `frontent/` Vite/React vierge).

## 1. Rubriques réellement présentes dans l'ancien site (aucune ne doit disparaître)

| # | Rubrique ancienne | Pages / fonctionnalités | Nouvelle route frontend | Nouveau modèle / API |
|---|---|---|---|---|
| 1 | Accueil (`index.php`) | Carousel (baobab, agougou…), objectif, galerie photos, identification, les plans, administrateurs | `#/` | `GET /api/home`, `contenus` rubriques `objectif`, `image`, `identification`, `plan`, `administrateur` |
| 2 | Mon Journal (`journal.php`) | Présentation Abouloussi/divinité, liste des éditions, PDF | `#/journaux`, `#/journaux/:slug` | rubrique `journal`, champ `document` (PDF), `meta.numero`, `meta.annee` |
| 3 | Parlement des Jeunes de Koko (`parlement.php`) | Présentation, mission, organisation, 5 commissions, articles/photos | `#/parlement`, `#/parlement/:slug` | rubriques `parlement`, `commission` ; API `/api/parlement` |
| 4 | JDA — Jeunes Dynamiques et Actions (`JDA.php`) | Présentation, objectifs, 5 rapports, PDF, contacts JDA | `#/jda`, `#/jda/:slug` | rubrique `jda`, API `/api/jda`, documents PDF |
| 5 | Galerie JDA (`album_JDA.php`) | Album photos | `#/albums`, `#/albums/:id` | tables `albums`, `album_photos`, API `/api/albums` |
| 6 | Rapports photos JDA (`jda_rapport_1/2/3.php`) | Galeries par événement (13+7+7 photos) | `#/albums/:slug` | albums + photos importées |
| 7 | Dis-moi Grand-Père (`pere.php`) | Contes, légendes, proverbes, poèmes (« Aux mânes des ancêtres de Koko », « POESIE : Koko ») | `#/contes`, `#/poemes`, `#/contes/:slug`, `#/poemes/:slug` | rubriques `conte`, `poeme`, auteur ; API dédiées |
| 8 | Contact (`contact.php`) | Adresse 08 BP 0266 Cotonou, 2 e-mails, 2 téléphones, 2 administrateurs, formulaire AJAX | `#/contact` | table `site_settings` + `contact_messages`, API `/api/contact` |
| 9 | Administration (`admin/`) | Auth, CRUD `groupe_page`, uploads images/PDF, CKEditor, recherche, pagination, réinitialisation mot de passe | `#/admin` (dashboard + 9 onglets) | API `/api/admin/*`, rôles/permissions, CRUD complet |
| 10 | DMS / Delco Multi Service (sous-domaine) | Blog PWA : articles (titre/description/média image ou vidéo), likes, admin CRUD | `#/dms`, `#/dms/:slug` | rubrique `dms`, table `dms_likes`, API `/api/dms` |
| 11 | SuperMarché+ LIVBET (sous-domaine) | Rayons local/bio/venu, produits, jeu, historique | `#/marche` | tables `rayons`, `produits`, `livebets`, API `/api/market/*` |
| 12 | Ressources / archives | 9 PDF journaux 2008→2022, 4 rapports PDF, ~280 images, logos, illustrations | bibliothèque médias admin + pages | table `medias`, fichiers copiés dans `backend/storage/app/public/media` |

Sous-rubriques conservées : objectif, images, identification, les plans, administrateurs (accueil) ; Abouloussi, divinité, éditions (journaux) ; mission, organisation, 5 commissions (parlement) ; objectifs, 5 comptes rendus, album (JDA) ; contes, poèmes (grand-père) ; DMS visiteur/admin ; market rayons/jeu.

## 2. Matrice technique ColoCampus → nouveau projet

| Composant / mécanisme ColoCampus | Réutilisation prévue | Adaptation |
|---|---|---|
| `useHashRoute.ts` | routage client par hash (aucun react-router à installer) | routes éditoriales ci-dessus |
| `services/api.ts`, `services/session.ts` | client fetch + token Bearer + timeout + `ApiError` | base URL `VITE_API_URL` / `http://<host>:8000/api` |
| `layout/SiteHeader.tsx` + `index.css` (nav, dropdown, mobile drawer, états actifs) | header à 2 niveaux, menu mobile, recherche, lien admin | libellés des rubriques, vert `#008000` |
| `layout/SiteFooter.tsx` | footer complet + crédits historiques | mentions La Voix d'Abouloussi |
| `components/PageHero.tsx` | bannière + fil d'Ariane commune à toutes les rubriques | image baobab de l'ancien site |
| `carousel.ts` (autoplay, flèches, dots, pause) | carousel d'accueil et carrousels de couvertures | réimplémenté en React (sans jQuery), données API |
| `AnnonceCard.tsx` / `service-item` | cartes de publications (couverture, titre, résumé, date, badge) | cartes journal/article/conte/poème |
| `States.tsx`, `ToastViewport.tsx`, `LoadingModal.tsx` | chargement, vide, erreur, notifications | conservés (API identique) |
| `TablePagination.tsx`, `inc_paginate.php` (ancien) | pagination publique et admin | pagination API Laravel |
| `FilterDrawer.tsx`, `HomeHero.tsx` | recherche et filtres (rubrique, catégorie, année) | panneau de filtres éditorial |
| `dash-shared/*`, `Dashboard.tsx`, `dash-admin/*` | shell dashboard, cartes stats, tables, formulaires | 9 onglets d'administration |
| `app-button`, `app-field`, `app-card`, `app-panel`, `app-table`, `app-badge`, animations | système de design centralisé | palette verte `#008000` (au lieu de `#a4c639`) |
| Bootstrap 4 / Slick / Owl du template | comportements (responsive, sliders, lightbox) | CSS autonome (pas de jQuery) |

## 3. Décisions d'architecture

- Backend : Laravel 13 + API REST JSON, authentification par tokens personnels (table `personal_access_tokens`, hachage SHA-256), rôles et permissions en base, validation FormRequest, uploads images/PDF vérifiés, statuts `brouillon|publie|archive`, `publie` seul visible publiquement.
- Modèle éditorial unifié `contenus` avec `rubrique`, `categorie_id`, `meta` JSON, `document`, `image` : couvre toutes les rubriques sans duplication de code, tout en gardant une table dédiée pour les albums et le market.
- Frontend : React 19 + TypeScript + Vite 8, hash routing, services API séparés, composants réutilisables, design system `.app-*` et tokens `--color-primary: #008000`.
- migration : copie unidirectionnelle des médias de l'ancien projet vers `backend/storage/app/public/media`, seeders avec les textes réels extraits des pages PHP (rapports JDA, mission du parlement, poèmes, coordonnées), aucun lien vers l'ancien répertoire.
- Git : branche `main` dans le dépôt racine (interface/frontend) et dans le dépôt imbriqué `backend/` (API), un commit par étape.
