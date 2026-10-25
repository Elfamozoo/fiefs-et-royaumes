import { describe, it, expect } from 'vitest';
import type { GameState, Lord, Province, Army } from '../../types';
import {
  recruitRegiment,
  moveArmy,
  processArmyUpkeep,
  getTravelCost,
  RECRUIT_PA_COST,
  MOVE_PA_BASE_COST,
} from '../military';

function createMockLord(overrides: Partial<Lord> = {}): Lord {
  return {
    id: 'lord_1',
    name: 'Lord Kald',
    isPlayer: true,
    archetype: 'conqueror',
    actionPoints: 20,
    gold: 1000,
    suzerainId: null,
    vassals: [],
    heraldry: {
      shield: 'heater',
      charge: 'lion',
      primaryColor: '#c0392b',
      secondaryColor: '#f1c40f',
    },
    ...overrides,
  };
}

function createMockProvince(overrides: Partial<Province> = {}): Province {
  return {
    id: 'prov_1',
    name: 'Province Nord',
    lordId: 'lord_1',
    biome: 'plains',
    population: 10000,
    morale: 80,
    taxRate: 'moderate',
    resources: { gold: 200, food: 2000, wood: 500, stone: 300, iron: 250 },
    buildings: [],
    connections: ['prov_2'],
    coordinates: { x: 100, y: 100 },
    ...overrides,
  };
}

function createMockGameState(overrides: Partial<GameState> = {}): GameState {
  const defaultLord = createMockLord();
  const defaultProvince = createMockProvince();

  return {
    month: 1,
    season: 'spring',
    lords: { [defaultLord.id]: defaultLord },
    provinces: { [defaultProvince.id]: defaultProvince },
    armies: {},
    market: {} as any,
    rumors: [],
    messages: [],
    playerLordId: defaultLord.id,
    ...overrides,
  };
}

describe('Military System - Recruitment', () => {
  it('recruits a valid regiment when lord has PA, gold, and province has materials', () => {
    // inf_piquiers_flamands: cost: { gold: 45, wood: 15, iron: 5 }
    const state = createMockGameState();
    const result = recruitRegiment(state, 'lord_1', 'prov_1', 'inf_piquiers_flamands', 10);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const nextState = result.value;
    const lord = nextState.lords['lord_1'];
    const province = nextState.provinces['prov_1'];

    // PA deducted: 20 - 2 = 18
    expect(lord.actionPoints).toBe(20 - RECRUIT_PA_COST);
    // Gold deducted: 1000 - (45 * 10) = 550
    expect(lord.gold).toBe(550);
    // Wood deducted: 500 - (15 * 10) = 350
    expect(province.resources.wood).toBe(350);
    // Iron deducted: 250 - (5 * 10) = 200
    expect(province.resources.iron).toBe(200);

    // Army created
    const armies = Object.values(nextState.armies);
    expect(armies.length).toBe(1);
    expect(armies[0].lordId).toBe('lord_1');
    expect(armies[0].provinceId).toBe('prov_1');
    expect(armies[0].regiments).toEqual([{ unitId: 'inf_piquiers_flamands', count: 10 }]);
  });

  it('stacks units into an existing army in the same province', () => {
    const existingArmy: Army = {
      id: 'army_1',
      lordId: 'lord_1',
      name: 'Armée du Nord',
      provinceId: 'prov_1',
      regiments: [{ unitId: 'inf_piquiers_flamands', count: 5 }],
    };
    const state = createMockGameState({
      armies: { [existingArmy.id]: existingArmy },
    });

    const result = recruitRegiment(state, 'lord_1', 'prov_1', 'inf_piquiers_flamands', 10);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const nextArmies = Object.values(result.value.armies);
    expect(nextArmies.length).toBe(1);
    expect(nextArmies[0].regiments[0].count).toBe(15);
  });

  it('fails if lord does not have enough Action Points', () => {
    const lord = createMockLord({ actionPoints: 1 });
    const state = createMockGameState({ lords: { [lord.id]: lord } });

    const result = recruitRegiment(state, 'lord_1', 'prov_1', 'inf_piquiers_flamands', 10);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/action points/i);
    }
  });

  it('fails if lord does not have enough gold', () => {
    const lord = createMockLord({ gold: 10 });
    const state = createMockGameState({ lords: { [lord.id]: lord } });

    const result = recruitRegiment(state, 'lord_1', 'prov_1', 'inf_piquiers_flamands', 10);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/gold/i);
    }
  });

  it('fails if province does not have enough iron or wood', () => {
    const prov = createMockProvince({
      resources: { gold: 0, food: 1000, wood: 500, stone: 0, iron: 2 },
    });
    const state = createMockGameState({ provinces: { [prov.id]: prov } });

    // 10 pikemen requires 50 iron, province only has 2
    const result = recruitRegiment(state, 'lord_1', 'prov_1', 'inf_piquiers_flamands', 10);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/iron/i);
    }
  });

  it('fails if lord does not own the province', () => {
    const prov = createMockProvince({ lordId: 'other_lord' });
    const state = createMockGameState({ provinces: { [prov.id]: prov } });

    const result = recruitRegiment(state, 'lord_1', 'prov_1', 'inf_piquiers_flamands', 10);
    expect(result.ok).toBe(false);
  });
});

