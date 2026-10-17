import { describe, it, expect } from 'vitest';
import {
  advanceMonth,
  getSeasonForMonth,
  getSeasonalModifiers,
  MAX_ACTION_POINTS,
  MONTHLY_PA_GAIN,
  SEASONAL_MODIFIERS,
  type SeasonalModifiers,
} from '../time';
import type { GameState, Lord, Season } from '../../types';

function createMockLord(id: string, actionPoints: number, isPlayer: boolean = false): Lord {
  return {
    id,
    name: `Lord ${id}`,
    isPlayer,
    archetype: 'conqueror',
    actionPoints,
    gold: 1000,
    suzerainId: null,
    vassals: [],
    heraldry: {
      shield: 'heater',
      charge: 'lion',
      primaryColor: '#c0392b',
      secondaryColor: '#f1c40f',
    },
  };
}

function createMockGameState(overrides?: Partial<GameState>): GameState {
  return {
    month: 1,
    season: 'spring',
    lords: {
      lord_player: createMockLord('lord_player', 10, true),
      lord_ai_1: createMockLord('lord_ai_1', 20, false),
    },
    provinces: {},
    armies: {},
    market: {} as any,
    rumors: [],
    messages: [],
    playerLordId: 'lord_player',
    ...overrides,
  };
}

