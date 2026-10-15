# MMC — Mécanique des milieux continus

Site statique du cours de mécanique des milieux continus pour le génie civil, destiné à **mmc.ksr-infra.org** (même famille que fond.ksr-infra.org, mecaflu.ksr-infra.org…).

## Contenu

| Page | Rôle |
|---|---|
| `index.html` | accueil, plan |
| `cours.html` | le cours en 7 chapitres, calculateurs dans le fil du texte |
| `labo.html` | laboratoire digital : 6 bancs d'essai interactifs (canvas) |
| `exerciseur.html` | exercices à données aléatoires, vérification, solution |

Chapitres : 1 milieu continu · 2 déformations · 3 contraintes · 4 élasticité linéaire · 5 solutions classiques (traction, flexion, torsion, Lamé, Boussinesq, Kirsch) · 6 critères (Tresca, von Mises, Rankine, Mohr-Coulomb) · 7 de la MMC à la RDM.

Bancs : carré qui se déforme · cercle de Mohr · éprouvette en traction · bulbe de Boussinesq · trou de Kirsch · critères.

## Technique

- HTML/CSS/JS sans dépendance de build ; KaTeX (CDN cdnjs) pour les formules.
- `js/common.js` : algèbre des tenseurs symétriques (valeurs/vecteurs propres par Jacobi, invariants, déviateur, Mohr 2D), conversions élastiques, matériaux de référence, navigation.
- `js/cours.js`, `js/labo.js`, `js/exos.js` : une page chacun.
- Thème clair/sombre automatique (`prefers-color-scheme`), mobile d'abord.

## Déploiement

Hébergement statique (Cloudflare Pages, GitHub Pages) : racine du dépôt, sans étape de build.
