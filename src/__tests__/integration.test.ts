import { describe, it, expect } from 'vitest';
import {
  createInitialGameState,
  tickGameState,
  recruitRegiment,
  moveArmy,
  executeMarketTrade,
  setProvinceTaxRate,
  sendPigeonMessage,
  postPublicRumor,
  launchSpyMission,
  swearFealty,
} from '../engine';

describe('Integration Test - Full Fiefs & Royaumes 12-Month Campaign', () => {
  it('runs a full sequence of tactical actions and simulated months without state corruption', () => {
    let state = createInitialGameState('Roi Julien de Kald');

    // 1. Initial State assertions
    expect(state.month).toBe(1);
    expect(state.season).toBe('spring');
    const playerLord = state.lords[state.playerLordId];
    expect(playerLord.gold).toBe(1000);
    expect(playerLord.actionPoints).toBe(20);

    // 2. Adjust Tax Rate in capital
    const capitalProvince = Object.values(state.provinces).find(
      p => p.lordId === state.playerLordId
    )!;
    state = setProvinceTaxRate(state, state.playerLordId, capitalProvince.id, 'high');
    expect(state.provinces[capitalProvince.id].taxRate).toBe('high');
    expect(state.lords[state.playerLordId].actionPoints).toBe(19);

    // 3. Recruit troops in capital
    const recruitRes = recruitRegiment(
      state,
      state.playerLordId,
      capitalProvince.id,
      'inf_miliciens_garnison',
      10
    );
    expect(recruitRes.ok).toBe(true);
    if (recruitRes.ok) state = recruitRes.value;

    expect(state.lords[state.playerLordId].actionPoints).toBe(17);
    const playerArmies = Object.values(state.armies).filter(
      a => a.lordId === state.playerLordId
    );
    expect(playerArmies.length).toBeGreaterThan(0);

    // 4. Move Army to an adjacent province
    const targetConn = capitalProvince.connections[0];
    const moveRes = moveArmy(state, playerArmies[0].id, targetConn);
    expect(moveRes.ok).toBe(true);
    if (moveRes.ok) state = moveRes.value;

    // 5. Trade at the Market (buy 20 wood)
    const initialGold = state.lords[state.playerLordId].gold;
    const initialWood = state.provinces[capitalProvince.id].resources.wood;
    const clone = JSON.parse(JSON.stringify(state));
    const tradeRes = executeMarketTrade(
      clone,
      state.playerLordId,
      capitalProvince.id,
      'wood',
      20,
      true
    );
    expect(tradeRes.success).toBe(true);
    state = tradeRes.state!;
    expect(state.provinces[capitalProvince.id].resources.wood).toBe(initialWood + 20);
    expect(state.lords[state.playerLordId].gold).toBeLessThan(initialGold);

    // 5. Send diplomatic pigeon & post rumor
    state = sendPigeonMessage(
      state,
      state.playerLordId,
      'lord_vane',
      'Salutations seigneur Vane, que la paix règne sur nos marches.'
    );
    expect(state.messages[0].content).toContain('Salutations seigneur Vane');

    state = postPublicRumor(
      state,
      state.playerLordId,
      'Les étendards du Roi flottent sur Kaldheim !'
    );
    expect(state.rumors[0].text).toContain('étendards');

    // 6. Launch an espionage mission
    const rivalProv = Object.values(state.provinces).find(
      p => p.lordId !== state.playerLordId
    )!;
    const { state: spyState, result: spyResult } = launchSpyMission(
      state,
      state.playerLordId,
      'infiltrate',
      rivalProv.id,
      12345
    );
    state = spyState;
    expect(spyResult.success).toBe(true);

    // 7. Swear fealty
    state = swearFealty(state, 'lord_godefroy', state.playerLordId);
    expect(state.lords['lord_godefroy'].suzerainId).toBe(state.playerLordId);

    // 8. Advance time for 12 months (Full Year)
    for (let m = 1; m <= 12; m++) {
      state = tickGameState(state);
      expect(state.month).toBe(m + 1);
      // Verify PA does not exceed maximum 40
      expect(state.lords[state.playerLordId].actionPoints).toBeLessThanOrEqual(40);
      // Verify market prices stay >= 1
      for (const commodity of Object.values(state.market)) {
        expect(commodity.currentPrice).toBeGreaterThanOrEqual(1);
      }
    }

    expect(state.month).toBe(13);
    expect(state.season).toBe('spring');
  });

  it('serializes and deserializes savegame without losing domain data integrity', () => {
    const originalState = createInitialGameState('Duc de Fer');
    const serialized = JSON.stringify(originalState);
    const restored = JSON.parse(serialized);

    expect(restored.month).toBe(originalState.month);
    expect(restored.playerLordId).toBe(originalState.playerLordId);
    expect(Object.keys(restored.lords).length).toBe(Object.keys(originalState.lords).length);
    expect(Object.keys(restored.provinces).length).toBe(Object.keys(originalState.provinces).length);
    expect(restored.market.food.currentPrice).toBe(originalState.market.food.currentPrice);
  });
});
