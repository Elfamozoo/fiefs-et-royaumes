import { describe, it, expect } from 'vitest';
import {
  UNIT_CATALOGUE,
  UNIT_MAP,
  INITIAL_PROVINCES,
  PROVINCES_MAP,
  ENGINE_VERSION,
  type UnitFamily,
  type Biome,
  type TaxRate,
  type Season,
  type ResourceType,
  type GameState,
} from '@engine/index';

describe('Task 2: Core Domain Data & Catalogue', () => {
  describe('Core Types & Engine Entry', () => {
    it('exports valid engine version and domain enum sets', () => {
      expect(ENGINE_VERSION).toBe('0.1.0');

      const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
      expect(seasons).toHaveLength(4);

      const resources: ResourceType[] = ['gold', 'food', 'wood', 'stone', 'iron'];
      expect(resources).toHaveLength(5);

      // Verify GameState interface structure typing
      const dummyState: Partial<GameState> = {
        month: 1,
        season: 'spring',
        playerLordId: 'lord_player',
      };
      expect(dummyState.month).toBe(1);
      expect(dummyState.season).toBe('spring');
    });
  });

  describe('Unit Catalogue (100+ Units across 5 Families)', () => {
    it('contains at least 100 unique unit definitions', () => {
      expect(UNIT_CATALOGUE).toBeDefined();
      expect(Array.isArray(UNIT_CATALOGUE)).toBe(true);
      expect(UNIT_CATALOGUE.length).toBeGreaterThanOrEqual(100);

      // Verify no duplicate IDs
      const ids = UNIT_CATALOGUE.map((u) => u.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(UNIT_CATALOGUE.length);
    });

    it('covers all five required military families', () => {
      const families: UnitFamily[] = ['infantry', 'ranged', 'cavalry', 'exotic', 'siege'];
      const presentFamilies = new Set(UNIT_CATALOGUE.map((u) => u.family));

      for (const fam of families) {
        expect(presentFamilies.has(fam)).toBe(true);
        const count = UNIT_CATALOGUE.filter((u) => u.family === fam).length;
        // Each family should have substantial representation
        expect(count).toBeGreaterThanOrEqual(8);
      }
    });

    it('validates stats, costs, upkeeps, and tier for every single unit', () => {
      const validFamilies: UnitFamily[] = ['infantry', 'ranged', 'cavalry', 'exotic', 'siege'];

      for (const unit of UNIT_CATALOGUE) {
        // Identity & lore
        expect(unit.id, `Unit ID should be non-empty string`).toBeTruthy();
        expect(unit.name, `Unit ${unit.id} name should be non-empty`).toBeTruthy();
        expect(unit.description, `Unit ${unit.id} description should be non-empty`).toBeTruthy();
        expect(validFamilies).toContain(unit.family);

        // Combat attributes
        expect(unit.attack).toBeGreaterThan(0);
        expect(unit.defense).toBeGreaterThan(0);
        expect(unit.rangedAttack).toBeGreaterThanOrEqual(0);
        expect(unit.armor).toBeGreaterThanOrEqual(0);
        expect(unit.speed).toBeGreaterThan(0);
        expect(unit.morale).toBeGreaterThanOrEqual(10);
        expect(unit.morale).toBeLessThanOrEqual(100);

        // Tier
        expect(unit.tier).toBeGreaterThanOrEqual(1);
        expect(unit.tier).toBeLessThanOrEqual(4);

        // Economic costs
        expect(unit.cost).toBeDefined();
        expect(unit.cost.gold).toBeGreaterThan(0);
        if (unit.cost.food !== undefined) expect(unit.cost.food).toBeGreaterThanOrEqual(0);
        if (unit.cost.wood !== undefined) expect(unit.cost.wood).toBeGreaterThanOrEqual(0);
        if (unit.cost.stone !== undefined) expect(unit.cost.stone).toBeGreaterThanOrEqual(0);
        if (unit.cost.iron !== undefined) expect(unit.cost.iron).toBeGreaterThanOrEqual(0);

        // Upkeep
        expect(unit.upkeep).toBeDefined();
        expect(unit.upkeep.gold).toBeGreaterThanOrEqual(0);
        expect(unit.upkeep.food).toBeGreaterThanOrEqual(0);

        // Ranged attacks must belong to ranged or siege or specialized units
        if (unit.family === 'ranged') {
          expect(unit.rangedAttack).toBeGreaterThan(0);
        }
      }
    });

    it('provides quick O(1) dictionary access via UNIT_MAP', () => {
      expect(UNIT_MAP).toBeDefined();
      expect(Object.keys(UNIT_MAP).length).toBe(UNIT_CATALOGUE.length);
      for (const unit of UNIT_CATALOGUE) {
        expect(UNIT_MAP[unit.id]).toBe(unit);
      }
    });

    it('includes authentic historical and Kald exotic units from the spec', () => {
      const names = UNIT_CATALOGUE.map((u) => u.name.toLowerCase());
      const hasUnitMatching = (sub: string) => names.some((n) => n.includes(sub.toLowerCase()));

      // Infantry
      expect(hasUnitMatching('piquier') || hasUnitMatching('pique')).toBe(true);
      expect(hasUnitMatching('hallebardier') || hasUnitMatching('hallebarde')).toBe(true);
      expect(hasUnitMatching("hommes d'armes")).toBe(true);

      // Ranged
      expect(hasUnitMatching('archers longs') || hasUnitMatching('archer')).toBe(true);
      expect(hasUnitMatching('arbalétrier') || hasUnitMatching('arbaletrier')).toBe(true);

      // Cavalry
      expect(hasUnitMatching('chevalier')).toBe(true);
      expect(hasUnitMatching('hussard') || hasUnitMatching('cataphracte') || hasUnitMatching('écuyer')).toBe(true);

      // Exotic Kald units
      expect(hasUnitMatching('samouraï') || hasUnitMatching('samourai') || hasUnitMatching('ronin')).toBe(true);
      expect(hasUnitMatching('berserker') || hasUnitMatching('prétorien') || hasUnitMatching('janissaire')).toBe(true);

      // Siege
      expect(hasUnitMatching('trébuchet') || hasUnitMatching('trebuchet')).toBe(true);
      expect(hasUnitMatching('catapulte') || hasUnitMatching('bélier') || hasUnitMatching('belier')).toBe(true);
    });
  });

  describe('Terres de Kald Provinces Map', () => {
    it('defines at least 15 interconnected provinces', () => {
      expect(INITIAL_PROVINCES).toBeDefined();
      expect(Array.isArray(INITIAL_PROVINCES)).toBe(true);
      expect(INITIAL_PROVINCES.length).toBeGreaterThanOrEqual(15);

      const ids = INITIAL_PROVINCES.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(INITIAL_PROVINCES.length);
    });

    it('provides PROVINCES_MAP dictionary lookup', () => {
      expect(PROVINCES_MAP).toBeDefined();
      expect(Object.keys(PROVINCES_MAP).length).toBe(INITIAL_PROVINCES.length);
      for (const prov of INITIAL_PROVINCES) {
        expect(PROVINCES_MAP[prov.id]).toBe(prov);
      }
    });

    it('validates province attributes, biomes, resources, and coordinates', () => {
      const validBiomes: Biome[] = ['plains', 'forest', 'hills', 'mountains', 'marsh', 'coast', 'desert'];
      const validTaxRates: TaxRate[] = ['low', 'moderate', 'high', 'extortion'];

      for (const prov of INITIAL_PROVINCES) {
        expect(prov.id).toBeTruthy();
        expect(prov.name).toBeTruthy();
        expect(validBiomes).toContain(prov.biome);
        expect(validTaxRates).toContain(prov.taxRate);

        expect(prov.population).toBeGreaterThanOrEqual(100);
        expect(prov.morale).toBeGreaterThanOrEqual(0);
        expect(prov.morale).toBeLessThanOrEqual(100);

        // Coordinates
        expect(prov.coordinates).toBeDefined();
        expect(typeof prov.coordinates.x).toBe('number');
        expect(typeof prov.coordinates.y).toBe('number');

        // Resources stockpiles
        expect(prov.resources).toBeDefined();
        expect(prov.resources.gold).toBeGreaterThanOrEqual(0);
        expect(prov.resources.food).toBeGreaterThanOrEqual(0);
        expect(prov.resources.wood).toBeGreaterThanOrEqual(0);
        expect(prov.resources.stone).toBeGreaterThanOrEqual(0);
        expect(prov.resources.iron).toBeGreaterThanOrEqual(0);

        // Connections exist
        expect(Array.isArray(prov.connections)).toBe(true);
        expect(prov.connections.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('ensures bidirectional connections between adjacent provinces', () => {
      for (const prov of INITIAL_PROVINCES) {
        for (const neighborId of prov.connections) {
          const neighbor = PROVINCES_MAP[neighborId];
          expect(neighbor, `Province ${prov.id} connects to non-existent neighbor ${neighborId}`).toBeDefined();
          expect(
            neighbor.connections,
            `Connection between ${prov.id} and ${neighborId} must be bidirectional`
          ).toContain(prov.id);
        }
      }
    });

    it('ensures the entire province map forms a single connected graph', () => {
      // Breadth-First Search to verify all provinces can be reached from province 0
      const visited = new Set<string>();
      const queue: string[] = [INITIAL_PROVINCES[0].id];
      visited.add(INITIAL_PROVINCES[0].id);

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        const current = PROVINCES_MAP[currentId];
        for (const neighborId of current.connections) {
          if (!visited.has(neighborId)) {
            visited.add(neighborId);
            queue.push(neighborId);
          }
        }
      }

      expect(visited.size).toBe(INITIAL_PROVINCES.length);
    });
  });
});
