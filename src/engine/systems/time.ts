/**
 * Fiefs & Royaumes - Time & Seasons Simulation System
 *
 * Implements pure deterministic monthly progression, four-season cycling,
 * seasonal economic/travel modifiers, and strict action points (PA) regeneration.
 */

import type { GameState, Lord, Season } from '../types';

/** Maximum action points a Lord can accumulate */
export const MAX_ACTION_POINTS = 40;

/** Action points gained automatically at the beginning of each month */
export const MONTHLY_PA_GAIN = 10;

/**
 * Seasonal modifiers affecting harvests, consumption, and travel
 */
export interface SeasonalModifiers {
  harvestMultiplier: number;
  foodConsumptionMultiplier: number;
  travelCostPenalty: number;
}

/**
 * Complete catalogue of modifiers for each of the four seasons:
 * - Spring: Normal harvest (1.0), normal consumption (1.0), normal travel (+0 PA)
 * - Summer: High harvest (1.2), normal consumption (1.0), normal travel (+0 PA)
 * - Autumn: Peak harvest (1.5), normal consumption (1.0), normal travel (+0 PA)
 * - Winter: Reduced harvest (0.6), high consumption (1.3), snow/mud travel penalty (+1 PA)
 */
export const SEASONAL_MODIFIERS: Record<Season, SeasonalModifiers> = {
  spring: {
    harvestMultiplier: 1.0,
    foodConsumptionMultiplier: 1.0,
    travelCostPenalty: 0,
  },
  summer: {
    harvestMultiplier: 1.2,
    foodConsumptionMultiplier: 1.0,
    travelCostPenalty: 0,
  },
  autumn: {
    harvestMultiplier: 1.5,
    foodConsumptionMultiplier: 1.0,
    travelCostPenalty: 0,
  },
  winter: {
    harvestMultiplier: 0.6,
    foodConsumptionMultiplier: 1.3,
    travelCostPenalty: 1,
  },
};

/**
 * Returns the season corresponding to a given game month.
 * Months cycle every 12 months:
 * - Months 1-3: 'spring'
 * - Months 4-6: 'summer'
 * - Months 7-9: 'autumn'
 * - Months 10-12: 'winter'
 */
export function getSeasonForMonth(month: number): Season {
  const normalized = ((month - 1) % 12 + 12) % 12;
  if (normalized < 3) return 'spring';
  if (normalized < 6) return 'summer';
  if (normalized < 9) return 'autumn';
  return 'winter';
}

/**
 * Returns seasonal economic and travel modifiers for a given season.
 */
export function getSeasonalModifiers(season: Season): SeasonalModifiers {
  return SEASONAL_MODIFIERS[season];
}

/**
 * Advances the simulation by one month.
 *
 * 100% pure function:
 * - Increments `month` by 1.
 * - Updates `season` based on the new month.
 * - Regenerates +10 PA for every lord, capped strictly at MAX_ACTION_POINTS (40).
 * - Leaves original input `state` and its nested objects completely untouched.
 */
export function advanceMonth(state: GameState): GameState {
  const nextMonth = state.month + 1;
  const nextSeason = getSeasonForMonth(nextMonth);

  const nextLords: Record<string, Lord> = {};
  for (const [id, lord] of Object.entries(state.lords)) {
    nextLords[id] = {
      ...lord,
      actionPoints: Math.min(MAX_ACTION_POINTS, lord.actionPoints + MONTHLY_PA_GAIN),
    };
  }

  return {
    ...state,
    month: nextMonth,
    season: nextSeason,
    lords: nextLords,
  };
}
