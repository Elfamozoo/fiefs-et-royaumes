import { describe, it, expect } from 'vitest';
import type { GameState, Lord, Province, ResourceType } from '../../types';
import {
  INITIAL_MARKET,
  executeMarketTrade,
  updateMarketPrices,
} from '../market';

function createMockLord(overrides: Partial<Lord> = {}): Lord {
  return {
    id: 'lord_1',
    name: 'Lord Kald',
    isPlayer: true,
    archetype: 'merchant',
    actionPoints: 30,
    gold: 500,
    suzerainId: null,
    vassals: [],
    heraldry: {
      shield: 'heater',
      charge: 'purse',
      primaryColor: '#f1c40f',
      secondaryColor: '#2c3e50',
    },
    ...overrides,
  };
}

function createMockProvince(overrides: Partial<Province> = {}): Province {
  return {
    id: 'prov_1',
    name: 'Cité Marchande',
    lordId: 'lord_1',
    biome: 'coast',
    population: 8000,
    morale: 85,
    taxRate: 'moderate',
    resources: { gold: 100, food: 1000, wood: 200, stone: 100, iron: 50 },
    buildings: [],
    connections: [],
    coordinates: { x: 200, y: 200 },
    ...overrides,
  };
}

function createMockGameState(overrides: Partial<GameState> = {}): GameState {
  const defaultLord = createMockLord();
  const defaultProvince = createMockProvince();

  // Deep clone INITIAL_MARKET for clean tests
  const initialMarket = JSON.parse(JSON.stringify(INITIAL_MARKET));

  return {
    month: 1,
    season: 'spring',
    lords: { [defaultLord.id]: defaultLord },
    provinces: { [defaultProvince.id]: defaultProvince },
    armies: {},
    market: initialMarket,
    rumors: [],
    messages: [],
    playerLordId: defaultLord.id,
    ...overrides,
  };
}

