# MMC — Mécanique des milieux continus

Site statique du cours de mécanique des milieux continus pour le génie civil, destiné à **mmc.ksr-infra.org** (même famille que fond.ksr-infra.org, mecaflu.ksr-infra.org…).

## Contenu

| Page | Rôle |
|---|---|
| `index.html` | accueil, plan |
| `cours.html` | le cours (boîte à outils + 7 chapitres), 23 figures SVG, 16 calculateurs, les 8 bancs du laboratoire insérés à l'endroit où ils servent ; par chapitre : « En clair », « Lire la formule », « Pourquoi c'est vrai », exemple guidé, erreurs fréquentes, savoir-faire attendus |
| `labo.html` | laboratoire digital : 8 bancs d'essai interactifs (canvas) |
| `exerciseur.html` | vrai/faux (20 questions) et exercices à données aléatoires, vérification, solution |
| `formulaire.html` | aide-mémoire imprimable, ordres de grandeur, glossaire FR–EN |
| `questions.html` | les questions qu'on n'ose pas poser, en français courant |

Chapitres : 0 boîte à outils mathématiques · 1 milieu continu · 2 déformations · 3 contraintes · 4 élasticité linéaire · 5 solutions classiques (traction, flexion, torsion, Lamé, Boussinesq, Kirsch) · 6 critères (Tresca, von Mises, Rankine, Mohr-Coulomb) · 7 de la MMC à la RDM.

Bancs : carré qui se déforme · cercle de Mohr · éprouvette en traction · bulbe de Boussinesq · trou de Kirsch · critères · tube de Lamé · torsion.

## Technique

- HTML/CSS/JS sans dépendance de build ; KaTeX (CDN cdnjs) pour les formules.
- `js/common.js` : algèbre des tenseurs symétriques (valeurs/vecteurs propres par Jacobi, invariants, déviateur, Mohr 2D), conversions élastiques, matériaux de référence, navigation.
- `js/labo.js` : registre des bancs (`MMC.labs.BANCS`) et `MMC.labs.mount(id, conteneur)` ; un `<div class="lab" data-banc="mohr"></div>` dans n'importe quelle page monte le banc à la demande.
- `js/cours.js`, `js/exos.js` : calculateurs du cours, exerciseur.
- Thème clair/sombre automatique (`prefers-color-scheme`), mobile d'abord.

## Déploiement

Hébergement statique (Cloudflare Pages, GitHub Pages) : racine du dépôt, sans étape de build.
