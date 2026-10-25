import { describe, it, expect } from 'vitest';
import type { GameState, Lord } from '../../types';
import {
  swearFealty,
  releaseVassal,
  processVassalTributes,
  sendPigeonMessage,
  postPublicRumor,
} from '../diplomacy';

function createMockLord(id: string, name: string, overrides: Partial<Lord> = {}): Lord {
  return {
    id,
    name,
    isPlayer: id === 'player',
    archetype: 'diplomat',
    actionPoints: 20,
    gold: 500,
    suzerainId: null,
    vassals: [],
    heraldry: {
      shield: 'heater',
      charge: 'cross',
      primaryColor: '#2980b9',
      secondaryColor: '#ecf0f1',
    },
    ...overrides,
  };
}

function createMockGameState(): GameState {
  const suzerain = createMockLord('suzerain_1', 'Duc de Kald', { gold: 1000 });
  const vassal = createMockLord('vassal_1', 'Baron de la Vallée', { gold: 300 });

  return {
    month: 1,
    season: 'spring',
    lords: { [suzerain.id]: suzerain, [vassal.id]: vassal },
    provinces: {},
    armies: {},
    market: {} as any,
    rumors: [],
    messages: [],
    playerLordId: suzerain.id,
  };
}

describe('Diplomacy System - Vassalage & Fealty', () => {
  it('swears fealty: sets suzerainId on vassal and appends vassal to suzerain list', () => {
    const state = createMockGameState();
    const nextState = swearFealty(state, 'vassal_1', 'suzerain_1');

    expect(nextState.lords['vassal_1'].suzerainId).toBe('suzerain_1');
    expect(nextState.lords['suzerain_1'].vassals).toContain('vassal_1');
    // Original state untouched
    expect(state.lords['vassal_1'].suzerainId).toBeNull();
  });

  it('releases vassal: clears suzerainId and removes vassal from suzerain list', () => {
    let state = createMockGameState();
    state = swearFealty(state, 'vassal_1', 'suzerain_1');
    expect(state.lords['vassal_1'].suzerainId).toBe('suzerain_1');

    const nextState = releaseVassal(state, 'vassal_1');
    expect(nextState.lords['vassal_1'].suzerainId).toBeNull();
    expect(nextState.lords['suzerain_1'].vassals).not.toContain('vassal_1');
  });

  it('processes monthly vassal tributes (e.g. 10% of gold transferred to suzerain)', () => {
    let state = createMockGameState();
    state = swearFealty(state, 'vassal_1', 'suzerain_1');
    // Vassal has 300 gold, Suzerain has 1000 gold
    // Default tribute rate: 10% -> 30 gold
    const nextState = processVassalTributes(state, 0.10);

    expect(nextState.lords['vassal_1'].gold).toBe(270);
    expect(nextState.lords['suzerain_1'].gold).toBe(1030);
  });
});

describe('Diplomacy System - Pigeon Messages & Rumors', () => {
  it('sends a diplomatic pigeon message between lords', () => {
    const state = createMockGameState();
    const nextState = sendPigeonMessage(
      state,
      'vassal_1',
      'suzerain_1',
      'Monseigneur, les récoltes s’annoncent prospères.'
    );

    expect(nextState.messages.length).toBe(1);
    const msg = nextState.messages[0];
    expect(msg.fromLordId).toBe('vassal_1');
    expect(msg.toLordId).toBe('suzerain_1');
    expect(msg.content).toContain('récoltes');
    expect(msg.read).toBe(false);
  });

  it('posts a public rumor onto the kingdom rumor board', () => {
    const state = createMockGameState();
    const nextState = postPublicRumor(
      state,
      'suzerain_1',
      'On murmure que les bandits du col préparent une embuscade.'
    );

    expect(nextState.rumors.length).toBe(1);
    const rumor = nextState.rumors[0];
    expect(rumor.authorId).toBe('suzerain_1');
    expect(rumor.authorName).toBe('Duc de Kald');
    expect(rumor.text).toContain('embuscade');
    expect(rumor.season).toBe('spring');
  });
});