describe('Time & Seasons System', () => {
  describe('Constants', () => {
    it('defines MAX_ACTION_POINTS as 40 and MONTHLY_PA_GAIN as 10', () => {
      expect(MAX_ACTION_POINTS).toBe(40);
      expect(MONTHLY_PA_GAIN).toBe(10);
    });

    it('is properly re-exported from @engine/index', async () => {
      const engineIndex = await import('../../index');
      expect(engineIndex.advanceMonth).toBe(advanceMonth);
      expect(engineIndex.getSeasonForMonth).toBe(getSeasonForMonth);
      expect(engineIndex.getSeasonalModifiers).toBe(getSeasonalModifiers);
      expect(engineIndex.MAX_ACTION_POINTS).toBe(40);
      expect(engineIndex.MONTHLY_PA_GAIN).toBe(10);
      expect(engineIndex.SEASONAL_MODIFIERS).toBe(SEASONAL_MODIFIERS);
    });
  });

  describe('getSeasonForMonth', () => {
    it('correctly maps months 1-12 to the 4 seasons', () => {
      expect(getSeasonForMonth(1)).toBe('spring');
      expect(getSeasonForMonth(2)).toBe('spring');
      expect(getSeasonForMonth(3)).toBe('spring');

      expect(getSeasonForMonth(4)).toBe('summer');
      expect(getSeasonForMonth(5)).toBe('summer');
      expect(getSeasonForMonth(6)).toBe('summer');

      expect(getSeasonForMonth(7)).toBe('autumn');
      expect(getSeasonForMonth(8)).toBe('autumn');
      expect(getSeasonForMonth(9)).toBe('autumn');

      expect(getSeasonForMonth(10)).toBe('winter');
      expect(getSeasonForMonth(11)).toBe('winter');
      expect(getSeasonForMonth(12)).toBe('winter');
    });

    it('cycles continuously across multiple years', () => {
      // Year 2
      expect(getSeasonForMonth(13)).toBe('spring');
      expect(getSeasonForMonth(14)).toBe('spring');
      expect(getSeasonForMonth(15)).toBe('spring');
      expect(getSeasonForMonth(16)).toBe('summer');
      expect(getSeasonForMonth(19)).toBe('autumn');
      expect(getSeasonForMonth(22)).toBe('winter');
      expect(getSeasonForMonth(24)).toBe('winter');

      // Year 3 & beyond
      expect(getSeasonForMonth(25)).toBe('spring');
      expect(getSeasonForMonth(36)).toBe('winter');
      expect(getSeasonForMonth(48)).toBe('winter');
      expect(getSeasonForMonth(49)).toBe('spring');
    });

    it('handles a 48-month simulation loop with consistent 3-month season windows', () => {
      const expectedCycle: Season[] = [
        'spring', 'spring', 'spring',
        'summer', 'summer', 'summer',
        'autumn', 'autumn', 'autumn',
        'winter', 'winter', 'winter',
      ];

      for (let month = 1; month <= 48; month++) {
        const expectedSeason = expectedCycle[(month - 1) % 12];
        expect(getSeasonForMonth(month)).toBe(expectedSeason);
      }
    });
  });

  describe('Seasonal Modifiers', () => {
    it('provides correct seasonal economic and travel modifiers for all four seasons', () => {
      const springMods: SeasonalModifiers = getSeasonalModifiers('spring');
      expect(springMods.harvestMultiplier).toBe(1.0);
      expect(springMods.foodConsumptionMultiplier).toBe(1.0);
      expect(springMods.travelCostPenalty).toBe(0);

      const summerMods = getSeasonalModifiers('summer');
      expect(summerMods.harvestMultiplier).toBe(1.2);
      expect(summerMods.foodConsumptionMultiplier).toBe(1.0);
      expect(summerMods.travelCostPenalty).toBe(0);

      const autumnMods = getSeasonalModifiers('autumn');
      expect(autumnMods.harvestMultiplier).toBe(1.5);
      expect(autumnMods.foodConsumptionMultiplier).toBe(1.0);
      expect(autumnMods.travelCostPenalty).toBe(0);

      const winterMods = getSeasonalModifiers('winter');
      expect(winterMods.harvestMultiplier).toBe(0.6);
      expect(winterMods.foodConsumptionMultiplier).toBe(1.3);
      expect(winterMods.travelCostPenalty).toBe(1);
    });

    it('exposes SEASONAL_MODIFIERS catalogue with all 4 seasons', () => {
      const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
      for (const season of seasons) {
        expect(SEASONAL_MODIFIERS[season]).toBeDefined();
        expect(getSeasonalModifiers(season)).toEqual(SEASONAL_MODIFIERS[season]);
      }
    });
  });

  describe('advanceMonth', () => {
    it('increments month by 1 and updates season appropriately', () => {
      const state1 = createMockGameState({ month: 1, season: 'spring' });
      const state2 = advanceMonth(state1);

      expect(state2.month).toBe(2);
      expect(state2.season).toBe('spring');

      const state3 = advanceMonth(state2);
      expect(state3.month).toBe(3);
      expect(state3.season).toBe('spring');

      // Month 3 -> 4 transitions from spring to summer
      const state4 = advanceMonth(state3);
      expect(state4.month).toBe(4);
      expect(state4.season).toBe('summer');
    });

    it('cycles from winter to spring across year boundaries (month 12 to 13)', () => {
      const state12 = createMockGameState({ month: 12, season: 'winter' });
      const state13 = advanceMonth(state12);

      expect(state13.month).toBe(13);
      expect(state13.season).toBe('spring');
    });

    it('regenerates +10 PA for all lords up to the 40 PA cap', () => {
      const state = createMockGameState({
        lords: {
          lord_0: createMockLord('lord_0', 0),
          lord_10: createMockLord('lord_10', 10),
          lord_25: createMockLord('lord_25', 25),
          lord_35: createMockLord('lord_35', 35),
          lord_40: createMockLord('lord_40', 40),
        },
      });

      const nextState = advanceMonth(state);

      expect(nextState.lords.lord_0.actionPoints).toBe(10);
      expect(nextState.lords.lord_10.actionPoints).toBe(20);
      expect(nextState.lords.lord_25.actionPoints).toBe(35);
      // Strictly capped at 40 (35 + 10 = 45 -> 40)
      expect(nextState.lords.lord_35.actionPoints).toBe(40);
      // Stays capped at 40
      expect(nextState.lords.lord_40.actionPoints).toBe(40);
    });

    it('preserves all other lord properties without corruption', () => {
      const state = createMockGameState({
        lords: {
          player: {
            ...createMockLord('player', 15, true),
            gold: 4500,
            suzerainId: 'king_1',
            vassals: ['baron_2'],
          },
        },
      });

      const nextState = advanceMonth(state);
      const playerAfter = nextState.lords.player;

      expect(playerAfter.actionPoints).toBe(25);
      expect(playerAfter.id).toBe('player');
      expect(playerAfter.isPlayer).toBe(true);
      expect(playerAfter.gold).toBe(4500);
      expect(playerAfter.suzerainId).toBe('king_1');
      expect(playerAfter.vassals).toEqual(['baron_2']);
      expect(playerAfter.heraldry).toEqual(state.lords.player.heraldry);
    });

    it('preserves non-lord slices of GameState', () => {
      const initialRumors = [{ id: 'r1', authorId: 'lord_1', text: 'Peace has ended', month: 1, season: 'spring' as const }];
      const initialMessages = [{ id: 'm1', fromLordId: 'lord_1', toLordId: 'player', content: 'Hail', month: 1, read: false }];

      const state = createMockGameState({
        rumors: initialRumors,
        messages: initialMessages,
        playerLordId: 'player_id_custom',
      });

      const nextState = advanceMonth(state);

      expect(nextState.rumors).toBe(state.rumors);
      expect(nextState.messages).toBe(state.messages);
      expect(nextState.playerLordId).toBe('player_id_custom');
      expect(nextState.provinces).toBe(state.provinces);
      expect(nextState.armies).toBe(state.armies);
      expect(nextState.market).toBe(state.market);
    });

    it('enforces 100% pure immutability on input state', () => {
      const lord1 = createMockLord('lord_1', 15);
      const lord2 = createMockLord('lord_2', 38);

      const state = createMockGameState({
        month: 1,
        season: 'spring',
        lords: {
          lord_1: lord1,
          lord_2: lord2,
        },
      });

      // Deeply freeze objects to guarantee no mutation can occur
      Object.freeze(state);
      Object.freeze(state.lords);
      Object.freeze(lord1);
      Object.freeze(lord2);

      let nextState!: GameState;
      expect(() => {
        nextState = advanceMonth(state);
      }).not.toThrow();

      // Original state reference check
      expect(state.month).toBe(1);
      expect(state.season).toBe('spring');
      expect(state.lords.lord_1.actionPoints).toBe(15);
      expect(state.lords.lord_2.actionPoints).toBe(38);

      // New state reference checks
      expect(nextState).not.toBe(state);
      expect(nextState.lords).not.toBe(state.lords);
      expect(nextState.lords.lord_1).not.toBe(lord1);
      expect(nextState.lords.lord_2).not.toBe(lord2);

      // New values check
      expect(nextState.month).toBe(2);
      expect(nextState.season).toBe('spring');
      expect(nextState.lords.lord_1.actionPoints).toBe(25);
      expect(nextState.lords.lord_2.actionPoints).toBe(40);
    });
  });
});
