import { describe, it, expect } from 'vitest';
import type { GameState, Lord, Province } from '../../types';
import {
  processEconomy,
  setProvinceTaxRate,
  BIOME_BASE_YIELDS,
  TAX_RATES_CONFIG,
} from '../economy';

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
    resources: { gold: 200, food: 2000, wood: 500, stone: 300, iron: 150 },
    buildings: [],
    connections: [],
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

describe('Economy System - Taxation', () => {
  it('collects 5% gold and increases morale by +5 for low tax rate', () => {
    const province = createMockProvince({ population: 10000, morale: 50, taxRate: 'low' });
    const lord = createMockLord({ gold: 100 });
    const state = createMockGameState({
      provinces: { [province.id]: province },
      lords: { [lord.id]: lord },
    });

    const nextState = processEconomy(state);

    // 5% of 10,000 = 500 gold
    expect(nextState.lords[lord.id].gold).toBe(100 + 500);
    // Morale increases by +5
    expect(nextState.provinces[province.id].morale).toBe(55);
  });

  it('collects 15% gold and keeps morale unchanged for moderate tax rate', () => {
    const province = createMockProvince({ population: 10000, morale: 50, taxRate: 'moderate' });
    const lord = createMockLord({ gold: 100 });
    const state = createMockGameState({
      provinces: { [province.id]: province },
      lords: { [lord.id]: lord },
    });

    const nextState = processEconomy(state);

    // 15% of 10,000 = 1500 gold
    expect(nextState.lords[lord.id].gold).toBe(100 + 1500);
    // Morale +0
    expect(nextState.provinces[province.id].morale).toBe(50);
  });

  it('collects 25% gold and decreases morale by -5 for high tax rate', () => {
    const province = createMockProvince({ population: 10000, morale: 50, taxRate: 'high' });
    const lord = createMockLord({ gold: 100 });
    const state = createMockGameState({
      provinces: { [province.id]: province },
      lords: { [lord.id]: lord },
    });

    const nextState = processEconomy(state);

    // 25% of 10,000 = 2500 gold
    expect(nextState.lords[lord.id].gold).toBe(100 + 2500);
    // Morale -5
    expect(nextState.provinces[province.id].morale).toBe(45);
  });

  it('collects 40% gold and decreases morale by -15 for extortion tax rate', () => {
    const province = createMockProvince({ population: 10000, morale: 50, taxRate: 'extortion' });
    const lord = createMockLord({ gold: 100 });
    const state = createMockGameState({
      provinces: { [province.id]: province },
      lords: { [lord.id]: lord },
    });

    const nextState = processEconomy(state);

    // 40% of 10,000 = 4000 gold
    expect(nextState.lords[lord.id].gold).toBe(100 + 4000);
    // Morale -15
    expect(nextState.provinces[province.id].morale).toBe(35);
  });

  it('clamps morale strictly between 0 and 100', () => {
    const provHigh = createMockProvince({ id: 'p_high', morale: 98, taxRate: 'low' });
    const provLow = createMockProvince({ id: 'p_low', morale: 10, taxRate: 'extortion' });
    const lord = createMockLord();
    const state = createMockGameState({
      provinces: { [provHigh.id]: provHigh, [provLow.id]: provLow },
      lords: { [lord.id]: lord },
    });

    const nextState = processEconomy(state);

    expect(nextState.provinces['p_high'].morale).toBe(100);
    expect(nextState.provinces['p_low'].morale).toBe(0);
  });

  it('accumulates taxes across multiple provinces owned by the same lord', () => {
    const p1 = createMockProvince({ id: 'p1', population: 4000, taxRate: 'moderate' }); // 600 gold
    const p2 = createMockProvince({ id: 'p2', population: 6000, taxRate: 'high' });     // 1500 gold
    const lord = createMockLord({ gold: 500 });
    const state = createMockGameState({
      provinces: { p1, p2 },
      lords: { [lord.id]: lord },
    });

    const nextState = processEconomy(state);

    expect(nextState.lords[lord.id].gold).toBe(500 + 600 + 1500);
  });

  it('does not crash or add gold when province has null lordId', () => {
    const p1 = createMockProvince({ id: 'p1', lordId: null, population: 5000, taxRate: 'moderate' });
    const lord = createMockLord({ gold: 200 });
    const state = createMockGameState({
      provinces: { p1 },
      lords: { [lord.id]: lord },
    });

    const nextState = processEconomy(state);

    expect(nextState.lords[lord.id].gold).toBe(200);
    expect(nextState.provinces['p1'].population).toBeGreaterThan(0);
  });
});

