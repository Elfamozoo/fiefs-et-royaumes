fa02958 feat(engine): define core types, 100+ units catalogue, and provinces map
 src/engine/__tests__/data.test.ts |  225 +++++
 src/engine/data/provinces.ts      |  422 +++++++++
 src/engine/data/units.ts          | 1716 +++++++++++++++++++++++++++++++++++++
 src/engine/index.ts               |    7 +
 src/engine/types.ts               |  196 +++++
 5 files changed, 2566 insertions(+)
diff --git a/src/engine/__tests__/data.test.ts b/src/engine/__tests__/data.test.ts
new file mode 100644
index 0000000..de1a723
--- /dev/null
+++ b/src/engine/__tests__/data.test.ts
@@ -0,0 +1,225 @@
+import { describe, it, expect } from 'vitest';
+import {
+  UNIT_CATALOGUE,
+  UNIT_MAP,
+  INITIAL_PROVINCES,
+  PROVINCES_MAP,
+  ENGINE_VERSION,
+  type UnitFamily,
+  type Biome,
+  type TaxRate,
+  type Season,
+  type ResourceType,
+  type GameState,
+} from '@engine/index';
+
+describe('Task 2: Core Domain Data & Catalogue', () => {
+  describe('Core Types & Engine Entry', () => {
+    it('exports valid engine version and domain enum sets', () => {
+      expect(ENGINE_VERSION).toBe('0.1.0');
+
+      const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
+      expect(seasons).toHaveLength(4);
+
+      const resources: ResourceType[] = ['gold', 'food', 'wood', 'stone', 'iron'];
+      expect(resources).toHaveLength(5);
+
+      // Verify GameState interface structure typing
+      const dummyState: Partial<GameState> = {
+        month: 1,
+        season: 'spring',
+        playerLordId: 'lord_player',
+      };
+      expect(dummyState.month).toBe(1);
+      expect(dummyState.season).toBe('spring');
+    });
+  });
+
+  describe('Unit Catalogue (100+ Units across 5 Families)', () => {
+    it('contains at least 100 unique unit definitions', () => {
+      expect(UNIT_CATALOGUE).toBeDefined();
+      expect(Array.isArray(UNIT_CATALOGUE)).toBe(true);
+      expect(UNIT_CATALOGUE.length).toBeGreaterThanOrEqual(100);
+
+      // Verify no duplicate IDs
+      const ids = UNIT_CATALOGUE.map((u) => u.id);
+      const uniqueIds = new Set(ids);
+      expect(uniqueIds.size).toBe(UNIT_CATALOGUE.length);
+    });
+
+    it('covers all five required military families', () => {
+      const families: UnitFamily[] = ['infantry', 'ranged', 'cavalry', 'exotic', 'siege'];
+      const presentFamilies = new Set(UNIT_CATALOGUE.map((u) => u.family));
+
+      for (const fam of families) {
+        expect(presentFamilies.has(fam)).toBe(true);
+        const count = UNIT_CATALOGUE.filter((u) => u.family === fam).length;
+        // Each family should have substantial representation
+        expect(count).toBeGreaterThanOrEqual(8);
+      }
+    });
+
+    it('validates stats, costs, upkeeps, and tier for every single unit', () => {
+      const validFamilies: UnitFamily[] = ['infantry', 'ranged', 'cavalry', 'exotic', 'siege'];
+
+      for (const unit of UNIT_CATALOGUE) {
+        // Identity & lore
+        expect(unit.id, `Unit ID should be non-empty string`).toBeTruthy();
+        expect(unit.name, `Unit ${unit.id} name should be non-empty`).toBeTruthy();
+        expect(unit.description, `Unit ${unit.id} description should be non-empty`).toBeTruthy();
+        expect(validFamilies).toContain(unit.family);
+
+        // Combat attributes
+        expect(unit.attack).toBeGreaterThan(0);
+        expect(unit.defense).toBeGreaterThan(0);
+        expect(unit.rangedAttack).toBeGreaterThanOrEqual(0);
+        expect(unit.armor).toBeGreaterThanOrEqual(0);
+        expect(unit.speed).toBeGreaterThan(0);
+        expect(unit.morale).toBeGreaterThanOrEqual(10);
+        expect(unit.morale).toBeLessThanOrEqual(100);
+
+        // Tier
+        expect(unit.tier).toBeGreaterThanOrEqual(1);
+        expect(unit.tier).toBeLessThanOrEqual(4);
+
+        // Economic costs
+        expect(unit.cost).toBeDefined();
+        expect(unit.cost.gold).toBeGreaterThan(0);
+        if (unit.cost.food !== undefined) expect(unit.cost.food).toBeGreaterThanOrEqual(0);
+        if (unit.cost.wood !== undefined) expect(unit.cost.wood).toBeGreaterThanOrEqual(0);
+        if (unit.cost.stone !== undefined) expect(unit.cost.stone).toBeGreaterThanOrEqual(0);
+        if (unit.cost.iron !== undefined) expect(unit.cost.iron).toBeGreaterThanOrEqual(0);
+
+        // Upkeep
+        expect(unit.upkeep).toBeDefined();
+        expect(unit.upkeep.gold).toBeGreaterThanOrEqual(0);
+        expect(unit.upkeep.food).toBeGreaterThanOrEqual(0);
+
+        // Ranged attacks must belong to ranged or siege or specialized units
+        if (unit.family === 'ranged') {
+          expect(unit.rangedAttack).toBeGreaterThan(0);
+        }
+      }
+    });
+
+    it('provides quick O(1) dictionary access via UNIT_MAP', () => {
+      expect(UNIT_MAP).toBeDefined();
+      expect(Object.keys(UNIT_MAP).length).toBe(UNIT_CATALOGUE.length);
+      for (const unit of UNIT_CATALOGUE) {
+        expect(UNIT_MAP[unit.id]).toBe(unit);
+      }
+    });
+
+    it('includes authentic historical and Kald exotic units from the spec', () => {
+      const names = UNIT_CATALOGUE.map((u) => u.name.toLowerCase());
+      const hasUnitMatching = (sub: string) => names.some((n) => n.includes(sub.toLowerCase()));
+
+      // Infantry
+      expect(hasUnitMatching('piquier') || hasUnitMatching('pique')).toBe(true);
+      expect(hasUnitMatching('hallebardier') || hasUnitMatching('hallebarde')).toBe(true);
+      expect(hasUnitMatching("hommes d'armes")).toBe(true);
+
+      // Ranged
+      expect(hasUnitMatching('archers longs') || hasUnitMatching('archer')).toBe(true);
+      expect(hasUnitMatching('arbal├®trier') || hasUnitMatching('arbaletrier')).toBe(true);
+
+      // Cavalry
+      expect(hasUnitMatching('chevalier')).toBe(true);
+      expect(hasUnitMatching('hussard') || hasUnitMatching('cataphracte') || hasUnitMatching('├®cuyer')).toBe(true);
+
+      // Exotic Kald units
+      expect(hasUnitMatching('samoura├»') || hasUnitMatching('samourai') || hasUnitMatching('ronin')).toBe(true);
+      expect(hasUnitMatching('berserker') || hasUnitMatching('pr├®torien') || hasUnitMatching('janissaire')).toBe(true);
+
+      // Siege
+      expect(hasUnitMatching('tr├®buchet') || hasUnitMatching('trebuchet')).toBe(true);
+      expect(hasUnitMatching('catapulte') || hasUnitMatching('b├®lier') || hasUnitMatching('belier')).toBe(true);
+    });
+  });
+
+  describe('Terres de Kald Provinces Map', () => {
+    it('defines at least 15 interconnected provinces', () => {
+      expect(INITIAL_PROVINCES).toBeDefined();
+      expect(Array.isArray(INITIAL_PROVINCES)).toBe(true);
+      expect(INITIAL_PROVINCES.length).toBeGreaterThanOrEqual(15);
+
+      const ids = INITIAL_PROVINCES.map((p) => p.id);
+      const uniqueIds = new Set(ids);
+      expect(uniqueIds.size).toBe(INITIAL_PROVINCES.length);
+    });
+
+    it('provides PROVINCES_MAP dictionary lookup', () => {
+      expect(PROVINCES_MAP).toBeDefined();
+      expect(Object.keys(PROVINCES_MAP).length).toBe(INITIAL_PROVINCES.length);
+      for (const prov of INITIAL_PROVINCES) {
+        expect(PROVINCES_MAP[prov.id]).toBe(prov);
+      }
+    });
+
+    it('validates province attributes, biomes, resources, and coordinates', () => {
+      const validBiomes: Biome[] = ['plains', 'forest', 'hills', 'mountains', 'marsh', 'coast', 'desert'];
+      const validTaxRates: TaxRate[] = ['low', 'moderate', 'high', 'extortion'];
+
+      for (const prov of INITIAL_PROVINCES) {
+        expect(prov.id).toBeTruthy();
+        expect(prov.name).toBeTruthy();
+        expect(validBiomes).toContain(prov.biome);
+        expect(validTaxRates).toContain(prov.taxRate);
+
+        expect(prov.population).toBeGreaterThanOrEqual(100);
+        expect(prov.morale).toBeGreaterThanOrEqual(0);
+        expect(prov.morale).toBeLessThanOrEqual(100);
+
+        // Coordinates
+        expect(prov.coordinates).toBeDefined();
+        expect(typeof prov.coordinates.x).toBe('number');
+        expect(typeof prov.coordinates.y).toBe('number');
+
+        // Resources stockpiles
+        expect(prov.resources).toBeDefined();
+        expect(prov.resources.gold).toBeGreaterThanOrEqual(0);
+        expect(prov.resources.food).toBeGreaterThanOrEqual(0);
+        expect(prov.resources.wood).toBeGreaterThanOrEqual(0);
+        expect(prov.resources.stone).toBeGreaterThanOrEqual(0);
+        expect(prov.resources.iron).toBeGreaterThanOrEqual(0);
+
+        // Connections exist
+        expect(Array.isArray(prov.connections)).toBe(true);
+        expect(prov.connections.length).toBeGreaterThanOrEqual(1);
+      }
+    });
+
+    it('ensures bidirectional connections between adjacent provinces', () => {
+      for (const prov of INITIAL_PROVINCES) {
+        for (const neighborId of prov.connections) {
+          const neighbor = PROVINCES_MAP[neighborId];
+          expect(neighbor, `Province ${prov.id} connects to non-existent neighbor ${neighborId}`).toBeDefined();
+          expect(
+            neighbor.connections,
+            `Connection between ${prov.id} and ${neighborId} must be bidirectional`
+          ).toContain(prov.id);
+        }
+      }
+    });
+
+    it('ensures the entire province map forms a single connected graph', () => {
+      // Breadth-First Search to verify all provinces can be reached from province 0
+      const visited = new Set<string>();
+      const queue: string[] = [INITIAL_PROVINCES[0].id];
+      visited.add(INITIAL_PROVINCES[0].id);
+
+      while (queue.length > 0) {
+        const currentId = queue.shift()!;
+        const current = PROVINCES_MAP[currentId];
+        for (const neighborId of current.connections) {
+          if (!visited.has(neighborId)) {
+            visited.add(neighborId);
+            queue.push(neighborId);
+          }
+        }
+      }
+
+      expect(visited.size).toBe(INITIAL_PROVINCES.length);
+    });
+  });
+});
diff --git a/src/engine/data/provinces.ts b/src/engine/data/provinces.ts
new file mode 100644
index 0000000..bef53d9
--- /dev/null
+++ b/src/engine/data/provinces.ts
@@ -0,0 +1,422 @@
+/**
+ * Fiefs & Royaumes - Terres de Kald Provinces Map
+ * 20 interconnected provinces with distinct biomes, populations, coordinates, and starting resources.
+ */
+
+import type { Province } from '../types';
+
+export const INITIAL_PROVINCES: Province[] = [
+  {
+    id: 'prov_kaldheim',
+    name: 'Kaldheim (Cit├® Royale)',
+    lordId: 'lord_player',
+    biome: 'plains',
+    population: 12000,
+    morale: 85,
+    taxRate: 'moderate',
+    resources: { gold: 500, food: 1500, wood: 400, stone: 350, iron: 250 },
+    buildings: [
+      { type: 'walls', level: 2 },
+      { type: 'barracks', level: 2 },
+      { type: 'granary', level: 2 },
+      { type: 'market', level: 1 },
+    ],
+    connections: [
+      'prov_val_dor',
+      'prov_castel_du_lac',
+      'prov_foret_noire',
+      'prov_plaines_de_ble',
+      'prov_collines_de_fer',
+    ],
+    coordinates: { x: 400, y: 300 },
+  },
+  {
+    id: 'prov_val_dor',
+    name: "Val-d'Or",
+    lordId: null,
+    biome: 'plains',
+    population: 8500,
+    morale: 80,
+    taxRate: 'moderate',
+    resources: { gold: 350, food: 1200, wood: 200, stone: 150, iron: 100 },
+    buildings: [
+      { type: 'market', level: 2 },
+      { type: 'granary', level: 1 },
+    ],
+    connections: [
+      'prov_kaldheim',
+      'prov_marches_d_ostmark',
+      'prov_collines_de_fer',
+      'prov_foret_noire',
+    ],
+    coordinates: { x: 480, y: 260 },
+  },
+  {
+    id: 'prov_castel_du_lac',
+    name: 'Castel-du-Lac',
+    lordId: null,
+    biome: 'plains',
+    population: 7800,
+    morale: 78,
+    taxRate: 'moderate',
+    resources: { gold: 280, food: 1100, wood: 250, stone: 200, iron: 120 },
+    buildings: [
+      { type: 'walls', level: 1 },
+      { type: 'barracks', level: 1 },
+    ],
+    connections: [
+      'prov_kaldheim',
+      'prov_port_franc',
+      'prov_foret_noire',
+      'prov_marais_des_brumes',
+    ],
+    coordinates: { x: 320, y: 260 },
+  },
+  {
+    id: 'prov_port_franc',
+    name: 'Port-Franc',
+    lordId: null,
+    biome: 'coast',
+    population: 9500,
+    morale: 75,
+    taxRate: 'moderate',
+    resources: { gold: 420, food: 950, wood: 350, stone: 180, iron: 150 },
+    buildings: [
+      { type: 'port', level: 2 },
+      { type: 'market', level: 2 },
+    ],
+    connections: [
+      'prov_castel_du_lac',
+      'prov_mont_dragon',
+      'prov_cote_d_emeraude',
+    ],
+    coordinates: { x: 220, y: 200 },
+  },
+  {
+    id: 'prov_marches_d_ostmark',
+    name: "Marches d'Ostmark",
+    lordId: null,
+    biome: 'hills',
+    population: 6200,
+    morale: 70,
+    taxRate: 'moderate',
+    resources: { gold: 200, food: 700, wood: 220, stone: 300, iron: 280 },
+    buildings: [
+      { type: 'watchtower', level: 2 },
+      { type: 'walls', level: 1 },
+    ],
+    connections: [
+      'prov_val_dor',
+      'prov_hautes_cimes',
+      'prov_dunes_d_azur',
+    ],
+    coordinates: { x: 560, y: 230 },
+  },
+  {
+    id: 'prov_foret_noire',
+    name: 'For├¬t-Noire',
+    lordId: null,
+    biome: 'forest',
+    population: 5400,
+    morale: 72,
+    taxRate: 'moderate',
+    resources: { gold: 150, food: 600, wood: 650, stone: 100, iron: 80 },
+    buildings: [
+      { type: 'watchtower', level: 1 },
+    ],
+    connections: [
+      'prov_kaldheim',
+      'prov_val_dor',
+      'prov_castel_du_lac',
+      'prov_hautes_cimes',
+      'prov_mont_dragon',
+    ],
+    coordinates: { x: 400, y: 180 },
+  },
+  {
+    id: 'prov_hautes_cimes',
+    name: 'Hautes-Cimes',
+    lordId: null,
+    biome: 'mountains',
+    population: 4100,
+    morale: 68,
+    taxRate: 'moderate',
+    resources: { gold: 180, food: 450, wood: 150, stone: 500, iron: 420 },
+    buildings: [
+      { type: 'forge', level: 2 },
+      { type: 'walls', level: 1 },
+    ],
+    connections: [
+      'prov_foret_noire',
+      'prov_mont_dragon',
+      'prov_marches_d_ostmark',
+    ],
+    coordinates: { x: 490, y: 140 },
+  },
+  {
+    id: 'prov_mont_dragon',
+    name: 'Mont-Dragon',
+    lordId: null,
+    biome: 'mountains',
+    population: 3800,
+    morale: 65,
+    taxRate: 'moderate',
+    resources: { gold: 220, food: 400, wood: 180, stone: 480, iron: 460 },
+    buildings: [
+      { type: 'forge', level: 1 },
+      { type: 'watchtower', level: 2 },
+    ],
+    connections: [
+      'prov_foret_noire',
+      'prov_hautes_cimes',
+      'prov_port_franc',
+    ],
+    coordinates: { x: 320, y: 130 },
+  },
+  {
+    id: 'prov_dunes_d_azur',
+    name: "Dunes-d'Azur",
+    lordId: null,
+    biome: 'desert',
+    population: 4600,
+    morale: 66,
+    taxRate: 'moderate',
+    resources: { gold: 310, food: 500, wood: 80, stone: 200, iron: 120 },
+    buildings: [
+      { type: 'market', level: 1 },
+    ],
+    connections: [
+      'prov_marches_d_ostmark',
+      'prov_collines_de_fer',
+      'prov_oasis_de_kald',
+    ],
+    coordinates: { x: 640, y: 320 },
+  },
+  {
+    id: 'prov_oasis_de_kald',
+    name: 'Oasis de Kald',
+    lordId: null,
+    biome: 'desert',
+    population: 5200,
+    morale: 74,
+    taxRate: 'moderate',
+    resources: { gold: 290, food: 750, wood: 100, stone: 150, iron: 90 },
+    buildings: [
+      { type: 'granary', level: 2 },
+    ],
+    connections: [
+      'prov_dunes_d_azur',
+      'prov_collines_de_fer',
+      'prov_terres_brulees',
+    ],
+    coordinates: { x: 630, y: 420 },
+  },
+  {
+    id: 'prov_marais_des_brumes',
+    name: 'Marais des Brumes',
+    lordId: null,
+    biome: 'marsh',
+    population: 4300,
+    morale: 64,
+    taxRate: 'moderate',
+    resources: { gold: 130, food: 650, wood: 380, stone: 90, iron: 110 },
+    buildings: [
+      { type: 'watchtower', level: 1 },
+    ],
+    connections: [
+      'prov_castel_du_lac',
+      'prov_cote_d_emeraude',
+      'prov_baronnie_des_pins',
+      'prov_marais_salants',
+    ],
+    coordinates: { x: 240, y: 360 },
+  },
+  {
+    id: 'prov_cote_d_emeraude',
+    name: "C├┤te d'├ëmeraude",
+    lordId: null,
+    biome: 'coast',
+    population: 6800,
+    morale: 76,
+    taxRate: 'moderate',
+    resources: { gold: 260, food: 900, wood: 220, stone: 140, iron: 90 },
+    buildings: [
+      { type: 'port', level: 1 },
+    ],
+    connections: [
+      'prov_port_franc',
+      'prov_marais_des_brumes',
+      'prov_marais_salants',
+    ],
+    coordinates: { x: 150, y: 310 },
+  },
+  {
+    id: 'prov_baronnie_des_pins',
+    name: 'Baronnie des Pins',
+    lordId: null,
+    biome: 'forest',
+    population: 5900,
+    morale: 71,
+    taxRate: 'moderate',
+    resources: { gold: 170, food: 700, wood: 580, stone: 120, iron: 100 },
+    buildings: [
+      { type: 'barracks', level: 1 },
+    ],
+    connections: [
+      'prov_marais_des_brumes',
+      'prov_plaines_de_ble',
+      'prov_delta_d_argent',
+    ],
+    coordinates: { x: 320, y: 420 },
+  },
+  {
+    id: 'prov_plaines_de_ble',
+    name: 'Plaines de Bl├®',
+    lordId: null,
+    biome: 'plains',
+    population: 9200,
+    morale: 82,
+    taxRate: 'moderate',
+    resources: { gold: 320, food: 2200, wood: 150, stone: 110, iron: 70 },
+    buildings: [
+      { type: 'granary', level: 3 },
+    ],
+    connections: [
+      'prov_kaldheim',
+      'prov_baronnie_des_pins',
+      'prov_collines_de_fer',
+      'prov_bastion_du_sud',
+    ],
+    coordinates: { x: 420, y: 410 },
+  },
+  {
+    id: 'prov_collines_de_fer',
+    name: 'Collines de Fer',
+    lordId: null,
+    biome: 'hills',
+    population: 7100,
+    morale: 73,
+    taxRate: 'moderate',
+    resources: { gold: 240, food: 800, wood: 180, stone: 380, iron: 550 },
+    buildings: [
+      { type: 'forge', level: 2 },
+      { type: 'walls', level: 1 },
+    ],
+    connections: [
+      'prov_kaldheim',
+      'prov_val_dor',
+      'prov_dunes_d_azur',
+      'prov_oasis_de_kald',
+      'prov_plaines_de_ble',
+      'prov_rocher_saint_marc',
+    ],
+    coordinates: { x: 520, y: 380 },
+  },
+  {
+    id: 'prov_rocher_saint_marc',
+    name: 'Rocher Saint-Marc',
+    lordId: null,
+    biome: 'hills',
+    population: 5800,
+    morale: 75,
+    taxRate: 'moderate',
+    resources: { gold: 210, food: 750, wood: 160, stone: 340, iron: 210 },
+    buildings: [
+      { type: 'walls', level: 2 },
+      { type: 'watchtower', level: 1 },
+    ],
+    connections: [
+      'prov_collines_de_fer',
+      'prov_bastion_du_sud',
+      'prov_terres_brulees',
+    ],
+    coordinates: { x: 480, y: 480 },
+  },
+  {
+    id: 'prov_marais_salants',
+    name: 'Marais Salants',
+    lordId: null,
+    biome: 'marsh',
+    population: 4600,
+    morale: 67,
+    taxRate: 'moderate',
+    resources: { gold: 270, food: 600, wood: 190, stone: 80, iron: 60 },
+    buildings: [
+      { type: 'market', level: 1 },
+    ],
+    connections: [
+      'prov_marais_des_brumes',
+      'prov_cote_d_emeraude',
+      'prov_delta_d_argent',
+    ],
+    coordinates: { x: 200, y: 470 },
+  },
+  {
+    id: 'prov_delta_d_argent',
+    name: "Delta d'Argent",
+    lordId: null,
+    biome: 'coast',
+    population: 7400,
+    morale: 77,
+    taxRate: 'moderate',
+    resources: { gold: 380, food: 1100, wood: 260, stone: 140, iron: 120 },
+    buildings: [
+      { type: 'port', level: 1 },
+      { type: 'market', level: 1 },
+    ],
+    connections: [
+      'prov_marais_salants',
+      'prov_baronnie_des_pins',
+      'prov_bastion_du_sud',
+    ],
+    coordinates: { x: 290, y: 520 },
+  },
+  {
+    id: 'prov_bastion_du_sud',
+    name: 'Bastion du Sud',
+    lordId: null,
+    biome: 'plains',
+    population: 8100,
+    morale: 79,
+    taxRate: 'moderate',
+    resources: { gold: 310, food: 1300, wood: 240, stone: 290, iron: 220 },
+    buildings: [
+      { type: 'walls', level: 2 },
+      { type: 'barracks', level: 2 },
+    ],
+    connections: [
+      'prov_plaines_de_ble',
+      'prov_delta_d_argent',
+      'prov_rocher_saint_marc',
+      'prov_terres_brulees',
+    ],
+    coordinates: { x: 390, y: 520 },
+  },
+  {
+    id: 'prov_terres_brulees',
+    name: 'Terres Br├╗l├®es',
+    lordId: null,
+    biome: 'desert',
+    population: 3900,
+    morale: 62,
+    taxRate: 'moderate',
+    resources: { gold: 190, food: 400, wood: 60, stone: 240, iron: 260 },
+    buildings: [
+      { type: 'watchtower', level: 1 },
+      { type: 'forge', level: 1 },
+    ],
+    connections: [
+      'prov_oasis_de_kald',
+      'prov_rocher_saint_marc',
+      'prov_bastion_du_sud',
+    ],
+    coordinates: { x: 590, y: 510 },
+  },
+];
+
+/**
+ * Fast O(1) dictionary map by province id
+ */
+export const PROVINCES_MAP: Record<string, Province> = Object.fromEntries(
+  INITIAL_PROVINCES.map((prov) => [prov.id, prov])
+);
diff --git a/src/engine/data/units.ts b/src/engine/data/units.ts
new file mode 100644
index 0000000..d75011f
--- /dev/null
+++ b/src/engine/data/units.ts
@@ -0,0 +1,1716 @@
+/**
+ * Fiefs & Royaumes - Military Unit Catalogue
+ * Authentic medieval and Kald units across 5 families.
+ */
+
+import type { UnitDefinition } from '../types';
+
+export const UNIT_CATALOGUE: UnitDefinition[] = [
+  // =========================================================================
+  // INFANTRY (26 Units)
+  // =========================================================================
+  // Tier 1
+  {
+    id: 'inf_paysans_armes',
+    name: 'Paysans en r├®volte',
+    family: 'infantry',
+    description: 'Serfs et m├®tayers arm├®s de fourches et de faux emmanch├®es ├á lÔÇÖenvers.',
+    attack: 4,
+    defense: 4,
+    rangedAttack: 0,
+    armor: 1,
+    speed: 2,
+    morale: 35,
+    cost: { gold: 10, food: 5 },
+    upkeep: { gold: 1, food: 1 },
+    tier: 1,
+  },
+  {
+    id: 'inf_miliciens_garnison',
+    name: 'Miliciens de garnison',
+    family: 'infantry',
+    description: 'Citoyens appel├®s aux armes pour tenir les bourgs et patrouiller les faubourgs.',
+    attack: 6,
+    defense: 6,
+    rangedAttack: 0,
+    armor: 2,
+    speed: 2,
+    morale: 45,
+    cost: { gold: 18, food: 8 },
+    upkeep: { gold: 2, food: 1 },
+    tier: 1,
+  },
+  {
+    id: 'inf_recrues_vassales',
+    name: 'Recrues f├®odales',
+    family: 'infantry',
+    description: 'Lev├®e dÔÇÖhommes issus des seigneuries secondaires sous serment f├®odal.',
+    attack: 7,
+    defense: 7,
+    rangedAttack: 0,
+    armor: 2,
+    speed: 2,
+    morale: 48,
+    cost: { gold: 22, food: 10 },
+    upkeep: { gold: 2, food: 1 },
+    tier: 1,
+  },
+  {
+    id: 'inf_lanciers_levis',
+    name: 'Lanciers de lev├®e',
+    family: 'infantry',
+    description: 'Ligne de pi├®tons arm├®s de longues piques de fr├¬ne pour briser les hardes l├®g├¿res.',
+    attack: 8,
+    defense: 9,
+    rangedAttack: 0,
+    armor: 3,
+    speed: 2,
+    morale: 50,
+    cost: { gold: 25, food: 10, wood: 5 },
+    upkeep: { gold: 2, food: 2 },
+    tier: 1,
+    counters: { cavalry: 1.5 },
+  },
+  {
+    id: 'inf_vougiers_communaux',
+    name: 'Vougiers communaux',
+    family: 'infantry',
+    description: 'Combattants ├®quip├®s de vouges forg├®es dans les ateliers du bailliage.',
+    attack: 9,
+    defense: 8,
+    rangedAttack: 0,
+    armor: 3,
+    speed: 2,
+    morale: 52,
+    cost: { gold: 28, wood: 8 },
+    upkeep: { gold: 3, food: 2 },
+    tier: 1,
+    counters: { cavalry: 1.3 },
+  },
+  {
+    id: 'inf_porte_haches_villageois',
+    name: 'Porte-haches rustiques',
+    family: 'infantry',
+    description: 'B├╗cherons et hardis montagnards maniant la grande hache ├á deux mains.',
+    attack: 10,
+    defense: 6,
+    rangedAttack: 0,
+    armor: 2,
+    speed: 2,
+    morale: 50,
+    cost: { gold: 26, iron: 4 },
+    upkeep: { gold: 2, food: 2 },
+    tier: 1,
+    counters: { infantry: 1.2 },
+  },
+
+  // Tier 2
+  {
+    id: 'inf_piquiers_flamands',
+    name: 'Piquiers flamands',
+    family: 'infantry',
+    description: 'Milice bourgeoise aguerrie dressant une for├¬t imp├®n├®trable de piques ferr├®es.',
+    attack: 12,
+    defense: 14,
+    rangedAttack: 0,
+    armor: 4,
+    speed: 2,
+    morale: 60,
+    cost: { gold: 45, wood: 15, iron: 5 },
+    upkeep: { gold: 4, food: 2 },
+    tier: 2,
+    counters: { cavalry: 2.0 },
+  },
+  {
+    id: 'inf_epeistes_italliques',
+    name: '├ëp├®istes ├á bouclier',
+    family: 'infantry',
+    description: 'Infanterie maniant lÔÇÖ├®p├®e dÔÇÖestoc et lÔÇÖ├®cu de bois cercl├® de fer.',
+    attack: 14,
+    defense: 13,
+    rangedAttack: 0,
+    armor: 5,
+    speed: 2,
+    morale: 62,
+    cost: { gold: 50, iron: 12 },
+    upkeep: { gold: 5, food: 2 },
+    tier: 2,
+    counters: { ranged: 1.3 },
+  },
+  {
+    id: 'inf_massiers_bourgeois',
+    name: 'Massiers dÔÇÖassaut',
+    family: 'infantry',
+    description: 'Sp├®cialistes du fracas dÔÇÖarmures maniant masses dÔÇÖarmes ├á pointes et fl├®aux.',
+    attack: 15,
+    defense: 12,
+    rangedAttack: 0,
+    armor: 5,
+    speed: 2,
+    morale: 60,
+    cost: { gold: 48, iron: 14 },
+    upkeep: { gold: 5, food: 2 },
+    tier: 2,
+    counters: { infantry: 1.4 },
+  },
+  {
+    id: 'inf_hallebardiers_suisses',
+    name: 'Hallebardiers suisses',
+    family: 'infantry',
+    description: 'Troupe dÔÇÖ├®lite des cantons, d├®vastatrice contre cavaliers et pi├®tons.',
+    attack: 16,
+    defense: 14,
+    rangedAttack: 0,
+    armor: 5,
+    speed: 2,
+    morale: 65,
+    cost: { gold: 55, wood: 10, iron: 15 },
+    upkeep: { gold: 5, food: 3 },
+    tier: 2,
+    counters: { cavalry: 1.8, infantry: 1.2 },
+  },
+  {
+    id: 'inf_gardes_de_la_cite',
+    name: 'Gardes de la cit├®',
+    family: 'infantry',
+    description: 'V├®t├®rans des remparts veillant sur les portes monumentales des grandes cit├®s.',
+    attack: 13,
+    defense: 16,
+    rangedAttack: 0,
+    armor: 6,
+    speed: 2,
+    morale: 65,
+    cost: { gold: 52, stone: 5, iron: 10 },
+    upkeep: { gold: 5, food: 2 },
+    tier: 2,
+    counters: { cavalry: 1.3 },
+  },
+  {
+    id: 'inf_sergents_d_armes',
+    name: 'Sergents dÔÇÖarmes',
+    family: 'infantry',
+    description: 'Soldats professionnels sous contrat de mesnie seigneuriale.',
+    attack: 15,
+    defense: 15,
+    rangedAttack: 0,
+    armor: 6,
+    speed: 2,
+    morale: 66,
+    cost: { gold: 60, iron: 15 },
+    upkeep: { gold: 6, food: 3 },
+    tier: 2,
+  },
+  {
+    id: 'inf_lansquenets_doppelsoldner',
+    name: 'Lansquenets dÔÇÖassaut',
+    family: 'infantry',
+    description: 'Mercenaires au double solde brandissant la colossale espadon ├á deux mains.',
+    attack: 18,
+    defense: 11,
+    rangedAttack: 0,
+    armor: 4,
+    speed: 3,
+    morale: 68,
+    cost: { gold: 65, iron: 16 },
+    upkeep: { gold: 6, food: 3 },
+    tier: 2,
+    counters: { infantry: 1.5 },
+  },
+
+  // Tier 3
+  {
+    id: 'inf_hommes_d_armes_en_plaques',
+    name: "Hommes d'armes royaux",
+    family: 'infantry',
+    description: 'Guerriers capara├ºonn├®s dÔÇÖacier tremp├® capables dÔÇÖaffronter les plus rudes chocs.',
+    attack: 20,
+    defense: 22,
+    rangedAttack: 0,
+    armor: 9,
+    speed: 2,
+    morale: 78,
+    cost: { gold: 90, iron: 30 },
+    upkeep: { gold: 8, food: 4 },
+    tier: 3,
+  },
+  {
+    id: 'inf_chevaliers_a_pied',
+    name: 'Chevaliers ├á pied',
+    family: 'infantry',
+    description: 'Nobles barons ayant mis pied ├á terre pour former un rempart in├®branlable.',
+    attack: 22,
+    defense: 21,
+    rangedAttack: 0,
+    armor: 9,
+    speed: 2,
+    morale: 82,
+    cost: { gold: 100, iron: 35 },
+    upkeep: { gold: 9, food: 4 },
+    tier: 3,
+  },
+  {
+    id: 'inf_fanassins_castillans',
+    name: 'Rodeleros castillans',
+    family: 'infantry',
+    description: 'Bretteurs vifs maniant la rondache dÔÇÖacier pour se faufiler sous les piques.',
+    attack: 21,
+    defense: 19,
+    rangedAttack: 0,
+    armor: 7,
+    speed: 3,
+    morale: 75,
+    cost: { gold: 85, iron: 25 },
+    upkeep: { gold: 8, food: 3 },
+    tier: 3,
+    counters: { ranged: 1.4 },
+  },
+  {
+    id: 'inf_hallebardiers_de_l_ordre',
+    name: 'Hallebardiers teutoniques',
+    family: 'infantry',
+    description: 'Crois├®s de lÔÇÖordre militaire asserment├®s dans la foi et lÔÇÖacier noir.',
+    attack: 22,
+    defense: 22,
+    rangedAttack: 0,
+    armor: 8,
+    speed: 2,
+    morale: 80,
+    cost: { gold: 95, iron: 28 },
+    upkeep: { gold: 9, food: 4 },
+    tier: 3,
+    counters: { cavalry: 2.0 },
+  },
+  {
+    id: 'inf_piquiers_tercio',
+    name: 'Piquiers de Tercio',
+    family: 'infantry',
+    description: 'Bataillon carr├® disciplin├®, le bastion absolu contre toute charge ├®questre.',
+    attack: 19,
+    defense: 25,
+    rangedAttack: 0,
+    armor: 9,
+    speed: 2,
+    morale: 84,
+    cost: { gold: 110, iron: 32, wood: 15 },
+    upkeep: { gold: 9, food: 4 },
+    tier: 3,
+    counters: { cavalry: 2.5 },
+  },
+  {
+    id: 'inf_gardes_des_remparts',
+    name: 'Gardes v├®t├®rans des remparts',
+    family: 'infantry',
+    description: 'Troupes sp├®cialis├®es dans la d├®fense acharn├®e des cr├®neaux et ponts-levis.',
+    attack: 18,
+    defense: 24,
+    rangedAttack: 0,
+    armor: 10,
+    speed: 1,
+    morale: 82,
+    cost: { gold: 95, stone: 20, iron: 25 },
+    upkeep: { gold: 8, food: 4 },
+    tier: 3,
+  },
+  {
+    id: 'inf_huskarls_royaux',
+    name: 'Huskarls du Grand Nord',
+    family: 'infantry',
+    description: 'Garde rapproch├®e des jarls nordiques v├¬tue de cottes dÔÇÖanneaux rivet├®es.',
+    attack: 24,
+    defense: 18,
+    rangedAttack: 0,
+    armor: 8,
+    speed: 2,
+    morale: 85,
+    cost: { gold: 105, iron: 30 },
+    upkeep: { gold: 9, food: 4 },
+    tier: 3,
+  },
+
+  // Tier 4
+  {
+    id: 'inf_gardes_royaux',
+    name: 'Gardes royaux de Kald',
+    family: 'infantry',
+    description: 'LÔÇÖ├®lite de la couronne, s├®lectionn├®e parmi les plus illustres v├®t├®rans du royaume.',
+    attack: 28,
+    defense: 30,
+    rangedAttack: 0,
+    armor: 12,
+    speed: 2,
+    morale: 95,
+    cost: { gold: 160, iron: 50 },
+    upkeep: { gold: 14, food: 6 },
+    tier: 4,
+  },
+  {
+    id: 'inf_gardes_noirs',
+    name: "Gardes noirs de l'Empereur",
+    family: 'infantry',
+    description: 'R├®giment dÔÇÖinfanterie imp├®riale dont la vue suffit ├á terrifier les seigneurs rebelles.',
+    attack: 30,
+    defense: 28,
+    rangedAttack: 0,
+    armor: 12,
+    speed: 2,
+    morale: 96,
+    cost: { gold: 175, iron: 55 },
+    upkeep: { gold: 15, food: 6 },
+    tier: 4,
+  },
+  {
+    id: 'inf_paladins_du_temple',
+    name: 'Paladins du Saint-S├®pulcre',
+    family: 'infantry',
+    description: 'Moines-guerriers b├®nis par les pontifes, insensibles ├á la d├®route.',
+    attack: 29,
+    defense: 31,
+    rangedAttack: 0,
+    armor: 13,
+    speed: 2,
+    morale: 98,
+    cost: { gold: 185, iron: 60, stone: 10 },
+    upkeep: { gold: 16, food: 6 },
+    tier: 4,
+  },
+  {
+    id: 'inf_briseurs_de_lignes',
+    name: 'Briseurs de lignes dÔÇÖ├®lite',
+    family: 'infantry',
+    description: 'G├®ants v├¬tus de harnais pleins forg├®s sur mesure pour ├®ventrer les formations adverses.',
+    attack: 33,
+    defense: 24,
+    rangedAttack: 0,
+    armor: 11,
+    speed: 3,
+    morale: 94,
+    cost: { gold: 170, iron: 55 },
+    upkeep: { gold: 15, food: 6 },
+    tier: 4,
+    counters: { infantry: 1.6 },
+  },
+  {
+    id: 'inf_champions_de_kald',
+    name: 'Champions de Kald',
+    family: 'infantry',
+    description: 'Vainqueurs des grands tournois de Kald ayant jur├® protection perp├®tuelle du royaume.',
+    attack: 32,
+    defense: 32,
+    rangedAttack: 0,
+    armor: 13,
+    speed: 2,
+    morale: 99,
+    cost: { gold: 200, iron: 65 },
+    upkeep: { gold: 18, food: 6 },
+    tier: 4,
+  },
+  {
+    id: 'inf_immortels_d_acier',
+    name: 'Immortels dÔÇÖacier',
+    family: 'infantry',
+    description: 'Guerriers l├®gendaires ayant surv├®cu ├á dix si├¿ges, v├¬tus du mythique fer damass├® de Kald.',
+    attack: 31,
+    defense: 34,
+    rangedAttack: 0,
+    armor: 14,
+    speed: 2,
+    morale: 100,
+    cost: { gold: 220, iron: 75 },
+    upkeep: { gold: 20, food: 7 },
+    tier: 4,
+  },
+
+  // =========================================================================
+  // RANGED (22 Units)
+  // =========================================================================
+  // Tier 1
+  {
+    id: 'ran_frondeurs_rustiques',
+    name: 'Frondeurs des collines',
+    family: 'ranged',
+    description: 'Bergers agiles projetant des galets polis avec une pr├®cision redoutable.',
+    attack: 5,
+    defense: 4,
+    rangedAttack: 8,
+    armor: 1,
+    speed: 3,
+    morale: 40,
+    cost: { gold: 12, stone: 5 },
+    upkeep: { gold: 1, food: 1 },
+    tier: 1,
+    counters: { infantry: 1.2 },
+  },
+  {
+    id: 'ran_archers_courts',
+    name: 'Archers courts de milice',
+    family: 'ranged',
+    description: 'Chasseurs ruraux ├®quip├®s dÔÇÖarcs simples en if ou en fr├¬ne.',
+    attack: 6,
+    defense: 5,
+    rangedAttack: 10,
+    armor: 1,
+    speed: 3,
+    morale: 46,
+    cost: { gold: 20, wood: 8 },
+    upkeep: { gold: 2, food: 1 },
+    tier: 1,
+    counters: { infantry: 1.3 },
+  },
+  {
+    id: 'ran_lanceurs_de_javelots',
+    name: 'Tirailleurs au javelot',
+    family: 'ranged',
+    description: 'Pi├®tons l├®gers harcelant les lignes ennemies ├á courte port├®e avant la m├¬l├®e.',
+    attack: 8,
+    defense: 6,
+    rangedAttack: 11,
+    armor: 2,
+    speed: 3,
+    morale: 48,
+    cost: { gold: 24, wood: 10, iron: 4 },
+    upkeep: { gold: 2, food: 2 },
+    tier: 1,
+    counters: { cavalry: 1.3 },
+  },
+  {
+    id: 'ran_arbaletriers_chasseurs',
+    name: 'Arbal├®triers de chasse',
+    family: 'ranged',
+    description: 'Gardes-chasses ├®quip├®s dÔÇÖarbal├¿tes l├®g├¿res ├á ├®trier pour percer le cuir ├®pais.',
+    attack: 7,
+    defense: 7,
+    rangedAttack: 12,
+    armor: 2,
+    speed: 2,
+    morale: 50,
+    cost: { gold: 28, wood: 10, iron: 6 },
+    upkeep: { gold: 3, food: 2 },
+    tier: 1,
+    counters: { infantry: 1.3 },
+  },
+
+  // Tier 2
+  {
+    id: 'ran_archers_francs',
+    name: 'Francs-archers',
+    family: 'ranged',
+    description: 'Archers roturiers exempt├®s de taille en ├®change dÔÇÖun entra├«nement dominical r├®gulier.',
+    attack: 9,
+    defense: 8,
+    rangedAttack: 15,
+    armor: 3,
+    speed: 3,
+    morale: 58,
+    cost: { gold: 45, wood: 15 },
+    upkeep: { gold: 4, food: 2 },
+    tier: 2,
+    counters: { infantry: 1.4 },
+  },
+  {
+    id: 'ran_archers_longs_gallois',
+    name: 'Archers longs gallois',
+    family: 'ranged',
+    description: 'Tireurs l├®gendaires capables de transpercer les cottes dÔÇÖacier ├á 200 toises.',
+    attack: 11,
+    defense: 9,
+    rangedAttack: 18,
+    armor: 3,
+    speed: 3,
+    morale: 65,
+    cost: { gold: 55, wood: 20 },
+    upkeep: { gold: 5, food: 2 },
+    tier: 2,
+    counters: { infantry: 1.5, cavalry: 1.2 },
+  },
+  {
+    id: 'ran_arbaletriers_genois',
+    name: 'Arbal├®triers g├®nois',
+    family: 'ranged',
+    description: 'Mercenaires ligures abrit├®s derri├¿re de larges pavois en bois de saule.',
+    attack: 10,
+    defense: 14,
+    rangedAttack: 17,
+    armor: 5,
+    speed: 2,
+    morale: 64,
+    cost: { gold: 58, wood: 15, iron: 10 },
+    upkeep: { gold: 5, food: 2 },
+    tier: 2,
+    counters: { cavalry: 1.4, ranged: 1.3 },
+  },
+  {
+    id: 'ran_arbaletriers_lourds',
+    name: 'Arbal├®triers lourds',
+    family: 'ranged',
+    description: 'Troupes arm├®es dÔÇÖarbal├¿tes dÔÇÖacier arm├®es au cric ou ├á la moufle.',
+    attack: 12,
+    defense: 13,
+    rangedAttack: 19,
+    armor: 6,
+    speed: 2,
+    morale: 66,
+    cost: { gold: 62, wood: 18, iron: 14 },
+    upkeep: { gold: 6, food: 2 },
+    tier: 2,
+    counters: { cavalry: 1.5 },
+  },
+  {
+    id: 'ran_arbaletriers_a_tour',
+    name: 'Arbal├®triers ├á tournelle',
+    family: 'ranged',
+    description: 'D├®fenseurs stationnaires maniant des armes dÔÇÖaff├╗t mont├®es sur pivot.',
+    attack: 11,
+    defense: 15,
+    rangedAttack: 18,
+    armor: 6,
+    speed: 2,
+    morale: 63,
+    cost: { gold: 60, wood: 15, stone: 8, iron: 10 },
+    upkeep: { gold: 5, food: 2 },
+    tier: 2,
+  },
+  {
+    id: 'ran_chasseurs_des_bois',
+    name: 'R├┤deurs des futaies',
+    family: 'ranged',
+    description: 'Tireurs embusqu├®s experts dans lÔÇÖart de tendre des pi├¿ges sylvestres mortels.',
+    attack: 13,
+    defense: 10,
+    rangedAttack: 16,
+    armor: 3,
+    speed: 4,
+    morale: 68,
+    cost: { gold: 52, wood: 18 },
+    upkeep: { gold: 5, food: 2 },
+    tier: 2,
+    counters: { ranged: 1.4 },
+  },
+
+  // Tier 3
+  {
+    id: 'ran_archers_royaux_yeomen',
+    name: 'Yeomen de la garde royale',
+    family: 'ranged',
+    description: 'Archers propri├®taires terriens d├®versant des vol├®es continues de fl├¿ches bodkin.',
+    attack: 15,
+    defense: 12,
+    rangedAttack: 24,
+    armor: 5,
+    speed: 3,
+    morale: 78,
+    cost: { gold: 90, wood: 30, iron: 10 },
+    upkeep: { gold: 8, food: 3 },
+    tier: 3,
+    counters: { infantry: 1.6, cavalry: 1.4 },
+  },
+  {
+    id: 'ran_arbaletriers_en_plaques',
+    name: 'Arbal├®triers royaux cuirass├®s',
+    family: 'ranged',
+    description: 'Tireurs v├¬tus de corselets de plaques pour soutenir les tirs de contre-batterie.',
+    attack: 16,
+    defense: 18,
+    rangedAttack: 25,
+    armor: 8,
+    speed: 2,
+    morale: 80,
+    cost: { gold: 105, iron: 28, wood: 20 },
+    upkeep: { gold: 9, food: 3 },
+    tier: 3,
+    counters: { cavalry: 1.7 },
+  },
+  {
+    id: 'ran_frondeurs_des_baleares',
+    name: 'Ma├«tres frondeurs insulaires',
+    family: 'ranged',
+    description: 'Artisans du plomb capables de briser un casque ├á cent pas sans faillir.',
+    attack: 14,
+    defense: 13,
+    rangedAttack: 22,
+    armor: 4,
+    speed: 4,
+    morale: 76,
+    cost: { gold: 80, stone: 20 },
+    upkeep: { gold: 7, food: 3 },
+    tier: 3,
+  },
+  {
+    id: 'ran_tireurs_d_elite_de_kald',
+    name: 'Tireurs dÔÇÖ├®lite de Kald',
+    family: 'ranged',
+    description: 'LÔÇÖ├®lite des vigies royales post├®e sur les bastions avanc├®s de Kaldheim.',
+    attack: 17,
+    defense: 15,
+    rangedAttack: 26,
+    armor: 6,
+    speed: 3,
+    morale: 82,
+    cost: { gold: 110, wood: 25, iron: 18 },
+    upkeep: { gold: 9, food: 3 },
+    tier: 3,
+  },
+  {
+    id: 'ran_arquebusiers_primitifs',
+    name: 'Arquebusiers ├á m├¿che',
+    family: 'ranged',
+    description: 'Pionniers des armes ├á feu crachant fum├®e et balles de plomb perforantes.',
+    attack: 20,
+    defense: 11,
+    rangedAttack: 27,
+    armor: 4,
+    speed: 2,
+    morale: 75,
+    cost: { gold: 120, iron: 30 },
+    upkeep: { gold: 10, food: 3 },
+    tier: 3,
+    counters: { cavalry: 1.8, siege: 1.3 },
+  },
+  {
+    id: 'ran_tireurs_de_fl├¿ches_enflammees',
+    name: 'Archers incendiaires',
+    family: 'ranged',
+    description: 'Sp├®cialistes du poix et de lÔÇÖhuile embras├®e pour ravager les machines ennemies.',
+    attack: 15,
+    defense: 12,
+    rangedAttack: 23,
+    armor: 4,
+    speed: 3,
+    morale: 74,
+    cost: { gold: 95, wood: 25 },
+    upkeep: { gold: 8, food: 3 },
+    tier: 3,
+    counters: { siege: 1.8 },
+  },
+
+  // Tier 4
+  {
+    id: 'ran_archers_maitres_du_grand_arc',
+    name: 'Ma├«tres du Grand Arc royal',
+    family: 'ranged',
+    description: 'Tireurs dÔÇÖexception capables de maintenir un barrage ininterrompu dÔÇÖacier.',
+    attack: 22,
+    defense: 18,
+    rangedAttack: 33,
+    armor: 8,
+    speed: 3,
+    morale: 92,
+    cost: { gold: 165, wood: 45, iron: 25 },
+    upkeep: { gold: 14, food: 4 },
+    tier: 4,
+    counters: { infantry: 1.7, cavalry: 1.6 },
+  },
+  {
+    id: 'ran_arbaletriers_imperiaux',
+    name: 'Arbal├®triers imp├®riaux dÔÇÖ├®lite',
+    family: 'ranged',
+    description: 'Tireurs prot├®g├®s de cottes de mailles dÔÇÖacier tremp├® et carreaux perforants.',
+    attack: 23,
+    defense: 24,
+    rangedAttack: 35,
+    armor: 10,
+    speed: 2,
+    morale: 94,
+    cost: { gold: 180, iron: 45, wood: 30 },
+    upkeep: { gold: 15, food: 5 },
+    tier: 4,
+    counters: { cavalry: 2.0 },
+  },
+  {
+    id: 'ran_gardes_forestiers_de_l_ombre',
+    name: 'R├┤deurs sylvestres dÔÇÖ├®lite',
+    family: 'ranged',
+    description: 'Spectres des grandes for├¬ts de Kald abattant les g├®n├®raux adverses ├á lÔÇÖimproviste.',
+    attack: 25,
+    defense: 20,
+    rangedAttack: 32,
+    armor: 7,
+    speed: 4,
+    morale: 95,
+    cost: { gold: 170, wood: 40, iron: 20 },
+    upkeep: { gold: 14, food: 4 },
+    tier: 4,
+  },
+  {
+    id: 'ran_mousquetaires_royaux',
+    name: 'Mousquetaires royaux',
+    family: 'ranged',
+    description: 'Mousquetaires de la maison du roi utilisant des fourquines et de lourdes charges.',
+    attack: 28,
+    defense: 16,
+    rangedAttack: 38,
+    armor: 6,
+    speed: 2,
+    morale: 93,
+    cost: { gold: 210, iron: 55 },
+    upkeep: { gold: 18, food: 5 },
+    tier: 4,
+    counters: { cavalry: 2.2, infantry: 1.5 },
+  },
+  {
+    id: 'ran_tireurs_d_acier_immortels',
+    name: 'Tireurs dÔÇÖacier de la citadelle',
+    family: 'ranged',
+    description: 'Arbal├®triers dÔÇÖ├®lite veillant sur le donjon supr├¬me des Terres de Kald.',
+    attack: 26,
+    defense: 25,
+    rangedAttack: 36,
+    armor: 11,
+    speed: 2,
+    morale: 97,
+    cost: { gold: 220, iron: 60, wood: 35 },
+    upkeep: { gold: 18, food: 5 },
+    tier: 4,
+  },
+  {
+    id: 'ran_legion_des_vents',
+    name: 'L├®gion des vents',
+    family: 'ranged',
+    description: 'Compagnie dÔÇÖarchers l├®gendaires r├®put├®e ne jamais laisser fuir un cavalier ennemi.',
+    attack: 27,
+    defense: 22,
+    rangedAttack: 37,
+    armor: 9,
+    speed: 4,
+    morale: 98,
+    cost: { gold: 230, iron: 50, wood: 40 },
+    upkeep: { gold: 19, food: 5 },
+    tier: 4,
+  },
+
+  // =========================================================================
+  // CAVALRY (22 Units)
+  // =========================================================================
+  // Tier 1
+  {
+    id: 'cav_eclaireurs_montes',
+    name: '├ëclaireurs mont├®s',
+    family: 'cavalry',
+    description: 'Cavaliers vifs envoy├®s en avant-garde pour cartographier et harceler.',
+    attack: 8,
+    defense: 6,
+    rangedAttack: 0,
+    armor: 2,
+    speed: 5,
+    morale: 48,
+    cost: { gold: 30, food: 15 },
+    upkeep: { gold: 3, food: 3 },
+    tier: 1,
+    counters: { ranged: 1.5 },
+  },
+  {
+    id: 'cav_cavaliers_legers_rustiques',
+    name: 'Cavaliers paysans',
+    family: 'cavalry',
+    description: 'Fils de m├®tayers mont├®s sur des chevaux de trait l├®gers et arm├®s dÔÇÖ├®pieux.',
+    attack: 9,
+    defense: 7,
+    rangedAttack: 0,
+    armor: 2,
+    speed: 4,
+    morale: 50,
+    cost: { gold: 35, food: 15 },
+    upkeep: { gold: 3, food: 3 },
+    tier: 1,
+    counters: { ranged: 1.4 },
+  },
+  {
+    id: 'cav_ecuyers_montes',
+    name: '├ëcuyers mont├®s',
+    family: 'cavalry',
+    description: 'Jeunes nobles servant leurs seigneurs au galop avec lance courte et rondache.',
+    attack: 11,
+    defense: 9,
+    rangedAttack: 0,
+    armor: 3,
+    speed: 4,
+    morale: 55,
+    cost: { gold: 45, food: 18, iron: 5 },
+    upkeep: { gold: 4, food: 3 },
+    tier: 1,
+    counters: { ranged: 1.5 },
+  },
+  {
+    id: 'cav_chevau_legers_frontaliers',
+    name: 'Chevau-l├®gers des fronti├¿res',
+    family: 'cavalry',
+    description: 'Cavaliers patrouilleurs exp├®riment├®s rompant les embuscades rurales.',
+    attack: 12,
+    defense: 8,
+    rangedAttack: 0,
+    armor: 3,
+    speed: 5,
+    morale: 56,
+    cost: { gold: 48, food: 20 },
+    upkeep: { gold: 4, food: 3 },
+    tier: 1,
+    counters: { ranged: 1.6 },
+  },
+
+  // Tier 2
+  {
+    id: 'cav_archers_a_cheval',
+    name: 'Archers ├á cheval',
+    family: 'cavalry',
+    description: 'Cavaliers nomades ma├«trisant le tir parthe au galop effr├®n├®.',
+    attack: 12,
+    defense: 9,
+    rangedAttack: 14,
+    armor: 3,
+    speed: 5,
+    morale: 62,
+    cost: { gold: 65, food: 25, wood: 15 },
+    upkeep: { gold: 5, food: 4 },
+    tier: 2,
+    counters: { infantry: 1.4 },
+  },
+  {
+    id: 'cav_sergents_montes',
+    name: 'Sergents mont├®s',
+    family: 'cavalry',
+    description: 'Cavalerie de ligne portant haubergeon et lance solide pour enfoncer les tirailleurs.',
+    attack: 15,
+    defense: 13,
+    rangedAttack: 0,
+    armor: 5,
+    speed: 4,
+    morale: 65,
+    cost: { gold: 70, food: 25, iron: 15 },
+    upkeep: { gold: 6, food: 4 },
+    tier: 2,
+    counters: { ranged: 1.6 },
+  },
+  {
+    id: 'cav_hussards_ailes_kald',
+    name: 'Hussards l├®gers de Kald',
+    family: 'cavalry',
+    description: 'Cavaliers dÔÇÖassaut rapide fondant sur les arri├¿res ennemis ├á brides abattues.',
+    attack: 17,
+    defense: 11,
+    rangedAttack: 0,
+    armor: 4,
+    speed: 5,
+    morale: 68,
+    cost: { gold: 78, food: 28, iron: 14 },
+    upkeep: { gold: 6, food: 4 },
+    tier: 2,
+    counters: { ranged: 1.8 },
+  },
+  {
+    id: 'cav_chevaliers_feodaux',
+    name: 'Chevaliers f├®odaux',
+    family: 'cavalry',
+    description: 'Seigneurs de ban maniant la lourde lance de tournoi et prot├®g├®s de mailles de fer.',
+    attack: 18,
+    defense: 16,
+    rangedAttack: 0,
+    armor: 7,
+    speed: 4,
+    morale: 72,
+    cost: { gold: 95, food: 35, iron: 25 },
+    upkeep: { gold: 8, food: 5 },
+    tier: 2,
+    counters: { ranged: 1.7, infantry: 1.3 },
+  },
+  {
+    id: 'cav_lanciers_lourds_italliques',
+    name: 'Lanciers lourds mont├®s',
+    family: 'cavalry',
+    description: 'Cavalerie disciplin├®e issue des plaines marchandes de Kald.',
+    attack: 17,
+    defense: 15,
+    rangedAttack: 0,
+    armor: 6,
+    speed: 4,
+    morale: 70,
+    cost: { gold: 88, food: 30, iron: 22 },
+    upkeep: { gold: 7, food: 5 },
+    tier: 2,
+    counters: { ranged: 1.6 },
+  },
+  {
+    id: 'cav_arbaletriers_a_cheval',
+    name: 'Arbal├®triers ├á cheval',
+    family: 'cavalry',
+    description: 'Tirailleurs mobiles arm├®s de petites arbal├¿tes en fer forg├®.',
+    attack: 13,
+    defense: 12,
+    rangedAttack: 16,
+    armor: 4,
+    speed: 4,
+    morale: 66,
+    cost: { gold: 75, food: 25, wood: 12, iron: 10 },
+    upkeep: { gold: 6, food: 4 },
+    tier: 2,
+    counters: { cavalry: 1.3 },
+  },
+
+  // Tier 3
+  {
+    id: 'cav_chevaliers_du_graal',
+    name: 'Chevaliers fieff├®s en armure',
+    family: 'cavalry',
+    description: 'Ch├ótelains nobles v├¬tus dÔÇÖarmures compl├¿tes sur fiers destriers capara├ºonn├®s.',
+    attack: 24,
+    defense: 22,
+    rangedAttack: 0,
+    armor: 9,
+    speed: 4,
+    morale: 82,
+    cost: { gold: 140, food: 50, iron: 45 },
+    upkeep: { gold: 12, food: 6 },
+    tier: 3,
+    counters: { ranged: 1.9, infantry: 1.4 },
+  },
+  {
+    id: 'cav_cataphractes_byzantins',
+    name: 'Cataphractes dÔÇÖorient',
+    family: 'cavalry',
+    description: 'Cavaliers cuirass├®s de la t├¬te aux sabots, brisant toute d├®fense frontale.',
+    attack: 25,
+    defense: 25,
+    rangedAttack: 0,
+    armor: 11,
+    speed: 3,
+    morale: 84,
+    cost: { gold: 155, food: 55, iron: 55 },
+    upkeep: { gold: 13, food: 7 },
+    tier: 3,
+    counters: { ranged: 1.8, infantry: 1.5 },
+  },
+  {
+    id: 'cav_gendarmes_d_ordonnance',
+    name: 'Gendarmes dÔÇÖordonnance',
+    family: 'cavalry',
+    description: 'Compagnies royales permanentes capables de charges d├®vastatrices au galop.',
+    attack: 26,
+    defense: 23,
+    rangedAttack: 0,
+    armor: 10,
+    speed: 4,
+    morale: 85,
+    cost: { gold: 160, food: 55, iron: 50 },
+    upkeep: { gold: 13, food: 6 },
+    tier: 3,
+    counters: { ranged: 2.0 },
+  },
+  {
+    id: 'cav_hussards_d_elite',
+    name: 'Hussards ail├®s de prestige',
+    family: 'cavalry',
+    description: 'Cavaliers orn├®s dÔÇÖailes dÔÇÖaigle semant la panique par le sifflement du vent.',
+    attack: 27,
+    defense: 18,
+    rangedAttack: 0,
+    armor: 8,
+    speed: 5,
+    morale: 86,
+    cost: { gold: 150, food: 50, iron: 40 },
+    upkeep: { gold: 12, food: 6 },
+    tier: 3,
+    counters: { ranged: 2.2, infantry: 1.4 },
+  },
+  {
+    id: 'cav_templiers_montes',
+    name: 'Chevaliers du Temple',
+    family: 'cavalry',
+    description: 'Moines soldats v├¬tus de manteaux blancs ├á croix rouge, vou├®s au martyre h├®ro├»que.',
+    attack: 25,
+    defense: 26,
+    rangedAttack: 0,
+    armor: 10,
+    speed: 4,
+    morale: 88,
+    cost: { gold: 165, food: 60, iron: 50 },
+    upkeep: { gold: 14, food: 7 },
+    tier: 3,
+  },
+  {
+    id: 'cav_hospitaliers_de_st_jean',
+    name: 'Chevaliers Hospitaliers',
+    family: 'cavalry',
+    description: 'Fr├¿res dÔÇÖarmes de Saint-Jean v├¬tus de noir, ma├«tres de la d├®fense et de la charge.',
+    attack: 24,
+    defense: 27,
+    rangedAttack: 0,
+    armor: 11,
+    speed: 3,
+    morale: 89,
+    cost: { gold: 170, food: 60, iron: 52 },
+    upkeep: { gold: 14, food: 7 },
+    tier: 3,
+  },
+
+  // Tier 4
+  {
+    id: 'cav_paladins_imperiaux',
+    name: 'Paladins imp├®riaux de Kald',
+    family: 'cavalry',
+    description: 'Seigneurs de haut lignage mont├®s sur des pur-sang destriers de Kald.',
+    attack: 34,
+    defense: 32,
+    rangedAttack: 0,
+    armor: 14,
+    speed: 4,
+    morale: 96,
+    cost: { gold: 260, food: 90, iron: 85 },
+    upkeep: { gold: 22, food: 9 },
+    tier: 4,
+    counters: { ranged: 2.5, infantry: 1.6 },
+  },
+  {
+    id: 'cav_maitres_cataphractes',
+    name: 'Grands ma├«tres cataphractes',
+    family: 'cavalry',
+    description: 'Une v├®ritable forteresse vivante dÔÇÖacier imprenable et ├®crasante.',
+    attack: 33,
+    defense: 36,
+    rangedAttack: 0,
+    armor: 16,
+    speed: 3,
+    morale: 97,
+    cost: { gold: 280, food: 95, iron: 100 },
+    upkeep: { gold: 24, food: 10 },
+    tier: 4,
+    counters: { ranged: 2.3, infantry: 1.7 },
+  },
+  {
+    id: 'cav_garde_du_corps_du_roi',
+    name: 'Garde ├á cheval du Haut-Roi',
+    family: 'cavalry',
+    description: 'Les douze pairs de Kald accompagnant le souverain sur le champ dÔÇÖhonneur.',
+    attack: 36,
+    defense: 31,
+    rangedAttack: 0,
+    armor: 13,
+    speed: 5,
+    morale: 98,
+    cost: { gold: 290, food: 100, iron: 90 },
+    upkeep: { gold: 25, food: 10 },
+    tier: 4,
+    counters: { ranged: 2.5 },
+  },
+  {
+    id: 'cav_cavaliers_du_chaos',
+    name: 'Cavaliers noirs de la nuit',
+    family: 'cavalry',
+    description: 'Mercenaires sans piti├® dont les montures ferr├®es dÔÇÖargent ├®crasent les bataillons.',
+    attack: 38,
+    defense: 28,
+    rangedAttack: 0,
+    armor: 12,
+    speed: 5,
+    morale: 95,
+    cost: { gold: 275, food: 90, iron: 80 },
+    upkeep: { gold: 23, food: 9 },
+    tier: 4,
+    counters: { infantry: 1.7 },
+  },
+  {
+    id: 'cav_lanciers_de_l_apocalypse',
+    name: 'Lanciers c├®lestes',
+    family: 'cavalry',
+    description: 'Cavaliers mystiques dont la charge ressemble au tonnerre des dieux anciens.',
+    attack: 37,
+    defense: 33,
+    rangedAttack: 0,
+    armor: 14,
+    speed: 4,
+    morale: 99,
+    cost: { gold: 310, food: 110, iron: 95 },
+    upkeep: { gold: 26, food: 11 },
+    tier: 4,
+  },
+  {
+    id: 'cav_cuirassiers_d_or',
+    name: 'Cuirassiers dÔÇÖor ├®tincelant',
+    family: 'cavalry',
+    description: 'Harnois dor├®s ├á lÔÇÖor fin, symbole de la richesse et de la terreur martiale de Kald.',
+    attack: 35,
+    defense: 35,
+    rangedAttack: 0,
+    armor: 15,
+    speed: 4,
+    morale: 100,
+    cost: { gold: 330, food: 115, iron: 105 },
+    upkeep: { gold: 28, food: 12 },
+    tier: 4,
+  },
+
+  // =========================================================================
+  // EXOTIC & REGIONAL OF KALD (22 Units)
+  // =========================================================================
+  // Tier 1
+  {
+    id: 'exo_guerriers_tribaux',
+    name: 'Guerriers nomades des pistes',
+    family: 'exotic',
+    description: 'Nomades des steppes m├®ridionales maniant le cimeterre et la targe de cuir bouilli.',
+    attack: 8,
+    defense: 6,
+    rangedAttack: 0,
+    armor: 1,
+    speed: 4,
+    morale: 48,
+    cost: { gold: 22, food: 10 },
+    upkeep: { gold: 2, food: 1 },
+    tier: 1,
+  },
+  {
+    id: 'exo_combattants_des_dunes',
+    name: 'Guerriers du d├®sert',
+    family: 'exotic',
+    description: 'Combattants enturbann├®s r├®sistant aux rigueurs arides et aux chaleurs extr├¬mes.',
+    attack: 9,
+    defense: 7,
+    rangedAttack: 0,
+    armor: 2,
+    speed: 4,
+    morale: 52,
+    cost: { gold: 28, food: 12 },
+    upkeep: { gold: 2, food: 2 },
+    tier: 1,
+    counters: { cavalry: 1.2 },
+  },
+  {
+    id: 'exo_pilleurs_des_cotes',
+    name: 'Pilleurs de fjord',
+    family: 'exotic',
+    description: 'Marins audacieux d├®barquant de leurs drakkars pour assaillir les rivages.',
+    attack: 10,
+    defense: 6,
+    rangedAttack: 0,
+    armor: 2,
+    speed: 3,
+    morale: 55,
+    cost: { gold: 26, wood: 10 },
+    upkeep: { gold: 2, food: 2 },
+    tier: 1,
+  },
+  {
+    id: 'exo_chasseurs_de_primes',
+    name: 'Chasseurs de primes mercenaires',
+    family: 'exotic',
+    description: 'Aventuriers louant leurs lames tranchantes et leurs carreaux au plus offrant.',
+    attack: 11,
+    defense: 8,
+    rangedAttack: 8,
+    armor: 2,
+    speed: 3,
+    morale: 54,
+    cost: { gold: 35 },
+    upkeep: { gold: 3, food: 2 },
+    tier: 1,
+  },
+
+  // Tier 2
+  {
+    id: 'exo_berserkers_nordiques',
+    name: 'Berserkers nordiques',
+    family: 'exotic',
+    description: 'Guerriers fauves mordant leurs boucliers dans une transe sanguinaire fr├®n├®tique.',
+    attack: 18,
+    defense: 8,
+    rangedAttack: 0,
+    armor: 2,
+    speed: 3,
+    morale: 75,
+    cost: { gold: 65, iron: 15 },
+    upkeep: { gold: 6, food: 3 },
+    tier: 2,
+    counters: { infantry: 1.5 },
+  },
+  {
+    id: 'exo_ronins_errants',
+    name: 'Ronins errants',
+    family: 'exotic',
+    description: 'Samoura├»s sans ma├«tre louant le fil ac├®r├® de leur katana pour survivre.',
+    attack: 17,
+    defense: 13,
+    rangedAttack: 0,
+    armor: 4,
+    speed: 3,
+    morale: 70,
+    cost: { gold: 70, iron: 18 },
+    upkeep: { gold: 6, food: 3 },
+    tier: 2,
+    counters: { infantry: 1.4 },
+  },
+  {
+    id: 'exo_lanciers_chameaux',
+    name: 'Lanciers m├®haristes du d├®sert',
+    family: 'exotic',
+    description: 'Cavaliers sur dromadaires dont lÔÇÖodeur et la taille effraient les chevaux.',
+    attack: 14,
+    defense: 14,
+    rangedAttack: 0,
+    armor: 4,
+    speed: 4,
+    morale: 66,
+    cost: { gold: 75, food: 25, iron: 10 },
+    upkeep: { gold: 6, food: 4 },
+    tier: 2,
+    counters: { cavalry: 2.2 },
+  },
+  {
+    id: 'exo_inquisiteurs_itinerants',
+    name: 'Fanatiques z├®lotes',
+    family: 'exotic',
+    description: 'P├®nitents flagellants marchant au combat sous lÔÇÖextase religieuse.',
+    attack: 16,
+    defense: 11,
+    rangedAttack: 0,
+    armor: 3,
+    speed: 3,
+    morale: 80,
+    cost: { gold: 58, wood: 10 },
+    upkeep: { gold: 5, food: 2 },
+    tier: 2,
+  },
+  {
+    id: 'exo_gardes_des_caravanes',
+    name: 'Escorteurs de la route de la soie',
+    family: 'exotic',
+    description: 'Guerriers marchands aguerris prot├®geant les convois dÔÇÖ├®pices de Kald.',
+    attack: 13,
+    defense: 15,
+    rangedAttack: 10,
+    armor: 5,
+    speed: 3,
+    morale: 64,
+    cost: { gold: 62, iron: 12 },
+    upkeep: { gold: 5, food: 3 },
+    tier: 2,
+  },
+  {
+    id: 'exo_bretteurs_maures',
+    name: 'Bretteurs dÔÇÖAl-Andalus',
+    family: 'exotic',
+    description: 'Escrimeurs rapides maniant la fine lame tol├®dane avec virtuosit├®.',
+    attack: 16,
+    defense: 12,
+    rangedAttack: 0,
+    armor: 4,
+    speed: 4,
+    morale: 68,
+    cost: { gold: 64, iron: 14 },
+    upkeep: { gold: 5, food: 3 },
+    tier: 2,
+    counters: { infantry: 1.3 },
+  },
+
+  // Tier 3
+  {
+    id: 'exo_samourais_du_daimyo',
+    name: 'Samoura├»s du Daimyo',
+    family: 'exotic',
+    description: 'Guerriers nobles li├®s par le code dÔÇÖhonneur et maniant le katana dÔÇÖacier pli├®.',
+    attack: 24,
+    defense: 21,
+    rangedAttack: 15,
+    armor: 8,
+    speed: 3,
+    morale: 88,
+    cost: { gold: 135, iron: 38, wood: 15 },
+    upkeep: { gold: 11, food: 4 },
+    tier: 3,
+    counters: { infantry: 1.5, cavalry: 1.3 },
+  },
+  {
+    id: 'exo_janissaires_ottomans',
+    name: 'Janissaires dÔÇÖ├®lite',
+    family: 'exotic',
+    description: 'Infanterie r├®guli├¿re au service exclusif du souverain, disciplin├®e et d├®vou├®e.',
+    attack: 23,
+    defense: 20,
+    rangedAttack: 20,
+    armor: 7,
+    speed: 3,
+    morale: 86,
+    cost: { gold: 130, iron: 35, wood: 15 },
+    upkeep: { gold: 11, food: 4 },
+    tier: 3,
+    counters: { cavalry: 1.6, infantry: 1.4 },
+  },
+  {
+    id: 'exo_gardes_pretoriens',
+    name: 'Gardes pr├®toriens imp├®riaux',
+    family: 'exotic',
+    description: 'L├®gionnaires de lÔÇÖantiquit├® kaldienne ├®quip├®s du grand scutum et du pilum.',
+    attack: 25,
+    defense: 25,
+    rangedAttack: 0,
+    armor: 10,
+    speed: 2,
+    morale: 90,
+    cost: { gold: 145, iron: 45 },
+    upkeep: { gold: 12, food: 5 },
+    tier: 3,
+    counters: { infantry: 1.5 },
+  },
+  {
+    id: 'exo_mamelouks_royaux',
+    name: 'Mamelouks de la garde',
+    family: 'exotic',
+    description: 'Anciens esclaves affranchis form├®s d├¿s lÔÇÖenfance ├á la haute ├®quitation martiale.',
+    attack: 26,
+    defense: 22,
+    rangedAttack: 12,
+    armor: 8,
+    speed: 4,
+    morale: 87,
+    cost: { gold: 150, food: 45, iron: 40 },
+    upkeep: { gold: 12, food: 5 },
+    tier: 3,
+    counters: { cavalry: 1.5, ranged: 1.6 },
+  },
+  {
+    id: 'exo_guerriers_jaguars',
+    name: 'Guerriers jaguars mystiques',
+    family: 'exotic',
+    description: 'Combattants rituels v├¬tus de peaux de fauves brandissant le macuahuitl dÔÇÖobsidienne.',
+    attack: 26,
+    defense: 16,
+    rangedAttack: 0,
+    armor: 5,
+    speed: 4,
+    morale: 88,
+    cost: { gold: 125, wood: 20, iron: 20 },
+    upkeep: { gold: 10, food: 4 },
+    tier: 3,
+    counters: { infantry: 1.7 },
+  },
+  {
+    id: 'exo_combattants_shaolin',
+    name: 'Moines combattants du monast├¿re',
+    family: 'exotic',
+    description: 'Asc├¿tes experts des arts martiaux au b├óton ferr├®, esquivant les coups avec gr├óce.',
+    attack: 23,
+    defense: 23,
+    rangedAttack: 0,
+    armor: 6,
+    speed: 4,
+    morale: 92,
+    cost: { gold: 120, wood: 25 },
+    upkeep: { gold: 9, food: 3 },
+    tier: 3,
+  },
+
+  // Tier 4
+  {
+    id: 'exo_maitres_samourais_kenshi',
+    name: 'Ma├«tres Kenshi de Kald',
+    family: 'exotic',
+    description: 'LÔÇÖapog├®e de la voie du sabre, capables de trancher un cavalier en plein ├®lan.',
+    attack: 35,
+    defense: 29,
+    rangedAttack: 22,
+    armor: 11,
+    speed: 3,
+    morale: 98,
+    cost: { gold: 250, iron: 75, wood: 30 },
+    upkeep: { gold: 20, food: 6 },
+    tier: 4,
+    counters: { infantry: 1.7, cavalry: 1.5 },
+  },
+  {
+    id: 'exo_janissaires_gardes_du_sultan',
+    name: 'Gardes dÔÇÖor du Grand Vizir',
+    family: 'exotic',
+    description: 'R├®giment supr├¬me arm├® de mousquets incrust├®s de nacre et sabres dÔÇÖacier damass├®.',
+    attack: 33,
+    defense: 31,
+    rangedAttack: 28,
+    armor: 11,
+    speed: 3,
+    morale: 97,
+    cost: { gold: 260, iron: 70, wood: 35 },
+    upkeep: { gold: 21, food: 6 },
+    tier: 4,
+    counters: { cavalry: 1.9, infantry: 1.6 },
+  },
+  {
+    id: 'exo_gardes_varegues',
+    name: 'Gardes var├¿gues de Constantinople',
+    family: 'exotic',
+    description: 'G├®ants scandinaves au service imp├®rial arm├®s de grandes haches danoises ├á double tranchant.',
+    attack: 36,
+    defense: 30,
+    rangedAttack: 0,
+    armor: 12,
+    speed: 3,
+    morale: 99,
+    cost: { gold: 270, iron: 80 },
+    upkeep: { gold: 22, food: 7 },
+    tier: 4,
+    counters: { infantry: 1.8 },
+  },
+  {
+    id: 'exo_elephants_de_guerre',
+    name: '├ël├®phants cuirass├®s de guerre',
+    family: 'exotic',
+    description: 'B├¬tes colossales surmont├®es dÔÇÖun howdah fortifi├®, pi├®tinant les arm├®es enti├¿res.',
+    attack: 38,
+    defense: 36,
+    rangedAttack: 16,
+    armor: 14,
+    speed: 2,
+    morale: 95,
+    cost: { gold: 320, food: 120, iron: 60 },
+    upkeep: { gold: 25, food: 12 },
+    tier: 4,
+    counters: { cavalry: 2.5, infantry: 2.0 },
+  },
+  {
+    id: 'exo_legion_immortelle_d_orient',
+    name: 'L├®gion immortelle dÔÇÖOrient',
+    family: 'exotic',
+    description: 'Bataillon mythique dont le nombre reste immuable par remplacement instantan├® des morts.',
+    attack: 34,
+    defense: 34,
+    rangedAttack: 20,
+    armor: 13,
+    speed: 3,
+    morale: 99,
+    cost: { gold: 290, iron: 85 },
+    upkeep: { gold: 24, food: 7 },
+    tier: 4,
+  },
+  {
+    id: 'exo_archontes_solaires',
+    name: 'Archontes solaires de Kald',
+    family: 'exotic',
+    description: 'Ordre mystique de Kald veillant sur le culte de la flamme ├®ternelle.',
+    attack: 37,
+    defense: 33,
+    rangedAttack: 25,
+    armor: 13,
+    speed: 4,
+    morale: 100,
+    cost: { gold: 340, iron: 90 },
+    upkeep: { gold: 28, food: 8 },
+    tier: 4,
+  },
+
+  // =========================================================================
+  // SIEGE WEAPONS (13 Units)
+  // =========================================================================
+  // Tier 1
+  {
+    id: 'sie_beliers_de_sape',
+    name: 'B├®liers de sape',
+    family: 'siege',
+    description: 'Tronc ferr├® suspendu sous une tortue de bois pour d├®foncer les portes massives.',
+    attack: 14,
+    defense: 10,
+    rangedAttack: 0,
+    armor: 5,
+    speed: 1,
+    morale: 50,
+    cost: { gold: 40, wood: 30 },
+    upkeep: { gold: 4, food: 2 },
+    tier: 1,
+    counters: { siege: 1.5 },
+  },
+  {
+    id: 'sie_balistes_de_rempart',
+    name: 'Balistes l├®g├¿res de rempart',
+    family: 'siege',
+    description: 'Machine de torsion projetant de lourds carreaux pour briser les retranchements.',
+    attack: 12,
+    defense: 8,
+    rangedAttack: 16,
+    armor: 3,
+    speed: 2,
+    morale: 55,
+    cost: { gold: 48, wood: 25, iron: 8 },
+    upkeep: { gold: 4, food: 2 },
+    tier: 1,
+    counters: { cavalry: 1.4 },
+  },
+  {
+    id: 'sie_echelles_d_escalade',
+    name: 'Compagnies dÔÇÖ├®chelles de si├¿ge',
+    family: 'siege',
+    description: 'Pionniers ├®quip├®s de grappins et dÔÇÖ├®chelles articul├®es pour assaillir les courtines.',
+    attack: 8,
+    defense: 7,
+    rangedAttack: 0,
+    armor: 2,
+    speed: 3,
+    morale: 50,
+    cost: { gold: 25, wood: 20 },
+    upkeep: { gold: 2, food: 2 },
+    tier: 1,
+  },
+
+  // Tier 2
+  {
+    id: 'sie_onagres_de_campagne',
+    name: 'Onagres de campagne',
+    family: 'siege',
+    description: 'Engin ├á torsion envoyant de lourds rochers incendiaires contre les palissades.',
+    attack: 18,
+    defense: 11,
+    rangedAttack: 22,
+    armor: 4,
+    speed: 1,
+    morale: 60,
+    cost: { gold: 80, wood: 45, stone: 20 },
+    upkeep: { gold: 7, food: 3 },
+    tier: 2,
+    counters: { siege: 1.6 },
+  },
+  {
+    id: 'sie_balistes_lourdes',
+    name: 'Balistes lourdes',
+    family: 'siege',
+    description: 'Engin dÔÇÖassaut propulsant dÔÇÖimmenses javelines capables dÔÇÖembrocher trois cavaliers.',
+    attack: 20,
+    defense: 13,
+    rangedAttack: 25,
+    armor: 5,
+    speed: 1,
+    morale: 65,
+    cost: { gold: 90, wood: 40, iron: 25 },
+    upkeep: { gold: 7, food: 3 },
+    tier: 2,
+    counters: { cavalry: 1.8 },
+  },
+  {
+    id: 'sie_catapultes_de_siege',
+    name: 'Catapultes de si├¿ge',
+    family: 'siege',
+    description: 'Grande catapulte projetant des blocs de calcaire contre les fortifications seigneuriales.',
+    attack: 22,
+    defense: 12,
+    rangedAttack: 26,
+    armor: 4,
+    speed: 1,
+    morale: 62,
+    cost: { gold: 105, wood: 55, stone: 30 },
+    upkeep: { gold: 8, food: 3 },
+    tier: 2,
+    counters: { siege: 1.8 },
+  },
+  {
+    id: 'sie_mantlets_et_murs_roulants',
+    name: 'Murs roulants et mantelets',
+    family: 'siege',
+    description: 'Boucliers de bois mobiles blind├®s de cuir vert pour prot├®ger les sapeurs des fl├¿ches.',
+    attack: 6,
+    defense: 20,
+    rangedAttack: 0,
+    armor: 8,
+    speed: 1,
+    morale: 65,
+    cost: { gold: 65, wood: 50, iron: 10 },
+    upkeep: { gold: 5, food: 2 },
+    tier: 2,
+    counters: { ranged: 2.5 },
+  },
+
+  // Tier 3
+  {
+    id: 'sie_mangonneaux_a_contrepoids',
+    name: 'Mangonneaux ├á contrepoids',
+    family: 'siege',
+    description: 'Engin dÔÇÖartillerie de jet ravageant les cr├®neaux et donjons par tir en cloche.',
+    attack: 28,
+    defense: 16,
+    rangedAttack: 32,
+    armor: 6,
+    speed: 1,
+    morale: 75,
+    cost: { gold: 150, wood: 70, stone: 45, iron: 20 },
+    upkeep: { gold: 12, food: 4 },
+    tier: 3,
+  },
+  {
+    id: 'sie_tours_de_siege',
+    name: 'Tours de si├¿ge roulantes',
+    family: 'siege',
+    description: 'Beffroi colossale de ch├¬ne permettant dÔÇÖaborder les courtines ├á la m├¬me hauteur.',
+    attack: 24,
+    defense: 28,
+    rangedAttack: 18,
+    armor: 10,
+    speed: 1,
+    morale: 78,
+    cost: { gold: 175, wood: 90, iron: 35 },
+    upkeep: { gold: 14, food: 5 },
+    tier: 3,
+    counters: { ranged: 2.0 },
+  },
+  {
+    id: 'sie_trebuchets_de_campagne',
+    name: 'Tr├®buchets lourds de campagne',
+    family: 'siege',
+    description: 'Machine de si├¿ge redoutable lan├ºant des blocs de 150 kilos ├á plus de 300 toises.',
+    attack: 32,
+    defense: 15,
+    rangedAttack: 38,
+    armor: 6,
+    speed: 1,
+    morale: 76,
+    cost: { gold: 190, wood: 90, stone: 60, iron: 25 },
+    upkeep: { gold: 15, food: 5 },
+    tier: 3,
+  },
+
+  // Tier 4
+  {
+    id: 'sie_trebuchets_royaux',
+    name: 'Tr├®buchets royaux de Kald',
+    family: 'siege',
+    description: 'Le ma├«tre des si├¿ges, capable de pulv├®riser les plus ├®paisses murailles de pierre de taille.',
+    attack: 44,
+    defense: 22,
+    rangedAttack: 50,
+    armor: 9,
+    speed: 1,
+    morale: 92,
+    cost: { gold: 320, wood: 150, stone: 100, iron: 50 },
+    upkeep: { gold: 25, food: 8 },
+    tier: 4,
+    counters: { siege: 2.5 },
+  },
+  {
+    id: 'sie_bombardes_a_poudre',
+    name: 'Bombardes de fer forg├®',
+    family: 'siege',
+    description: 'Canons colossaux crachant des boulets de granit dans un vacarme assourdissant.',
+    attack: 50,
+    defense: 18,
+    rangedAttack: 52,
+    armor: 8,
+    speed: 1,
+    morale: 90,
+    cost: { gold: 380, iron: 120, stone: 60 },
+    upkeep: { gold: 28, food: 8 },
+    tier: 4,
+    counters: { siege: 2.8 },
+  },
+  {
+    id: 'sie_colosses_de_sape',
+    name: 'Colosses briseurs de murailles',
+    family: 'siege',
+    description: 'Monstrueuse forteresse mobile de sape blind├®e de fer forg├®, brisant tout sur son passage.',
+    attack: 40,
+    defense: 38,
+    rangedAttack: 0,
+    armor: 16,
+    speed: 1,
+    morale: 95,
+    cost: { gold: 350, wood: 160, iron: 100 },
+    upkeep: { gold: 26, food: 9 },
+    tier: 4,
+    counters: { siege: 3.0 },
+  },
+];
+
+/**
+ * Fast O(1) dictionary map by unit id
+ */
+export const UNIT_MAP: Record<string, UnitDefinition> = Object.fromEntries(
+  UNIT_CATALOGUE.map((unit) => [unit.id, unit])
+);
diff --git a/src/engine/index.ts b/src/engine/index.ts
index 7685fbb..ecc5f0b 100644
--- a/src/engine/index.ts
+++ b/src/engine/index.ts
@@ -1,6 +1,13 @@
 /**
  * Fiefs & Royaumes - Core Domain Engine
  * Isomorphic, pure deterministic domain simulation for Terres de Kald.
  */
 
 export const ENGINE_VERSION = '0.1.0';
