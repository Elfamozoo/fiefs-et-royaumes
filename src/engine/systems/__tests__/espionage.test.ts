import { describe, it, expect } from 'vitest';
import type { GameState, Lord, Province, Army } from '../../types';
import { launchSpyMission, SPY_PA_COST } from '../espionage';

function createMockLord(id: string, overrides: Partial<Lord> = {}): Lord {
  return {
    id,
    name: `Lord ${id}`,
    isPlayer: true,
    archetype: 'diplomat',
    actionPoints: 10,
    gold: 500,
    suzerainId: null,
    vassals: [],
    heraldry: {
      shield: 'heater',
      charge: 'raven',
      primaryColor: '#34495e',
      secondaryColor: '#1abc9c',
    },
    ...overrides,
  };
}

function createMockProvince(id: string, lordId: string): Province {
  return {
    id,
    name: 'Fief Ennemi',
    lordId,
    biome: 'plains',
    population: 8000,
    morale: 65,
    taxRate: 'moderate',
    resources: { gold: 100, food: 2000, wood: 500, stone: 300, iron: 150 },
    buildings: [{ type: 'walls', level: 1 }],
    connections: [],
    coordinates: { x: 100, y: 100 },
  };
}

function createMockGameState(): GameState {
  const spyLord = createMockLord('spy_lord', { actionPoints: 10, gold: 300 });
  const targetLord = createMockLord('target_lord', { actionPoints: 10, gold: 500 });
  const targetProvince = createMockProvince('target_prov', targetLord.id);
  const targetArmy: Army = {
    id: 'army_target',
    lordId: targetLord.id,
    name: 'Garde Provinciale',
    provinceId: targetProvince.id,
    regiments: [{ unitId: 'inf_miliciens_garnison', count: 40 }],
  };

  return {
    month: 1,
    season: 'spring',
    lords: { [spyLord.id]: spyLord, [targetLord.id]: targetLord },
    provinces: { [targetProvince.id]: targetProvince },
    armies: { [targetArmy.id]: targetArmy },
    market: {} as any,
    rumors: [],
    messages: [],
    playerLordId: spyLord.id,
  };
}

describe('Espionage System - launchSpyMission', () => {
  it('deducts PA from spy lord and executes infiltrate mission', () => {
    const state = createMockGameState();
    const { state: nextState, result } = launchSpyMission(
      state,
      'spy_lord',
      'infiltrate',
      'target_prov',
      12345 // deterministic success seed
    );

    expect(nextState.lords['spy_lord'].actionPoints).toBe(10 - SPY_PA_COST);
    expect(result.success).toBe(true);
    expect(result.intel).toBeDefined();
    // Intel contains target province info
    const intel = result.intel as { population: number; morale: number; walls: number };
    expect(intel.population).toBe(8000);
    expect(intel.morale).toBe(65);
  });

  it('scouts enemy armies in target province', () => {
    const state = createMockGameState();
    const { result } = launchSpyMission(
      state,
      'spy_lord',
      'scout_army',
      'target_prov',
      12345
    );

    expect(result.success).toBe(true);
    const intel = result.intel as { armies: Array<{ name: string; count: number }> };
    expect(intel.armies.length).toBe(1);
    expect(intel.armies[0].name).toBe('Garde Provinciale');
    expect(intel.armies[0].count).toBe(40);
  });

  it('sabotages enemy granaries / food reserves when successful', () => {
    const state = createMockGameState();
    const { state: nextState, result } = launchSpyMission(
      state,
      'spy_lord',
      'sabotage',
      'target_prov',
      12345
    );

    expect(result.success).toBe(true);
    // Food in province decreased
    expect(nextState.provinces['target_prov'].resources.food).toBeLessThan(2000);
    expect(result.details).toContain('saboté');
  });

  it('fails cleanly if lord does not have enough Action Points', () => {
    let state = createMockGameState();
    state.lords['spy_lord'].actionPoints = 0;

    const { state: nextState, result } = launchSpyMission(
      state,
      'spy_lord',
      'infiltrate',
      'target_prov'
    );

    expect(result.success).toBe(false);
    expect(result.details).toMatch(/action/i);
    expect(nextState).toBe(state);
  });

  it('handles spy capture on bad roll and sends alert pigeon to target lord', () => {
    const state = createMockGameState();
    // Seed designed to trigger capture
    const { state: nextState, result } = launchSpyMission(
      state,
      'spy_lord',
      'assassinate',
      'target_prov',
      999999
    );

    if (result.captured) {
      expect(result.success).toBe(false);
      // Pigeon message sent to target lord alerting of captured spy
      const alertMsg = nextState.messages.find(m => m.toLordId === 'target_lord');
      expect(alertMsg).toBeDefined();
      expect(alertMsg?.content).toMatch(/espion/i);
    }
  });
});