describe('Market System - Constants & Initial Configuration', () => {
  it('defines correct base prices and initial state for all commodities', () => {
    expect(INITIAL_MARKET.gold.currentPrice).toBe(1.0);
    expect(INITIAL_MARKET.food.currentPrice).toBe(2.0);
    expect(INITIAL_MARKET.wood.currentPrice).toBe(3.0);
    expect(INITIAL_MARKET.stone.currentPrice).toBe(5.0);
    expect(INITIAL_MARKET.iron.currentPrice).toBe(10.0);

    const commodities: ResourceType[] = ['gold', 'food', 'wood', 'stone', 'iron'];
    for (const res of commodities) {
      expect(INITIAL_MARKET[res].monthlySupply).toBe(0);
      expect(INITIAL_MARKET[res].monthlyDemand).toBe(0);
      expect(INITIAL_MARKET[res].priceHistory.length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('Market System - executeMarketTrade', () => {
  it('buys resource: deducts gold from lord, adds resource to province, tracks demand', () => {
    const lord = createMockLord({ gold: 100 });
    const province = createMockProvince({
      resources: { gold: 0, food: 0, wood: 50, stone: 0, iron: 0 },
    });
    const state = createMockGameState({
      lords: { [lord.id]: lord },
      provinces: { [province.id]: province },
    });

    // Wood price is 3.0. Buying 20 wood costs 60 gold.
    const result = executeMarketTrade(state, lord.id, province.id, 'wood', 20, true);

    expect(result.success).toBe(true);
    expect(result.totalCost).toBe(60);
    expect(state.lords[lord.id].gold).toBe(40);
    expect(state.provinces[province.id].resources.wood).toBe(70);
    expect(state.market.wood.monthlyDemand).toBe(20);
    expect(state.market.wood.monthlySupply).toBe(0);
  });

  it('sells resource: deducts resource from province, adds gold to lord, tracks supply', () => {
    const lord = createMockLord({ gold: 100 });
    const province = createMockProvince({
      resources: { gold: 0, food: 0, wood: 0, stone: 0, iron: 50 },
    });
    const state = createMockGameState({
      lords: { [lord.id]: lord },
      provinces: { [province.id]: province },
    });

    // Iron price is 10.0. Selling 10 iron yields 100 gold.
    const result = executeMarketTrade(state, lord.id, province.id, 'iron', 10, false);

    expect(result.success).toBe(true);
    expect(result.totalCost).toBe(100);
    expect(state.lords[lord.id].gold).toBe(200);
    expect(state.provinces[province.id].resources.iron).toBe(40);
    expect(state.market.iron.monthlySupply).toBe(10);
    expect(state.market.iron.monthlyDemand).toBe(0);
  });

  it('fails when buyer lacks sufficient gold', () => {
    const lord = createMockLord({ gold: 20 });
    const province = createMockProvince({
      resources: { gold: 0, food: 0, wood: 0, stone: 0, iron: 0 },
    });
    const state = createMockGameState({
      lords: { [lord.id]: lord },
      provinces: { [province.id]: province },
    });

    // Iron price is 10.0. Buying 5 iron costs 50 gold. Lord only has 20.
    const result = executeMarketTrade(state, lord.id, province.id, 'iron', 5, true);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/insufficient gold/i);
    expect(state.lords[lord.id].gold).toBe(20);
    expect(state.provinces[province.id].resources.iron).toBe(0);
    expect(state.market.iron.monthlyDemand).toBe(0);
  });

  it('fails when seller lacks sufficient resource in province inventory', () => {
    const lord = createMockLord({ gold: 100 });
    const province = createMockProvince({
      resources: { gold: 0, food: 0, wood: 10, stone: 0, iron: 0 },
    });
    const state = createMockGameState({
      lords: { [lord.id]: lord },
      provinces: { [province.id]: province },
    });

    // Trying to sell 25 wood when province only has 10
    const result = executeMarketTrade(state, lord.id, province.id, 'wood', 25, false);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/insufficient resource/i);
    expect(state.lords[lord.id].gold).toBe(100);
    expect(state.provinces[province.id].resources.wood).toBe(10);
    expect(state.market.wood.monthlySupply).toBe(0);
  });

  it('refuses trading gold as a commodity', () => {
    const state = createMockGameState();
    const result = executeMarketTrade(state, 'lord_1', 'prov_1', 'gold', 10, true);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/gold/i);
  });

  it('refuses invalid non-positive trade amounts', () => {
    const state = createMockGameState();
    const resultZero = executeMarketTrade(state, 'lord_1', 'prov_1', 'food', 0, true);
    const resultNeg = executeMarketTrade(state, 'lord_1', 'prov_1', 'food', -10, true);

    expect(resultZero.success).toBe(false);
    expect(resultNeg.success).toBe(false);
  });

  it('fails cleanly when lord or province does not exist', () => {
    const state = createMockGameState();
    const resNoLord = executeMarketTrade(state, 'unknown_lord', 'prov_1', 'wood', 10, true);
    const resNoProv = executeMarketTrade(state, 'lord_1', 'unknown_prov', 'wood', 10, true);

    expect(resNoLord.success).toBe(false);
    expect(resNoProv.success).toBe(false);
  });
});

describe('Market System - updateMarketPrices & Elasticity', () => {
  it('increases price when demand exceeds supply', () => {
    const state = createMockGameState();
    // Iron current price is 10, liquidity is 1000.
    // Monthly demand = 500, supply = 0.
    // P_new = max(1, round(10 * (1 + (500 - 0) / 1000))) = round(10 * 1.5) = 15.
    state.market.iron.monthlyDemand = 500;
    state.market.iron.monthlySupply = 0;

    const nextState = updateMarketPrices(state);

    expect(nextState.market.iron.currentPrice).toBe(15);
    // Demand and supply reset to 0
    expect(nextState.market.iron.monthlyDemand).toBe(0);
    expect(nextState.market.iron.monthlySupply).toBe(0);
    // Old state unmodified
    expect(state.market.iron.currentPrice).toBe(10);
  });

  it('decreases price when supply exceeds demand', () => {
    const state = createMockGameState();
    // Iron current price is 10, liquidity is 1000.
    // Monthly demand = 0, supply = 500.
    // P_new = max(1, round(10 * (1 + (0 - 500) / 1000))) = round(10 * 0.5) = 5.
    state.market.iron.monthlyDemand = 0;
    state.market.iron.monthlySupply = 500;

    const nextState = updateMarketPrices(state);

    expect(nextState.market.iron.currentPrice).toBe(5);
    expect(nextState.market.iron.monthlySupply).toBe(0);
  });

  it('enforces a price floor of at least 1 even under massive market oversupply', () => {
    const state = createMockGameState();
    // Huge oversupply
    state.market.food.monthlyDemand = 0;
    state.market.food.monthlySupply = 50000;

    const nextState = updateMarketPrices(state);

    expect(nextState.market.food.currentPrice).toBe(1);
  });

  it('maintains price when supply equals demand', () => {
    const state = createMockGameState();
    state.market.wood.monthlyDemand = 300;
    state.market.wood.monthlySupply = 300;

    const nextState = updateMarketPrices(state);

    expect(nextState.market.wood.currentPrice).toBe(3.0);
  });

  it('updates priceHistory and caps at 24 entries', () => {
    let state = createMockGameState();

    // Run 30 consecutive price updates with varying demand
    for (let i = 0; i < 30; i++) {
      state.market.stone.monthlyDemand = 100;
      state = updateMarketPrices(state);
    }

    const history = state.market.stone.priceHistory;
    expect(history.length).toBe(24);
    // Last history entry matches currentPrice
    expect(history[history.length - 1]).toBe(state.market.stone.currentPrice);
  });
});
