import { describe, it, expect } from 'vitest';
import type { GameState, Lord, Province } from '../../types';
import { simulateAITurns } from '../ai';

function createTestState(): GameState {
  const conquerorLord: Lord = {
    id: 'lord_conqueror',
    name: 'Seigneur Vane',
    isPlayer: false,
    archetype: 'conqueror',
    actionPoints: 10,
    gold: 500,
    suzerainId: null,
    vassals: [],
    heraldry: { shield: 'heater', charge: 'sword', primaryColor: '#c0392b', secondaryColor: '#2c3e50' },
  };

  const merchantLord: Lord = {
    id: 'lord_merchant',
    name: 'Comte Aldous',
    isPlayer: false,
    archetype: 'merchant',
    actionPoints: 10,
    gold: 800,
    suzerainId: null,
    vassals: [],
    heraldry: { shield: 'heater', charge: 'scale', primaryColor: '#f39c12', secondaryColor: '#ffffff' },
  };

  const prov1: Province = {
    id: 'prov_conqueror',
    name: 'Fief du Roc',
    lordId: 'lord_conqueror',
    biome: 'mountains',
    population: 5000,
    morale: 60,
    taxRate: 'moderate',
    resources: { gold: 100, food: 1000, wood: 200, stone: 300, iron: 150 },
    buildings: [],
    connections: ['prov_merchant'],
    coordinates: { x: 50, y: 50 },
  };

  const prov2: Province = {
    id: 'prov_merchant',
    name: 'Fief du Port',
    lordId: 'lord_merchant',
    biome: 'coast',
    population: 6000,
    morale: 80,
    taxRate: 'moderate',
    resources: { gold: 200, food: 800, wood: 100, stone: 50, iron: 20 },
    buildings: [],
    connections: ['prov_conqueror'],
    coordinates: { x: 100, y: 100 },
  };

  return {
    month: 1,
    season: 'spring',
    lords: { lord_conqueror: conquerorLord, lord_merchant: merchantLord },
    provinces: { prov_conqueror: prov1, prov_merchant: prov2 },
    armies: {},
    market: {
      gold: { resource: 'gold', basePrice: 1, currentPrice: 1, priceHistory: [1], monthlySupply: 0, monthlyDemand: 0 },
      food: { resource: 'food', basePrice: 2, currentPrice: 2, priceHistory: [2], monthlySupply: 0, monthlyDemand: 0 },
      wood: { resource: 'wood', basePrice: 3, currentPrice: 3, priceHistory: [3], monthlySupply: 0, monthlyDemand: 0 },
      stone: { resource: 'stone', basePrice: 5, currentPrice: 5, priceHistory: [5], monthlySupply: 0, monthlyDemand: 0 },
      iron: { resource: 'iron', basePrice: 10, currentPrice: 10, priceHistory: [10], monthlySupply: 0, monthlyDemand: 0 },
    },
    rumors: [],
    messages: [],
    playerLordId: 'player_dummy',
  };
}

describe('AI Lords System - simulateAITurns', () => {
  it('does not touch player lord action points or resources', () => {
    const state = createTestState();
    const playerLord: Lord = {
      id: 'player_lord',
      name: 'Joueur',
      isPlayer: true,
      archetype: 'conqueror',
      actionPoints: 20,
      gold: 1000,
      suzerainId: null,
      vassals: [],
      heraldry: { shield: 'heater', charge: 'lion', primaryColor: '#27ae60', secondaryColor: '#ecf0f1' },
    };
    state.lords['player_lord'] = playerLord;

    const nextState = simulateAITurns(state);

    expect(nextState.lords['player_lord'].actionPoints).toBe(20);
    expect(nextState.lords['player_lord'].gold).toBe(1000);
  });

  it('allows conqueror AI to recruit troops when resources and PA are available', () => {
    const state = createTestState();
    const nextState = simulateAITurns(state);

    const conquerorArmies = Object.values(nextState.armies).filter(
      a => a.lordId === 'lord_conqueror'
    );
    expect(conquerorArmies.length).toBeGreaterThan(0);
  });

  it('allows merchant AI to interact with the market', () => {
    const state = createTestState();
    const nextState = simulateAITurns(state);

    // Merchant should have generated some supply or demand
    const hasMarketActivity = Object.values(nextState.market).some(
      c => c.monthlyDemand > 0 || c.monthlySupply > 0
    );
    expect(hasMarketActivity).toBe(true);
  });
});
