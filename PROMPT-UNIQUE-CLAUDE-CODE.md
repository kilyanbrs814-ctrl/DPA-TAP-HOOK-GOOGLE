# Prompt unique à donner à Claude Code

Tu travailles dans mon projet Remotion existant consacré à la VSL DPA TAP, une plaque NFC qui facilite le dépôt d'avis Google.

Je t'ai fourni un dossier `public/assets/hook-google/` contenant :

- `google-results-reference.png` : capture réelle d'une page Google avec une carte et des résultats locaux. Utilise-la comme référence visuelle précise pour l'interface, les proportions, les couleurs, les espacements et la carte.
- `google-business-profile-logo.png` : image à utiliser pour la fiche « Votre établissement ».

## Ta mission

Crée le hook d'ouverture en motion design montrant une page de résultats locaux Google. Pour ce premier résultat, réalise une composition Remotion autonome afin que je puisse la prévisualiser et la valider sans modifier ni casser la suite de la VSL existante.

Inspecte d'abord entièrement la structure du projet, les compositions, les dépendances, les conventions TypeScript et les styles déjà présents. Réutilise ce qui est pertinent. Ne supprime et ne réécris aucune scène existante. Ne fais aucun push GitHub et ne rends pas encore de MP4 final.

## Paramètres obligatoires

- Composition : `GoogleRankingHook`
- Format : 1080 × 1920, vertical 9:16
- Framerate : 30 FPS
- Durée : 120 frames, soit 4 secondes
- Recherche affichée dans la barre Google : `barbier à proximité`
- Langue de l'interface : français
- Aucun texte publicitaire
- Aucun slogan
- Aucun CTA
- Aucune voix off
- Aucun sous-titre ajouté
- Aucun confetti, particule ou effet cartoon
- Seuls les textes appartenant naturellement à l'interface Google peuvent apparaître

## Scène à construire

Recrée une vraie page Google crédible et très fidèle à la capture de référence. L'écran doit montrer, dans cet ordre :

1. le logo Google et la barre de recherche contenant « barbier à proximité » ;
2. le titre « Entreprises » ;
3. une carte Google locale ;
4. quatre fiches de barbiers placées sous la carte.

Le cadrage doit être spécialement composé pour un écran vertical. Les quatre fiches doivent rester visibles ou suffisamment présentes pour que le spectateur comprenne immédiatement le classement. Les éléments doivent être assez grands pour être lus sur TikTok ou Instagram Reels.

Ne montre pas les barres du navigateur Chrome. Ne montre aucun résultat sponsorisé. Ne copie pas les vrais noms d'établissements présents sur la capture.

Utilise la capture fournie comme référence et comme source possible pour la zone de carte, mais ne l'anime pas comme une image complète. La barre de recherche, le titre, les fiches, les notes et les boutons doivent être recréés proprement en React, HTML et CSS afin de rester parfaitement nets.

Utilise Roboto, ou la police locale disponible qui se rapproche le plus de l'interface Google. Respecte le blanc Google, les gris, les séparateurs fins, le bleu des actions et le jaune des étoiles (`#FABB05`).

## Classement initial exact

Les quatre résultats commencent dans cet ordre :

1. `Maison Barber` — note `4,8` — `(436)` avis
2. `L'Atelier du Barbier` — note `4,7` — `(312)` avis
3. `Barber District` — note `4,6` — `(189)` avis
4. `Votre établissement` — `Aucun avis`

Ajoute à chaque fiche des informations secondaires sobres et réalistes, par exemple « Barbier », « Ouvert » et une zone générique, sans inventer une longue adresse. Les fiches concurrentes doivent paraître réelles mais rester fictives.

La quatrième fiche doit s'appeler exactement `Votre établissement`. Utilise `google-business-profile-logo.png` comme son image de profil. Affiche cette image dans une miniature circulaire propre et bien cadrée. Au début, la fiche ne doit avoir ni note ni étoiles remplies : elle affiche seulement `Aucun avis`.

## Transformation attendue

Pendant le hook, « Votre établissement » obtient rapidement des avis cinq étoiles puis remonte dans le classement. La progression interne du compteur doit suivre approximativement :

`0 → 12 → 58 → 146 → 327 → 684 → 1 000`

Dans l'affichage Google final, formate cette valeur comme Google : `(1 k)`.

Pendant cette progression :

