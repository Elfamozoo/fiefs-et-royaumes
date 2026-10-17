# Spécification de Conception : Remake Fiefs & Royaumes

**Date :** 2026-10-17  
**Projet :** Fiefs & Royaumes (Remake Web & Moteur de Simulation Médiévale)  
**Auteur :** Antigravity & Julien  
**Statut :** Validé  

---

## 1. Vision et Objectifs

Recréer à l'identique l'expérience culte du jeu web par navigateur **Fiefs & Royaumes** (*Terres de Kald*), tout en apportant une ergonomie moderne, fluide et réactive, jouable immédiatement en solo avec une simulation vivante de seigneurs rivaux gérés par des intelligences artificielles aux archétypes distincts.

### Principes directeurs :
1. **Fidélité absolue aux mécaniques d'origine :** Le cycle des mois, le système de 10 PA par mois plafonnés à 40 PA max, les saisons avec leur impact sur les récoltes et les déplacements, le marché dynamique mondial régulé par l'offre et la demande, le catalogue complet de plus de 100 unités militaires, la vassalité, les espions, les pigeons voyageurs et les rumeurs publiques.
2. **Architecture Découplée et Testable :** Cœur de règles écrit en TypeScript pur et fonctionnel, 100% couvert par des tests unitaires déterministes (Vitest), indépendant de toute couche d'interface graphique.
3. **Ergonomie et Identité Visuelle :** Ambiance parcheminée médiévale (sceaux de cire, enluminures, blasons vectoriels héraldiques, typographies serif historiques), avec la réactivité d'une Single Page Application moderne (React, Tailwind CSS, sans rechargements de page intempestifs).
4. **Contrôle Temporel Flexible :** Possibilité de jouer au tour par tour fluide (bouton *« Passer le mois »*) ou en défilement automatique avec vitesses réglables (1x, 5x, 10x).

---

## 2. Modèle Métier & Moteur de Simulation (`@fiefs/core`)

### 2.1. Boucle Temporelle et Action Points (PA)
* **Tick Mensuel (`tickMonth(state: GameState): GameState`) :**
  * Incrément du mois et rotation des 4 saisons (Printemps, Été, Automne, Hiver).
  * Octroi de **+10 PA** à chaque seigneur vivant, avec un plafond strict fixé à **40 PA**.
  * Consommation des vivres par la population civile (1 unité de blé pour 10 habitants) et les armées.
  * Récoltes et production de matières premières (bonus de récolte de blé en Automne, pénalité de froid en Hiver).
  * Perception des impôts provinciaux en écus d'or.
  * Calcul d'équilibre du marché mondial des commodités.
  * Décisions et actions des seigneurs IA.
* **Actions et Coûts en PA :**
  * Déplacement d'armée : 2 à 4 PA selon la distance et le terrain.
  * Recrutement d'un régiment : 2 PA.
  * Changement de politique fiscale : 1 PA.
  * Lancement d'un chantier d'infrastructure : 2 PA.
  * Déploiement d'un espion : 3 PA.
  * Envoi d'un pigeon diplomatique : 1 PA.
  * Publication d'une rumeur : 2 PA.