describe('Economy System - Food Consumption, Growth & Famine', () => {
  it('consumes 1 food per 10 citizens in normal season (spring)', () => {
    // 10,000 citizens -> 1000 food needed
    // starting food 2000, biome plains yields 200 food in spring
    // net food: 2000 - 1000 + 200 = 1200
    const province = createMockProvince({
      population: 10000,
      morale: 50, // < 70, no pop growth
      resources: { gold: 0, food: 2000, wood: 0, stone: 0, iron: 0 },
    });
    const state = createMockGameState({
      season: 'spring',
      provinces: { [province.id]: province },
    });

    const nextState = processEconomy(state);

    expect(nextState.provinces[province.id].resources.food).toBe(1200);
    expect(nextState.provinces[province.id].population).toBe(10000);
  });

  it('increases food consumption by +30% in winter', () => {
    // 10,000 citizens -> 1000 * 1.3 = 1300 food needed
    // starting food 2000, biome plains yields 200 * 0.6 = 120 food in winter
    // net food: 2000 - 1300 + 120 = 820
    const province = createMockProvince({
      population: 10000,
      morale: 50,
      resources: { gold: 0, food: 2000, wood: 0, stone: 0, iron: 0 },
    });
    const state = createMockGameState({
      season: 'winter',
      provinces: { [province.id]: province },
    });

    const nextState = processEconomy(state);

    expect(nextState.provinces[province.id].resources.food).toBe(820);
  });

  it('triggers population growth when fed and morale >= 70', () => {
    // Morale 70 gives +1% growth; morale 100 gives +2%
    const p70 = createMockProvince({
      id: 'p70',
      population: 10000,
      morale: 70,
      taxRate: 'moderate', // delta 0
      resources: { gold: 0, food: 5000, wood: 0, stone: 0, iron: 0 },
    });
    const p100 = createMockProvince({
      id: 'p100',
      population: 10000,
      morale: 100,
      taxRate: 'moderate',
      resources: { gold: 0, food: 5000, wood: 0, stone: 0, iron: 0 },
    });
    const state = createMockGameState({
      provinces: { p70, p100 },
    });

    const nextState = processEconomy(state);

    // p70 grew by 1% (100 citizens)
    expect(nextState.provinces['p70'].population).toBe(10100);
    // p100 grew by 2% (200 citizens)
    expect(nextState.provinces['p100'].population).toBe(10200);
  });

  it('triggers famine when food is insufficient: consumes all food, loses 5% population, loses 20 morale', () => {
    // 10,000 population needs 1000 food. Only 200 food in granaries.
    // Famine triggers: all 200 consumed (0), pop drops 5% (10000 * 0.95 = 9500),
    // morale drops by 20 (from 60 to 40).
    // Plains then produces 200 food at harvest.
    const province = createMockProvince({
      population: 10000,
      morale: 60,
      taxRate: 'moderate', // morale delta 0
      resources: { gold: 0, food: 200, wood: 0, stone: 0, iron: 0 },
    });
    const state = createMockGameState({
      season: 'spring',
      provinces: { [province.id]: province },
    });

    const nextState = processEconomy(state);
    const resultProv = nextState.provinces[province.id];

    expect(resultProv.population).toBe(9500);
    expect(resultProv.morale).toBe(40);
    // Newly harvested food after famine consumed initial stock
    expect(resultProv.resources.food).toBe(200);
  });
});

