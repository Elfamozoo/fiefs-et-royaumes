/**
 * Fiefs & Royaumes - Espionage & Intelligence System
 *
 * Implements covert spy operations:
 * - infiltrate: reconnaissance of population, morale, defenses
 * - scout_army: intelligence on garrisons and stationed armies
 * - sabotage: covert arson / destruction of food stores or defenses
 * - assassinate: covert elimination of commanders / demoralization
 *
 * Includes risk of detection, capture, and counter-intelligence alerts.
 */

import type {
  GameState,
  Lord,
  Province,
  SpyMissionType,
  SpyResult,
} from '../types';
import { sendPigeonMessage } from './diplomacy';

/** Action Points cost required to dispatch a spy */
export const SPY_PA_COST = 2;

function createRng(seed: number) {
  let s = (Math.abs(seed) % 2147483647) || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Dispatches a spy on a covert mission into a target province.
 *
 * @param state             Current simulation game state
 * @param spyLordId         Lord sending the operative
 * @param missionType       Type of mission
 * @param targetProvinceId  Target province
 * @param seed              Optional RNG seed for deterministic runs
 */
export function launchSpyMission(
  state: GameState,
  spyLordId: string,
  missionType: SpyMissionType,
  targetProvinceId: string,
  seed?: number
): { state: GameState; result: SpyResult } {
  const spyLord = state.lords[spyLordId];
  const province = state.provinces[targetProvinceId];

  if (!spyLord || !province) {
    return {
      state,
      result: {
        success: false,
        captured: false,
        details: 'Seigneur ou province introuvable.',
      },
    };
  }

  if (spyLord.actionPoints < SPY_PA_COST) {
    return {
      state,
      result: {
        success: false,
        captured: false,
        details: 'Points d’Action insuffisants (nécessite 2 PA).',
      },
    };
  }

  const rng = createRng(seed ?? Math.floor(Math.random() * 1000000));

  // Deduct PA from the spy lord
  const nextLords = {
    ...state.lords,
    [spyLordId]: {
      ...spyLord,
      actionPoints: spyLord.actionPoints - SPY_PA_COST,
    },
  };

  let nextState: GameState = {
    ...state,
    lords: nextLords,
  };

  // Base difficulty and capture chances
  // Infiltrate: 85% success, 10% capture on fail
  // Scout army: 80% success, 15% capture on fail
  // Sabotage: 65% success, 30% capture on fail
  // Assassinate: 50% success, 45% capture on fail
  const successThresholds: Record<SpyMissionType, number> = {
    infiltrate: 0.85,
    scout_army: 0.80,
    sabotage: 0.65,
    assassinate: 0.50,
  };

  const captureThresholds: Record<SpyMissionType, number> = {
    infiltrate: 0.20,
    scout_army: 0.25,
    sabotage: 0.40,
    assassinate: 0.50,
  };

  const roll = rng();
  const isSuccess = roll < successThresholds[missionType];

  if (isSuccess) {
    let intel: unknown = undefined;
    let details = '';

    switch (missionType) {
      case 'infiltrate': {
        const wallBuilding = province.buildings?.find(b => b.type === 'walls');
        intel = {
          population: province.population,
          morale: province.morale,
          walls: wallBuilding?.level ?? 0,
          resources: { ...province.resources },
        };
        details = `Infiltration réussie de ${province.name}. Registres civils et défenses inspectés.`;
        break;
      }

      case 'scout_army': {
        const garrisonedArmies = Object.values(state.armies).filter(
          a => a.provinceId === targetProvinceId
        );
        intel = {
          armies: garrisonedArmies.map(a => ({
            name: a.name,
            lordId: a.lordId,
            count: a.regiments.reduce((s, r) => s + r.count, 0),
            regiments: a.regiments,
          })),
        };
        details = `Reconnaissance des troupes accomplie dans ${province.name}.`;
        break;
      }

      case 'sabotage': {
        // Destroy 20% to 35% of province food stores
        const burnRatio = 0.20 + rng() * 0.15;
        const foodLoss = Math.floor(province.resources.food * burnRatio);
        nextState = {
          ...nextState,
          provinces: {
            ...nextState.provinces,
            [targetProvinceId]: {
              ...province,
              resources: {
                ...province.resources,
                food: Math.max(0, province.resources.food - foodLoss),
              },
            },
          },
        };
        details = `Incendie criminel ! Les greniers de ${province.name} ont été sabotés (-${foodLoss} vivres).`;
        break;
      }

      case 'assassinate': {
        // Demoralize province by 15 points
        nextState = {
          ...nextState,
          provinces: {
            ...nextState.provinces,
            [targetProvinceId]: {
              ...province,
              morale: Math.max(0, province.morale - 15),
            },
          },
        };
        details = `Le capitaine de garnison de ${province.name} a été éliminé dans l’ombre. La garnison tremble !`;
        break;
      }
    }

    return {
      state: nextState,
      result: {
        success: true,
        captured: false,
        details,
        intel,
      },
    };
  }

  // Failure
  const captureRoll = rng();
  const captured = captureRoll < captureThresholds[missionType];

  let failDetails = `La mission d’espionnage dans ${province.name} a échoué. L’agent a dû battre en retraite.`;

  if (captured) {
    failDetails = `Désastre ! Votre espion a été démasqué et capturé par le prévôt de ${province.name}.`;

    // Alert target province lord if present
    if (province.lordId) {
      nextState = sendPigeonMessage(
        nextState,
        'system',
        province.lordId,
        `Alerte ! Un espion ennemi infiltré dans votre province de ${province.name} a été capturé et mis aux fers.`
      );
    }
  }

  return {
    state: nextState,
    result: {
      success: false,
      captured,
      details: failDetails,
    },
  };
}