describe('Military System - Movement', () => {
  it('calculates travel cost based on terrain biomes', () => {
    expect(getTravelCost('plains')).toBe(MOVE_PA_BASE_COST);
    expect(getTravelCost('coast')).toBe(MOVE_PA_BASE_COST);
    expect(getTravelCost('mountains')).toBeGreaterThan(MOVE_PA_BASE_COST);
    expect(getTravelCost('marsh')).toBeGreaterThan(MOVE_PA_BASE_COST);
  });

  it('moves an army to an adjacent province and deducts PA from lord', () => {
    const p1 = createMockProvince({ id: 'p1', connections: ['p2'], biome: 'plains' });
    const p2 = createMockProvince({ id: 'p2', connections: ['p1'], biome: 'mountains' });
    const army: Army = {
      id: 'army_1',
      lordId: 'lord_1',
      name: 'Avant-garde',
      provinceId: 'p1',
      regiments: [{ unitId: 'inf_miliciens_garnison', count: 20 }],
    };
    const state = createMockGameState({
      provinces: { p1, p2 },
      armies: { [army.id]: army },
    });

    const expectedCost = getTravelCost('mountains');
    const result = moveArmy(state, 'army_1', 'p2');

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const nextState = result.value;
    expect(nextState.armies['army_1'].provinceId).toBe('p2');
    expect(nextState.lords['lord_1'].actionPoints).toBe(20 - expectedCost);
  });

  it('fails to move if target province is not connected', () => {
    const p1 = createMockProvince({ id: 'p1', connections: ['p2'] });
    const p2 = createMockProvince({ id: 'p2', connections: ['p1'] });
    const p3 = createMockProvince({ id: 'p3', connections: [] });
    const army: Army = {
      id: 'army_1',
      lordId: 'lord_1',
      name: 'Avant-garde',
      provinceId: 'p1',
      regiments: [{ unitId: 'inf_miliciens_garnison', count: 20 }],
    };
    const state = createMockGameState({
      provinces: { p1, p2, p3 },
      armies: { [army.id]: army },
    });

    const result = moveArmy(state, 'army_1', 'p3');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/adjacent/i);
    }
  });

  it('fails to move if lord lacks PA', () => {
    const p1 = createMockProvince({ id: 'p1', connections: ['p2'], biome: 'mountains' });
    const p2 = createMockProvince({ id: 'p2', connections: ['p1'], biome: 'mountains' });
    const lord = createMockLord({ actionPoints: 1 });
    const army: Army = {
      id: 'army_1',
      lordId: 'lord_1',
      name: 'Avant-garde',
      provinceId: 'p1',
      regiments: [{ unitId: 'inf_miliciens_garnison', count: 20 }],
    };
    const state = createMockGameState({
      lords: { [lord.id]: lord },
      provinces: { p1, p2 },
      armies: { [army.id]: army },
    });

    const result = moveArmy(state, 'army_1', 'p2');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/action points/i);
    }
  });
});

describe('Military System - Upkeep & Desertion', () => {
  it('deducts gold upkeep from the lord for all active regiments', () => {
    // inf_miliciens_garnison upkeep: 2 gold, 1 food
    const lord = createMockLord({ gold: 100 });
    const army: Army = {
      id: 'army_1',
      lordId: 'lord_1',
      name: 'Garde Royale',
      provinceId: 'prov_1',
      regiments: [{ unitId: 'inf_miliciens_garnison', count: 30 }],
    };
    const state = createMockGameState({
      lords: { [lord.id]: lord },
      armies: { [army.id]: army },
    });

    const nextState = processArmyUpkeep(state);

    // 30 militia * 2 gold upkeep = 60 gold deducted -> 100 - 60 = 40
    expect(nextState.lords['lord_1'].gold).toBe(40);
    expect(nextState.armies['army_1'].regiments[0].count).toBe(30);
  });

  it('penalizes army regiments with desertion if lord cannot pay gold upkeep', () => {
    const lord = createMockLord({ gold: 10 });
    const army: Army = {
      id: 'army_1',
      lordId: 'lord_1',
      name: 'Garde Royale',
      provinceId: 'prov_1',
      regiments: [{ unitId: 'inf_miliciens_garnison', count: 100 }], // needs 200 gold
    };
    const state = createMockGameState({
      lords: { [lord.id]: lord },
      armies: { [army.id]: army },
    });

    const nextState = processArmyUpkeep(state);

    // Lord gold drops to 0
    expect(nextState.lords['lord_1'].gold).toBe(0);
    // 5% desertion on 100 soldiers -> 95 soldiers remain
    expect(nextState.armies['army_1'].regiments[0].count).toBe(95);
  });
});
