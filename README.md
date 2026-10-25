# 🏰 Fiefs & Royaumes — Chroniques des Terres de Kald

[![Test Suite](https://img.shields.io/badge/Vitest-94%20Passing%20(100%25)-brightgreen.svg)](#-tests--qualit%C3%A9)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%205.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-Parchment%20Theme-38b2ac.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)

> *« Que sonne l'olifant dans la vallée ! Les seigneurs de Kald affûtent leurs épées, les greniers s'emplissent de blé et les caravanes de marchands sillonnent les chemins de terre. »*

Remake moderne, fidèle et 100% déterministe du mythique jeu web de gestion et stratégie médiévale **Fiefs & Royaumes**.

---

## 🎮 Jouer Immédiatement (Sans Installation)

### Option 1 : Le fichier unique autonome
Le jeu est compilé en un unique fichier exécutable directement dans n'importe quel navigateur :
1. Téléchargez ou ouvrez **[`Fiefs-et-Royaumes.html`](./Fiefs-et-Royaumes.html)**.
2. Faites un simple **double-clic** dessus.
3. Le jeu s'ouvre dans votre navigateur web, **100% hors-ligne**, sans serveur ni dépendances !

### Option 2 : En ligne via GitHub Pages


---

## 👑 Fonctionnalités Principales

### 🏰 Gestion des Fiefs & Démographie
- **20 provinces interconnectées** fidèles à la géographie des Terres de Kald (*plaines, forêts, collines, montagnes, marais, côtes, déserts*).
- **4 politiques fiscales** : Basse (5%), Modérée (15%), Élevée (25%), Extorsion (40%).
- Gestion des récoltes agricoles, du moral citoyen, de la croissance démographique et des famines hivernales.

### ⚔️ Ost Militaire & Catalogue de 105 Unités
- **105 régiments d'armes historiques et fantastiques** répartis en 5 familles :
  - 🛡️ **Infanterie** : Miliciens, piquiers flamands, hallebardiers suisses, chevaliers à pied...
  - 🏹 **Tirailleurs** : Archers courts, archers longs gallois, arbalétriers génois, arquebusiers...
  - 🐎 **Cavalerie** : Éclaireurs montés, sergents à cheval, hussards ailés, chevaliers féodaux...
  - ✨ **Unités Exotiques de Kald** : Rôdeurs des brumes, mages de bataille, gardes runiques...
  - ☄️ **Engins de Siège** : Béliers de sape, catapultes, balistes lourdes, trébuchets...
- Soldes mensuelles et risque de désertion en cas de coffres vides.

### 🛡️ Résolveur Tactique de Batailles en 5 Phases
1. **Bombardement préliminaire de siège** : Les trébuchets pilonnent et ouvrent des brèches dans les fortifications.
2. **Phase de tir à distance** : Volées de flèches et de carreaux avant le contact.
3. **Charge de cavalerie** : Choc des montures avec bonus de dévastation (mitigé par les piquiers).
4. **Mêlée générale** : Attrition au corps-à-corps, calcul d'armure et contre-attaques.
5. **Déroute au moral & pillage** : Test de panique des troupes et pillage jusqu'à 25% des ressources ennemies.

### ⚖️ Marché Mondial Dynamique
- Cours des denrées (*Blé, Bois, Pierre, Fer*) variant selon l'offre et la demande réelle de tous les seigneurs.
- Impact des saisons : surproduction à l'automne (cours bas), disette en hiver (cours hauts).
- Graphique historique des cours sur 24 mois.

### 📜 Diplomatie, Vassalité & Pigeons Voyageurs
- Hommage féodal et serments de vassalité avec prélèvement automatique de tributs au suzerain.
- Dépêches scellées par pigeons voyageurs.
- Place publique des rumeurs de Kald pour manipuler l'opinion ou défier ses rivaux.

### 👁️ Guilde des Espions
- Missions clandestines (coût : 2 PA) :
  - **Infiltration** : Inspection secrète des registres, défenses et moral du fief.
  - **Reconnaissance** : Découverte des troupes et garnisons ennemies.
  - **Sabotage** : Incendie criminel des greniers à blé rivaux.
  - **Assassinat** : Élimination d'officiers de garnison.
- Risque de capture et de pendaison en cas d'échec.

### 🤖 Seigneurs Rivaux Autonomes
4 archétypes d'IA réagissant chaque mois selon leur tempérament :
- **Le Conquérant** (Seigneur Vane) : Expansionnisme militaire et levée d'armées massives.
- **Le Négociant** (Comte Aldous) : Spéculation au marché mondial et enrichissement commercial.
- **La Diplomate** (Princesse Ysabeau) : Alliances, espionnage et manipulation politique.
- **Le Traditionnaliste** (Baron Godefroy) : Impôts modérés, greniers pleins et paix territoriale.

---

## 🛠️ Stack Technique

- **Langage** : TypeScript 5.7 (mode strict)
- **Frontend** : React 18, Tailwind CSS (palette authentique parchemin & sceaux de cire)
- **Icônes & Héraldique** : Lucide React, Blasons vectoriels SVG temps réel
- **Bundler & Outillage** : Vite 6, `vite-plugin-singlefile`
- **Tests** : Vitest (12 suites de tests, 94 tests unitaires et d'intégration)

---

## 💻 Développement Local

```bash
# Cloner le dépôt
git clone https://github.com/Elfamozoo/fiefs-et-royaumes.git
cd fiefs-et-royaumes

# Installer les dépendances
npm install

# Lancer le serveur de développement local
npm run dev

# Lancer la suite de tests
npm test

# Compiler pour la production
npm run build

# Générer le fichier autonome unique HTML
npm run build:standalone
```

---

## 📜 Licence

Projet distribué sous licence MIT. Libre d'utilisation, de modification et de distribution.
