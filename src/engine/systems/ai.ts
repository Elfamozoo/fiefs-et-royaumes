/**
 * Fiefs & Royaumes - Rival AI Lords Decision Engine
 *
 * Simulates autonomous decision-making for non-player lords:
 * - 'conqueror': Aggressive recruitment, militarization, border pressure
 * - 'merchant': Dynamic market speculation, arbitrage, wealth accumulation
 * - 'diplomat': Diplomatic alliances, espionage, rumor manipulation
 * - 'traditionalist': Fiscal conservatism, food stocking, high citizen morale
 */

import type { GameState } from '../types';
import { recruitRegiment } from './military';
import { executeMarketTrade } from './market';
import { postPublicRumor } from './diplomacy';
import { launchSpyMission } from './espionage';

export function simulateAITurns(state: GameState): GameState {
  let currentState = state;

  const aiLords = Object.values(state.lords).filter(l => !l.isPlayer);

  for (const lord of aiLords) {
    // Find provinces owned by this lord
    const ownedProvinces = Object.values(currentState.provinces).filter(
      p => p.lordId === lord.id
    );

    if (ownedProvinces.length === 0) continue;

    const currentLordState = currentState.lords[lord.id];
    if (!currentLordState || currentLordState.actionPoints < 2) continue;

    switch (currentLordState.archetype) {
      case 'conqueror': {
        // Try recruiting infantry or cavalry in first owned province
        const targetProvince = ownedProvinces[0];
        if (currentLordState.gold >= 100 && targetProvince.resources.iron >= 20) {
          const recruitRes = recruitRegiment(
            currentState,
            lord.id,
            targetProvince.id,
            'inf_miliciens_garnison',
            10
          );
          if (recruitRes.ok) {
            currentState = recruitRes.value;
          }
        }
        break;
      }

      case 'merchant': {
        // Speculate on market: buy food if cheap (< 3) or sell wood/stone if surplus
        const targetProvince = ownedProvinces[0];
        if (currentLordState.gold >= 60 && currentState.market.food.currentPrice <= 3.0) {
          executeMarketTrade(
            currentState,
            lord.id,
            targetProvince.id,
            'food',
            20,
            true
          );
        } else if (targetProvince.resources.wood >= 100) {
          executeMarketTrade(
            currentState,
            lord.id,
            targetProvince.id,
            'wood',
            30,
            false
          );
        }
        break;
      }

      case 'diplomat': {
        // Post occasional rumor or dispatch an infiltration mission
        const rumorRes = postPublicRumor(
          currentState,
          lord.id,
          `${lord.name} garantit la paix et la prospérité à ses voisins bienveillants.`
        );
        currentState = rumorRes;

        // Spy mission against another lord's province if PA permits
        const otherProvince = Object.values(currentState.provinces).find(
          p => p.lordId !== null && p.lordId !== lord.id
        );
        if (otherProvince && currentState.lords[lord.id].actionPoints >= 2) {
          const { state: spyState } = launchSpyMission(
            currentState,
            lord.id,
            'infiltrate',
            otherProvince.id
          );
          currentState = spyState;
        }
        break;
      }

      case 'traditionalist': {
        // Keep granaries full: buy food if reserves are low
        const targetProvince = ownedProvinces[0];
        if (targetProvince.resources.food < 500 && currentLordState.gold >= 100) {
          executeMarketTrade(
            currentState,
            lord.id,
            targetProvince.id,
            'food',
            40,
            true
          );
        }
        break;
      }
    }
  }

  return currentState;
}