+
+// Core domain types
+export * from './types';
+
+// Constants & Initial data catalogues
+export * from './data/units';
+export * from './data/provinces';
diff --git a/src/engine/types.ts b/src/engine/types.ts
new file mode 100644
index 0000000..3c576ec
--- /dev/null
+++ b/src/engine/types.ts
@@ -0,0 +1,196 @@
+/**
+ * Fiefs & Royaumes - Core Domain Types
+ * Terres de Kald Simulation Engine
+ */
+
+export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
+
+export type ResourceType = 'gold' | 'food' | 'wood' | 'stone' | 'iron';
+
+export type Resources = Record<ResourceType, number>;
+
+export type TaxRate = 'low' | 'moderate' | 'high' | 'extortion';
+
+export type UnitFamily = 'infantry' | 'ranged' | 'cavalry' | 'exotic' | 'siege';
+
+export interface UnitUpkeep {
+  gold: number;
+  food: number;
+}
+
+export type UnitCost = Partial<Record<ResourceType, number>> & {
+  gold: number;
+};
+
+export interface UnitDefinition {
+  id: string;
+  name: string;
+  family: UnitFamily;
+  description: string;
+  attack: number;
+  defense: number;
+  rangedAttack: number;
+  armor: number;
+  speed: number;
+  morale: number;
+  cost: UnitCost;
+  upkeep: UnitUpkeep;
+  tier: 1 | 2 | 3 | 4;
+  counters?: Partial<Record<UnitFamily, number>>;
+}
+
+export interface Regiment {
+  unitId: string;
+  count: number;
+  experience?: number;
+}
+
+export interface Army {
+  id: string;
+  lordId: string;
+  name: string;
+  provinceId: string;
+  regiments: Regiment[];
+}
+
+export type Biome = 'plains' | 'forest' | 'hills' | 'mountains' | 'marsh' | 'coast' | 'desert';
+
+export interface Coordinates {
+  x: number;
+  y: number;
+}
+
+export type BuildingType = 'barracks' | 'walls' | 'granary' | 'market' | 'forge' | 'watchtower' | 'port';
+
+export interface ProvinceBuilding {
+  type: BuildingType;
+  level: number;
+}
+
+export interface Province {
+  id: string;
+  name: string;
+  lordId: string | null;
+  biome: Biome;
+  population: number;
+  morale: number; // 0 to 100
+  taxRate: TaxRate;
+  resources: Resources;
+  buildings: ProvinceBuilding[];
+  connections: string[];
+  coordinates: Coordinates;
+}
+
+export type LordArchetype = 'conqueror' | 'merchant' | 'diplomat' | 'traditionalist';
+
+export interface LordHeraldry {
+  shield: string;
+  charge: string;
+  primaryColor: string;
+  secondaryColor: string;
+}
+
+export interface Lord {
+  id: string;
+  name: string;
+  isPlayer: boolean;
+  archetype: LordArchetype;
+  actionPoints: number; // Plafond 40 PA
+  gold: number;
+  suzerainId: string | null;
+  vassals: string[];
+  heraldry: LordHeraldry;
+}
+
+export interface MarketCommodity {
+  resource: ResourceType;
+  basePrice: number;
+  currentPrice: number;
+  priceHistory: number[];
+  monthlySupply: number;
+  monthlyDemand: number;
+}
+
+export interface BattleReport {
+  attackerId: string;
+  defenderId: string;
+  provinceId: string;
+  initialAttacker: Regiment[];
+  initialDefender: Regiment[];
+  finalAttacker: Regiment[];
+  finalDefender: Regiment[];
+  winnerId: string | null;
+  lootedResources: Resources;
+  rounds?: number;
+  log?: string[];
+}
+
+export interface Rumor {
+  id: string;
+  authorId: string;
+  authorName?: string;
+  text: string;
+  month: number;
+  season: Season;
+}
+
+export interface Message {
+  id: string;
+  fromLordId: string;
+  toLordId: string;
+  content: string;
+  month: number;
+  read: boolean;
+}
+
+export type DiplomaticTreaty = 'non_aggression' | 'defensive_alliance' | 'war' | 'vassalage';
+
+export interface DiplomacyRelation {
+  lordA: string;
+  lordB: string;
+  treaty: DiplomaticTreaty;
+  tributeRate?: number;
+}
+
+export type SpyMissionType = 'infiltrate' | 'scout_army' | 'sabotage' | 'assassinate';
+
+export interface SpyMission {
+  id: string;
+  lordId: string;
+  targetProvinceId: string;
+  missionType: SpyMissionType;
+}
+
+export interface SpyResult {
+  success: boolean;
+  captured: boolean;
+  details: string;
+  intel?: unknown;
+}
+
+export interface TradeResult {
+  success: boolean;
+  lordId: string;
+  resource: ResourceType;
+  amount: number;
+  isBuy: boolean;
+  totalCost: number;
+  newPrice: number;
+  message: string;
+}
+
+export type Result<T> =
+  | { ok: true; value: T }
+  | { ok: false; error: string };
+
+export interface GameState {
+  month: number;
+  season: Season;
+  lords: Record<string, Lord>;
+  provinces: Record<string, Province>;
+  armies: Record<string, Army>;
+  market: Record<ResourceType, MarketCommodity>;
+  rumors: Rumor[];
+  messages: Message[];
+  playerLordId: string;
+}