### 2.2. Économie, Fiefs et Marché Dynamique
* **Ressources :**
  * `gold` (Écus d'or) : monnaie d'échange, solde des soldats, trésorerie.
  * `food` (Blé/Vivres) : subsistance des fiefs et des troupes.
  * `wood` (Bois) : engins de siège, palissades, fortifications légères.
  * `stone` (Pierre) : châteaux forts, casernes, murailles.
  * `iron` (Fer) : armures, armes lourdes, forge.
* **Provinces & Démographie :**
  * Population active, niveau de bonheur/moral (0 à 100%).
  * Niveaux d'imposition :
    * *Faible* (5%) : Moral +5/mois, croissance forte de la population.
    * *Modéré* (15%) : Équilibre moral/croissance neutre.
    * *Lourd* (25%) : Moral -5/mois, émigration.
    * *Spoliation* (40%) : Moral -15/mois, risque élevé de révolte paysanne armée.
* **Marché Mondial (Loi de l'offre et de la demande) :**
  * Formule logarithmique de prix :  
    $$P(r) = P_{base}(r) \times \left(1 + \frac{\text{Demande Mensuelle} - \text{Offre Mensuelle}}{\text{Liquidité Totale}}\right)$$
  * Les prix fluctuent en temps réel selon les transactions des joueurs et des marchands IA. Les prix ont un plancher et un plafond pour éviter les anomalies de calcul.

### 2.3. Armées, 100+ Unités et Résolution de Combats
* **Familles d'Unités :**
  * **Infanterie légère & milices :** Paysans armés, Piquiers, Épéistes, Massiers, Gardes de la cité.
  * **Infanterie lourde :** Hallebardiers royaux, Hommes d'armes en plaques, Chevaliers à pied, Gardes noirs.
  * **Tirailleurs & Archers :** Archers courts, Archers longs, Arbalétriers génois, Arbalétriers lourds, Frondeurs.
  * **Cavalerie légère :** Éclaireurs montés, Chevau-légers, Hussards, Archers à cheval.
  * **Cavalerie lourde :** Chevaliers en armure, Gendarmes d'ordonnance, Cataphractes.
  * **Régionales & Exotiques des Terres de Kald :** Samouraïs, Ronins, Guerriers des sables, Berserkers nordiques, Gardes prétoriens.
  * **Engins de siège :** Béliers de sape, Balistes de rempart, Onagres, Catapultes, Trébuchets de siège.
* **Attributs d'une Unité :**
  * `attack`, `defense`, `rangedAttack`, `armor`, `speed`, `morale`, `upkeepGold`, `upkeepFood`, `counterBonuses` (ex: piques contre cavalerie).
* **Résolution Séquentielle de Bataille (`resolveBattle`) :**
  1. *Bombardement préliminaire :* Dégâts de siège sur les fortifications éventuelles.
  2. *Phase de tir :* Échange de volées de flèches / carreaux.
  3. *Phase de charge :* Première ligne de cavalerie avec multiplicateur de choc.
  4. *Phase de mêlée :* Rounds de combat corps à corps jusqu'à défaite ou déroute.
  5. *Test de moral :* Fuite des survivants, capture d'otages et pillage de ressources.

### 2.4. Diplomatie, Vassalité, Espions & Rumeurs
* **Graphe Féodal :**
  * Chaque seigneur a soit le statut d'indépendant, soit un suzerain désigné.
  * Système de tribut vassalique (versement automatique de x% des impôts au suzerain chaque mois).
  * Traités : Pacte de non-agression, Alliance défensive, Déclaration de guerre, Sommation de vassalité.
* **Espionnage :**
  * Missions : Infiltration de province, Rapport sur les troupes adverses, Sabotage de silos/mines, Assassinat ciblé.
  * Contre-espionnage dans les provinces du joueur avec risque de pendaison des espions ennemis.
* **Pigeons & Rumeurs :**
  * Pigeons : messagerie textuelle bilatérale avec notifications d'événements.
  * Place des rumeurs : fil d'actualités publiques où circulent les déclarations, vantardises et ragots politiques.

### 2.5. Archétypes d'IA pour les Seigneurs Rivaux
* **Militariste (Le Conquérant) :** Maximise le fer et les casernes, cible les fiefs voisins mal défendus.
* **Mercantile (Le Négociant) :** Spécule sur les denrées au marché mondial, sous-traite sa défense à des mercenaires.
* **Diplomate (Le Prince Machiavélique) :** Tisse des alliances, vassalise ses voisins pacifiques, envoie des espions.
* **Traditionnaliste (Le Feudataire Prudent) :** Maintient des impôts bas, maximise le bonheur et stocke d'immenses réserves de vivres.

---

## 3. Architecture Technique et Implémentation

### 3.1. Structure du Code
```
/
├── docs/superpowers/specs/
│   └── 2026-10-17-fiefs-et-royaumes-design.md
├── src/
│   ├── engine/                     # Moteur TypeScript 100% pur (zéro dépendance UI)
│   │   ├── types.ts                # Types stricts (GameState, Lord, Province, Unit, etc.)
│   │   ├── data/                   # Données constantes (Catalogue des 100+ unités, Terres de Kald)
│   │   │   ├── units.ts
│   │   │   └── provinces.ts
│   │   ├── systems/                # Systèmes modulaires
│   │   │   ├── time.ts             # Gestion des mois, saisons et PA
│   │   │   ├── economy.ts          # Fiscalité, production, consommation
│   │   │   ├── market.ts           # Algorithme offre/demande du marché mondial
│   │   │   ├── military.ts         # Recrutement, soldes, entretien
│   │   │   ├── battle.ts           # Résolveur tactique de combats et sièges
│   │   │   ├── diplomacy.ts        # Vassalité, traités, pigeons
│   │   │   ├── espionage.ts        # Missions d'espions et contre-espionnage
│   │   │   └── ai.ts               # Prise de décision des seigneurs rivaux
│   │   ├── engine.ts               # Point d'entrée de simulation (tick, actions)
│   │   └── __tests__/              # Tests unitaires Vitest exhaustifs
│   │       ├── time.test.ts
│   │       ├── economy.test.ts
│   │       ├── market.test.ts
│   │       ├── military.test.ts
│   │       ├── battle.test.ts
│   │       └── ai.test.ts
│   ├── ui/                         # Interface React + Tailwind CSS
│   │   ├── components/             # Composants médiévaux réutilisables (Parchemin, Blason, Sceau, etc.)
│   │   ├── views/                  # Vues principales du jeu
│   │   │   ├── ThroneRoom.tsx      # Salle du Trône (Vue d'ensemble, saisons, PA, notifications)
│   │   │   ├── RealmMap.tsx        # Carte interactive des Terres de Kald
│   │   │   ├── FiefsView.tsx       # Gestion des provinces et impôts
│   │   │   ├── MilitaryView.tsx    # Caserne, 100+ unités, armées et batailles
│   │   │   ├── MarketView.tsx      # Marché mondial dynamique et spéculation
│   │   │   ├── DiplomacyView.tsx   # Pigeons, suzerains/vassaux et rumeurs
│   │   │   └── EspionageView.tsx   # Guilde des espions
│   │   ├── state/                  # Store de persistance et hook useGameEngine
│   │   └── App.tsx
│   ├── main.tsx
│   └── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### 3.2. Stratégie de Tests et Qualité
* Tests unitaires automatisés pour chaque calcul critique :
  1. *Régénération des PA :* vérification du gain de 10 PA par mois et blocage strict à 40 PA.
  2. *Marché :* vérification de la convergence des prix et absence de prix négatifs ou aberrants.
  3. *Combats :* reproductibilité avec seed aléatoire et respect des avantages de types (piques vs cavalerie).
  4. *Économie & famine :* déclenchement immédiat de pertes en cas de pénurie de blé.
  5. *Comportement IA :* vérification que les IA dépensent leurs PA sans enfreindre les règles.

---

## 4. Jalons de Réalisation
1. **Socle & Moteur Pur :** Définition des types, données des Terres de Kald, 100+ unités, boucle temporelle (PA/saisons), marché mondial et résolution de combats (avec suite complète de tests Vitest).
2. **Interface Parchemin & Salle du Trône :** Composants visuels héraldiques, tableau de bord, contrôleur temporel (Passer le mois, vitesses 1x/5x/10x), indicateurs de PA et ressources.
3. **Carte des Terres de Kald & Déplacements :** Carte des provinces, mouvements d'armées, brouillard de guerre et gestion des fiefs.
4. **Caserne & Résolution Visuelle des Combats :** Recrutement parmi les 100+ unités, visualisation des régiments et rapports de batailles parchemineux.
5. **Marché Mondial, Diplomatie, Espionnage & Rumeurs :** Place commerciale interactive, pigeons voyageurs, arbre de vassalité et système d'espionnage.
6. **Polissage, Persistance & Validation Finale :** Sauvegardes locales automatiques, export/import JSON, équilibrage des IA et validation globale.