describe('Economy System - Biome Yields & Seasonal Harvests', () => {
  it('applies autumn harvest bonus (1.5x) vs winter harvest penalty (0.6x)', () => {
    const pAutumn = createMockProvince({
      id: 'pAutumn',
      biome: 'plains', // base food: 200
      population: 0,   // zero consumption for pure harvest test
      resources: { gold: 0, food: 0, wood: 0, stone: 0, iron: 0 },
    });
    const pWinter = createMockProvince({
      id: 'pWinter',
      biome: 'plains',
      population: 0,
      resources: { gold: 0, food: 0, wood: 0, stone: 0, iron: 0 },
    });

    const autumnState = createMockGameState({
      season: 'autumn',
      provinces: { pAutumn },
    });
    const winterState = createMockGameState({
      season: 'winter',
      provinces: { pWinter },
    });

    const nextAutumn = processEconomy(autumnState);
    const nextWinter = processEconomy(winterState);

    // Autumn: 200 * 1.5 = 300
    expect(nextAutumn.provinces['pAutumn'].resources.food).toBe(300);
    // Winter: 200 * 0.6 = 120
    expect(nextWinter.provinces['pWinter'].resources.food).toBe(120);
  });

  it('produces distinct resources according to biome yields', () => {
    // forest: food 100, wood 250, stone 30, iron 10
    // mountains: food 40, wood 40, stone 250, iron 150
    const forestProv = createMockProvince({
      id: 'forest',
      biome: 'forest',
      population: 0,
      resources: { gold: 0, food: 0, wood: 0, stone: 0, iron: 0 },
    });
    const mountainProv = createMockProvince({
      id: 'mountains',
      biome: 'mountains',
      population: 0,
      resources: { gold: 0, food: 0, wood: 0, stone: 0, iron: 0 },
    });

    const state = createMockGameState({
      season: 'spring', // harvest multiplier 1.0
      provinces: { forest: forestProv, mountains: mountainProv },
    });

    const nextState = processEconomy(state);

    expect(nextState.provinces['forest'].resources).toEqual({
      gold: 0,
      food: 100,
      wood: 250,
      stone: 30,
      iron: 10,
    });

    expect(nextState.provinces['mountains'].resources).toEqual({
      gold: 0,
      food: 40,
      wood: 40,
      stone: 250,
      iron: 150,
    });
  });

  it('boosts food production with granary building', () => {
    // Plains base food: 200. Granary lvl 2 gives +20% -> 240
    const provWithGranary = createMockProvince({
      biome: 'plains',
      population: 0,
      buildings: [{ type: 'granary', level: 2 }],
      resources: { gold: 0, food: 0, wood: 0, stone: 0, iron: 0 },
    });
    const state = createMockGameState({
      season: 'spring',
      provinces: { [provWithGranary.id]: provWithGranary },
    });

    const nextState = processEconomy(state);

    expect(nextState.provinces[provWithGranary.id].resources.food).toBe(240);
  });
});

describe('Economy System - setProvinceTaxRate', () => {
  it('deducts 1 PA and updates tax rate when lord owns the province and has PA', () => {
    const lord = createMockLord({ actionPoints: 10 });
    const province = createMockProvince({ lordId: lord.id, taxRate: 'moderate' });
    const state = createMockGameState({
      lords: { [lord.id]: lord },
      provinces: { [province.id]: province },
    });

    const nextState = setProvinceTaxRate(state, lord.id, province.id, 'high');

    expect(nextState.lords[lord.id].actionPoints).toBe(9);
    expect(nextState.provinces[province.id].taxRate).toBe('high');
    // Ensure original state is untouched
    expect(state.lords[lord.id].actionPoints).toBe(10);
    expect(state.provinces[province.id].taxRate).toBe('moderate');
  });

  it('fails and returns state unchanged if lord has 0 PA', () => {
    const lord = createMockLord({ actionPoints: 0 });
    const province = createMockProvince({ lordId: lord.id, taxRate: 'moderate' });
    const state = createMockGameState({
      lords: { [lord.id]: lord },
      provinces: { [province.id]: province },
    });

    const nextState = setProvinceTaxRate(state, lord.id, province.id, 'high');

    expect(nextState).toBe(state);
    expect(nextState.provinces[province.id].taxRate).toBe('moderate');
  });

  it('fails and returns state unchanged if lord does not own the province', () => {
    const lord = createMockLord({ id: 'lord_1', actionPoints: 10 });
    const otherLord = createMockLord({ id: 'lord_2', actionPoints: 10 });
    const province = createMockProvince({ lordId: 'lord_2', taxRate: 'moderate' });
    const state = createMockGameState({
      lords: { lord_1: lord, lord_2: otherLord },
      provinces: { [province.id]: province },
    });

    const nextState = setProvinceTaxRate(state, 'lord_1', province.id, 'high');

    expect(nextState).toBe(state);
    expect(nextState.lords['lord_1'].actionPoints).toBe(10);
    expect(nextState.provinces[province.id].taxRate).toBe('moderate');
  });
});
