import { describe, it, expect } from 'vitest';
import { createInitialGameState, tickGameState } from '../engine';

describe('Master Engine Orchestrator', () => {
  it('creates a complete valid initial game state with player and AI lords', () => {
    const state = createInitialGameState('Julien de Kald');

    expect(state.month).toBe(1);
    expect(state.season).toBe('spring');
    expect(state.playerLordId).toBeDefined();

    const player = state.lords[state.playerLordId];
    expect(player).toBeDefined();
    expect(player.name).toBe('Julien de Kald');
    expect(player.isPlayer).toBe(true);
    expect(player.actionPoints).toBe(20);

    // AI lords are populated
    const aiLords = Object.values(state.lords).filter(l => !l.isPlayer);
    expect(aiLords.length).toBeGreaterThanOrEqual(4);

    // Provinces are mapped to lords
    const playerProvinces = Object.values(state.provinces).filter(
      p => p.lordId === state.playerLordId
    );
    expect(playerProvinces.length).toBeGreaterThan(0);

    // Initial market is loaded
    expect(state.market.food.currentPrice).toBe(2.0);
    expect(state.market.iron.currentPrice).toBe(10.0);

    // Messages board contains welcome missive
    expect(state.messages.length).toBeGreaterThan(0);
    expect(state.messages[0].toLordId).toBe(state.playerLordId);
  });

  it('ticks game state forward one month: economy, AI, market, time, and upkeep', () => {
    const initialState = createInitialGameState('Seigneur Test');
    const initialPlayerGold = initialState.lords[initialState.playerLordId].gold;

    const nextState = tickGameState(initialState);

    // Month increments
    expect(nextState.month).toBe(2);
    expect(nextState.season).toBe('spring');

    // PA regenerated (+10, capped at 40)
    expect(nextState.lords[nextState.playerLordId].actionPoints).toBe(30);

    // Economy processed: taxes collected into player treasury
    expect(nextState.lords[nextState.playerLordId].gold).toBeGreaterThanOrEqual(initialPlayerGold);

    // Market updated: priceHistory has recorded this month
    expect(nextState.market.food.priceHistory.length).toBeGreaterThanOrEqual(2);

    // Immutability verified
    expect(initialState.month).toBe(1);
  });

  it('cycles across a full 12-month annual cycle', () => {
    let state = createInitialGameState('Seigneur Annuel');

    for (let m = 1; m <= 12; m++) {
      expect(state.month).toBe(m);
      state = tickGameState(state);
    }

    expect(state.month).toBe(13);
    expect(state.season).toBe('spring');
  });
});