- la note de « Votre établissement » apparaît et atteint `5,0` ;
- les cinq étoiles Google se remplissent progressivement en jaune ;
- la fiche quitte la quatrième position ;
- elle dépasse visiblement les trois concurrents, un par un ;
- les autres fiches descendent naturellement pour lui laisser la première place.

## Classement final exact

1. `Votre établissement` — `5,0` — cinq étoiles jaunes — `(1 k)`
2. `Maison Barber` — `4,8` — `(436)`
3. `L'Atelier du Barbier` — `4,7` — `(312)`
4. `Barber District` — `4,6` — `(189)`

Le dernier état doit être parfaitement lisible et rester immobile assez longtemps pour comprendre que « Votre établissement » est maintenant premier, noté 5,0 avec 1 k avis.

## Timing et mouvement

Utilise ce rythme comme base, puis affine-le visuellement :

- Frames 0 à 15 : page Google stable, classement initial lisible, « Votre établissement » en quatrième position sans avis.
- Frames 15 à 70 : le compteur accélère progressivement, la note apparaît et les cinq étoiles se remplissent.
- Frames 38 à 98 : la fiche remonte et dépasse les concurrents successivement. Le compteur et le mouvement peuvent se chevaucher.
- Frames 98 à 120 : classement final stabilisé, avec `5,0`, cinq étoiles et `(1 k)`.

La remontée constitue le mouvement principal du hook. Elle doit être très claire et fluide. La fiche « Votre établissement » doit réellement passer visuellement devant chaque fiche, pas disparaître puis réapparaître en haut.

Pendant le déplacement :

- place la fiche animée au-dessus des autres avec un `z-index` supérieur ;
- ajoute une élévation très légère et une ombre réaliste ;
- déplace les concurrents vers leur nouvelle position au bon moment ;
- évite tout saut de layout, chevauchement de texte ou tremblement ;
- retire l'ombre supplémentaire lorsque la fiche se stabilise en première position.

Utilise les outils d'animation natifs de Remotion, notamment `spring()`, `interpolate()` et `Easing`. Tous les mouvements et valeurs doivent dépendre de `useCurrentFrame()` et rester déterministes. N'utilise pas d'animations CSS temporelles indépendantes de Remotion.

## Architecture souhaitée

Crée des composants propres et réutilisables, par exemple :

- `GoogleRankingHook`
- `GoogleSearchBar`
- `GoogleLocalMap`
- `BusinessCard`
- `StarsRating`

Stocke les informations des quatre établissements dans des données structurées. Évite de dupliquer quatre fois le même JSX. Utilise des positions calculées ou absolues pour animer correctement les changements de classement sans provoquer de reflow brutal.

Enregistre la composition autonome dans le fichier Root/compositions approprié du projet, sans remplacer les compositions existantes. Ne l'intègre pas encore dans la timeline complète de la VSL : ce premier rendu doit servir à valider le design et l'animation.

## Qualité visuelle attendue

Le résultat doit ressembler à une véritable page Google filmée ou capturée, pas à une interface générique inspirée de Google. Soigne particulièrement :

- la taille et le poids de la typographie ;
- l'alignement des notes et des étoiles ;
- le format français avec virgule : `5,0` ;
- le format final exact : `(1 k)` ;
- les séparateurs entre les fiches ;
- les boutons ronds « Site Web » et « Itinéraire » ;
- le cadrage de la carte ;
- la hiérarchie visuelle entre nom, note, catégorie et statut ;
- la lisibilité sur un écran de téléphone.

N'ajoute pas de bordure lumineuse, de halo bleu, de badge « numéro 1 » ou d'autres artifices absents de Google. La progression et le changement de position doivent suffire à raconter l'histoire.

## Vérification obligatoire

Après l'implémentation :

1. lance les vérifications TypeScript, ESLint et les tests disponibles ;
2. démarre Remotion Studio avec la commande réellement disponible dans le `package.json` ;
3. inspecte visuellement les frames 0, 15, 45, 70, 98 et 119 ;
4. corrige les textes coupés, chevauchements, mauvais alignements et mouvements saccadés ;
5. vérifie que les deux assets sont chargés avec `staticFile()` et non avec un chemin système absolu ;
6. donne-moi la liste exacte des fichiers créés ou modifiés ;
7. explique-moi comment ouvrir la composition `GoogleRankingHook` dans Remotion Studio ;
8. ne fais aucun push GitHub et ne lance aucun rendu vidéo final.

