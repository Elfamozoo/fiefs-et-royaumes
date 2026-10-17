# Fiefs & Royaumes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate the complete medieval browser game *Fiefs & Royaumes* (Terres de Kald) as a rich, modern, responsive single-player web application with AI lords, authentic parchment aesthetics, pure deterministic domain simulation, and 100% testable game mechanics.

**Architecture:** Pure TypeScript isomorphic domain game engine (`src/engine/`) completely decoupled from the UI, with immutable state transformations, test-driven development via Vitest, accompanied by a React + Tailwind CSS frontend (`src/ui/`) featuring medieval heraldic graphics, parchment textures, wax seals, and an interactive realm map.

**Tech Stack:** React 18+, TypeScript 5+, Vite, Tailwind CSS, Lucide Icons, Vitest for unit & integration testing.

**Spec:** [`docs/superpowers/specs/2026-10-17-fiefs-et-royaumes-design.md`](file:///c:/Users/illye/Documents/antigravity/quirky-chandrasekhar/docs/superpowers/specs/2026-10-17-fiefs-et-royaumes-design.md)

## Global Constraints

- **Language & Runtime:** Pure TypeScript, zero external backend dependencies for the core game loop.
- **Game Rules Integrity:** 
  - 10 Action Points (PA) added per month tick, strictly capped at 40 PA.
  - 4 Seasons (Printemps, Été, Automne, Hiver) altering harvests and travel costs.
  - Complete catalogue of 100+ military units organized into 5 families (Infanterie, Tirailleurs, Cavalerie, Unités régionales de Kald, Engins de siège).
  - Dynamic global market adjusting commodity prices (Or, Blé, Bois, Pierre, Fer) based on total supply/demand balance.
  - Multi-phase deterministic combat resolver (Siège, Tirs, Choc de cavalerie, Mêlée, Test de moral).
- **Testing:** Every engine system must have dedicated unit tests passing with Vitest before UI integration.

---

### Task 1: Project Scaffolding & Setup

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/index.css`
- Create: `src/main.tsx`

**Interfaces:**
- Produces: Working React + Vite + Tailwind + Vitest build environment.

- [ ] **Step 1: Create package.json with dependencies**
  Dependencies: `react`, `react-dom`, `lucide-react`, `canvas-confetti`.  
  DevDependencies: `typescript`, `@types/react`, `@types/react-dom`, `vite`, `@vitejs/plugin-react`, `tailwindcss`, `autoprefixer`, `postcss`, `vitest`.
- [ ] **Step 2: Configure Vite, TypeScript, and Tailwind**
  Ensure path aliases (e.g. `@engine` and `@ui`) are set up in `vite.config.ts` and `tsconfig.json`.
- [ ] **Step 3: Run `npm install` and verify build setup**
  Run `npm install` and check that `npx vitest run` runs without configuration errors.
- [ ] **Step 4: Commit scaffolding**
  Commit as `build: setup project with React, TypeScript, Tailwind, and Vitest`.

---

### Task 2: Core Domain Types & Data Constants

**Files:**
- Create: `src/engine/types.ts`
- Create: `src/engine/data/units.ts`
- Create: `src/engine/data/provinces.ts`
- Test: `src/engine/__tests__/data.test.ts`

**Interfaces:**
- Produces: 
  - Types: `GameState`, `Lord`, `Province`, `UnitDefinition`, `Regiment`, `MarketCommodity`, `BattleReport`, `DiplomacyRelation`, `SpyMission`.
  - Constants: `UNIT_CATALOGUE` (100+ units across 5 families), `INITIAL_PROVINCES` (map of Terres de Kald).

- [ ] **Step 1: Write the failing test for Unit & Province Catalogue**
  Check that `UNIT_CATALOGUE` has at least 100 distinct unit definitions with valid stats, and `INITIAL_PROVINCES` contains defined provinces with connections.
- [ ] **Step 2: Run test to verify it fails**
  Run `npx vitest run src/engine/__tests__/data.test.ts`. Expected: FAIL (files missing).
- [ ] **Step 3: Implement `types.ts`, `units.ts` and `provinces.ts`**
  Populate comprehensive types and the authentic 100+ units list (Piquiers, Archers, Hallebardiers, Samouraïs, Trébuchets, etc.).
- [ ] **Step 4: Run test to verify it passes**
  Run `npx vitest run src/engine/__tests__/data.test.ts`. Expected: PASS.
- [ ] **Step 5: Commit**
  Commit as `feat(engine): define core types, 100+ units catalogue, and provinces map`.

---

### Task 3: Time & Seasons System

**Files:**
- Create: `src/engine/systems/time.ts`
- Test: `src/engine/systems/__tests__/time.test.ts`

**Interfaces:**
- Consumes: `GameState` from `src/engine/types.ts`.
- Produces: `advanceMonth(state: GameState): GameState`.
  - Increments `month`.
  - Rotates `season` (Spring, Summer, Autumn, Winter).
  - Adds +10 PA to each lord, capped at 40 PA.

- [ ] **Step 1: Write failing tests for time and PA regeneration**
  Test +10 PA increment, test cap at 40 PA, test season transitions every 3 months.
- [ ] **Step 2: Run test to verify it fails**
  Run `npx vitest run src/engine/systems/__tests__/time.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement `src/engine/systems/time.ts`**
  Implement pure function `advanceMonth`.
- [ ] **Step 4: Run test to verify it passes**
  Run `npx vitest run src/engine/systems/__tests__/time.test.ts`. Expected: PASS.
- [ ] **Step 5: Commit**
  Commit as `feat(engine): implement month advancement, seasons, and PA regeneration`.

---

### Task 4: Economy, Fiefs & Dynamic Market System

**Files:**
- Create: `src/engine/systems/economy.ts`
- Create: `src/engine/systems/market.ts`
- Test: `src/engine/systems/__tests__/economy.test.ts`
- Test: `src/engine/systems/__tests__/market.test.ts`

**Interfaces:**
- Consumes: `GameState`, `Province`, `Lord`.
- Produces: 
  - `processEconomy(state: GameState): GameState` (tax collection, food consumption, population growth, morale).
  - `executeMarketTrade(state: GameState, lordId: string, commodity: CommodityType, amount: number, isBuy: boolean): TradeResult`.
  - `updateMarketPrices(state: GameState): GameState` (dynamic price elasticity).

- [ ] **Step 1: Write failing tests for economy and market**
  Verify taxes collect gold, population consumes food, famine causes unrest, market price increases on heavy buying and decreases on heavy selling.
- [ ] **Step 2: Run tests to verify they fail**
  Run `npx vitest run src/engine/systems/__tests__/economy.test.ts src/engine/systems/__tests__/market.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement `economy.ts` and `market.ts`**
  Implement production formulas, fiscal policies, and logarithmic price curve.
- [ ] **Step 4: Run tests to verify they pass**
  Run `npx vitest run src/engine/systems/__tests__/economy.test.ts src/engine/systems/__tests__/market.test.ts`. Expected: PASS.
- [ ] **Step 5: Commit**
  Commit as `feat(engine): implement fief taxation, food consumption, and dynamic global market`.

---

### Task 5: Military, Logistics & Tactical Battle Resolver

**Files:**
- Create: `src/engine/systems/military.ts`
- Create: `src/engine/systems/battle.ts`
- Test: `src/engine/systems/__tests__/military.test.ts`
- Test: `src/engine/systems/__tests__/battle.test.ts`

**Interfaces:**
- Consumes: `UNIT_CATALOGUE`, `Lord`, `Province`.
- Produces:
  - `recruitRegiment(state: GameState, lordId: string, provinceId: string, unitId: string, count: number): Result<GameState>`.
  - `moveArmy(state: GameState, armyId: string, targetProvinceId: string): Result<GameState>`.
  - `resolveBattle(attacker: Army, defender: Army, province: Province, seed?: number): BattleReport`.

- [ ] **Step 1: Write failing tests for recruiting, movement costs, and battle phases**
  Verify PA cost deduction, resource deduction, travel speed per terrain, and multi-phase combat (siege, ranged, cavalry shock, melee, morale rout).
- [ ] **Step 2: Run tests to verify they fail**
  Run `npx vitest run src/engine/systems/__tests__/military.test.ts src/engine/systems/__tests__/battle.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement `military.ts` and `battle.ts`**
  Implement recruitment, upkeep deduction, terrain movement penalties, and battle simulation.
- [ ] **Step 4: Run tests to verify they pass**
  Run `npx vitest run src/engine/systems/__tests__/military.test.ts src/engine/systems/__tests__/battle.test.ts`. Expected: PASS.
- [ ] **Step 5: Commit**
  Commit as `feat(engine): implement military recruitment, movement, and tactical battle resolver`.

---

### Task 6: Feudal Diplomacy, Vassalage, Espionage & Rumors

**Files:**
- Create: `src/engine/systems/diplomacy.ts`
- Create: `src/engine/systems/espionage.ts`
- Test: `src/engine/systems/__tests__/diplomacy.test.ts`
- Test: `src/engine/systems/__tests__/espionage.test.ts`

**Interfaces:**
- Consumes: `GameState`, `Lord`.
- Produces:
  - `swearFealty(state: GameState, vassalId: string, suzerainId: string, tributeRate: number): GameState`.
  - `sendPigeonMessage(state: GameState, fromId: string, toId: string, message: string): GameState`.
  - `postPublicRumor(state: GameState, authorId: string, text: string): GameState`.
  - `launchSpyMission(state: GameState, spyId: string, missionType: SpyMissionType, targetProvinceId: string): SpyResult`.

- [ ] **Step 1: Write failing tests for feudal relations and spy missions**
  Verify tribute payments from vassal to suzerain, rumor propagation, spy success/capture chances.
- [ ] **Step 2: Run tests to verify they fail**
  Run `npx vitest run src/engine/systems/__tests__/diplomacy.test.ts src/engine/systems/__tests__/espionage.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement `diplomacy.ts` and `espionage.ts`**
  Implement vassalage graph, tribute deduction, message log, and espionage odds.
- [ ] **Step 4: Run tests to verify they pass**
  Run `npx vitest run src/engine/systems/__tests__/diplomacy.test.ts src/engine/systems/__tests__/espionage.test.ts`. Expected: PASS.
- [ ] **Step 5: Commit**
  Commit as `feat(engine): implement feudal vassalage, diplomatic pigeons, rumors, and espionage`.

---

### Task 7: AI Rival Lords & Master Engine Orchestrator

**Files:**
- Create: `src/engine/systems/ai.ts`
- Create: `src/engine/engine.ts`
- Test: `src/engine/systems/__tests__/ai.test.ts`
- Test: `src/engine/__tests__/engine.test.ts`

**Interfaces:**
- Consumes: All systems.
- Produces:
  - `simulateAITurns(state: GameState): GameState` (archetype-driven lord actions).
  - `createInitialGameState(playerLordName: string): GameState`.
  - `tickGameState(state: GameState): GameState` (advances month, runs economy, market, AI, diplomacy, and battles).

- [ ] **Step 1: Write failing tests for master engine tick and AI decision loop**
  Verify that ticking state advances month, triggers AI actions, updates market, and keeps game state consistent.
- [ ] **Step 2: Run tests to verify they fail**
  Run `npx vitest run src/engine/__tests__/engine.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement `ai.ts` and `engine.ts`**
  Implement archetypes (Militariste, Marchand, Diplomate, Feudataire) and master simulation tick.
- [ ] **Step 4: Run tests to verify they pass**
  Run `npx vitest run src/engine/__tests__/engine.test.ts`. Expected: PASS.
- [ ] **Step 5: Commit**
  Commit as `feat(engine): implement AI lord archetypes and master game engine loop`.

---

### Task 8: Medieval Visual Theme & Reusable UI Components

**Files:**
- Create: `src/ui/components/ParchmentCard.tsx`
- Create: `src/ui/components/WaxSealButton.tsx`
- Create: `src/ui/components/HeraldicShield.tsx`
- Create: `src/ui/components/ResourceBar.tsx`
- Create: `src/ui/components/TimeController.tsx`
- Create: `src/ui/components/MedievalModal.tsx`

**Interfaces:**
- Consumes: Tailwind classes, Lucide icons, SVG blasons.
- Produces: Aesthetic medieval interface elements.

- [ ] **Step 1: Create Parchment, Wax Seal, and Heraldic Shield components**
  Stylize with antique borders, parchment shadows, gold embellishments, and wax seal effects.
- [ ] **Step 2: Create ResourceBar & TimeController**
  Displays Écus, Blé, Bois, Pierre, Fer, Action Points gauge (0-40 PA), Month & Season banner, and "Passer le mois" / speed controls.
- [ ] **Step 3: Verify visual components render in basic test or story**
- [ ] **Step 4: Commit**
  Commit as `feat(ui): create medieval parchment components, heraldic shields, and status controls`.

---

### Task 9: Core Game Views Integration

**Files:**
- Create: `src/ui/views/ThroneRoomView.tsx` (Dashboard, events, notifications, seasonal forecast)
- Create: `src/ui/views/RealmMapView.tsx` (Interactive map of Terres de Kald, provinces, armies)
- Create: `src/ui/views/FiefsView.tsx` (Provinces list, tax slider, building projects)
- Create: `src/ui/views/MilitaryView.tsx` (Barracks with 100+ units recruitment, armies, battle report modal)
- Create: `src/ui/views/MarketView.tsx` (Commodity prices, buy/sell sliders, price trend chart)
- Create: `src/ui/views/DiplomacyView.tsx` (Lords list, vassalage tree, pigeons, rumors board)
- Create: `src/ui/views/EspionageView.tsx` (Spy roster, mission dispatcher, reports)

**Interfaces:**
- Consumes: Game state from engine hook.
- Produces: Rich interactive views covering all original game screens.

- [ ] **Step 1: Implement ThroneRoomView and RealmMapView**
  Connect map nodes, army markers, and realm overview.
- [ ] **Step 2: Implement FiefsView and MarketView**
  Allow tax adjustments and dynamic commodity trading.
- [ ] **Step 3: Implement MilitaryView with 100+ Units Barracks and Battle Reports**
  Filter units by family, handle recruitment and army movements.
- [ ] **Step 4: Implement DiplomacyView and EspionageView**
  Pigeon messages, fealty oaths, rumor submission, and espionage missions.
- [ ] **Step 5: Commit**
  Commit as `feat(ui): implement all primary game views (Throne, Map, Fiefs, Military, Market, Diplomacy, Espionage)`.

---

### Task 10: State Management, Save/Load & Final Polish

**Files:**
- Create: `src/ui/state/useGameStore.ts`
- Modify: `src/ui/App.tsx`
- Test: `src/__tests__/integration.test.ts`

**Interfaces:**
- Produces:
  - LocalStorage/IndexedDB automatic save and load.
  - Export & Import `.fief` savegame file (JSON).
  - Seamless navigation between views.
  - End-to-end game flow tested and working.

- [ ] **Step 1: Implement `useGameStore` with local persistence & export/import**
- [ ] **Step 2: Connect all views into `App.tsx` with medieval navigation tabs**
- [ ] **Step 3: Write comprehensive integration test simulating a 12-month campaign**
- [ ] **Step 4: Run full test suite and verify 100% pass**
  Run `npx vitest run`.
- [ ] **Step 5: Verify build with `npm run build`**
- [ ] **Step 6: Commit**
  Commit as `feat: complete Fiefs & Royaumes remake with persistence, campaign integration, and full test suite`.
