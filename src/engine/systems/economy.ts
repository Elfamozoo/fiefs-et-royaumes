/**
 * Fiefs & Royaumes - Economy, Fiefs & Dynamic Taxation System
 *
 * Implements pure deterministic simulation of provincial taxation,
 * food consumption, demographic growth, famine, and seasonal resource production.
 */

import type { GameState, Lord, Province, ProvinceBuilding, TaxRate } from '../types';
import { getSeasonalModifiers } from './time';

/**
 * Taxation configuration mapping tax rates to collection percentages and monthly morale impacts.
 */
export const TAX_RATES_CONFIG: Record<TaxRate, { rate: number; moraleDelta: number }> = {
  low: { rate: 0.05, moraleDelta: 5 },
  moderate: { rate: 0.15, moraleDelta: 0 },
  high: { rate: 0.25, moraleDelta: -5 },
  extortion: { rate: 0.40, moraleDelta: -15 },
};

export interface ResourceYield {
  food: number;
  wood: number;
  stone: number;
  iron: number;
}

/**
 * Standard monthly yields by biome in Terres de Kald.
 */
export const BIOME_BASE_YIELDS: Record<string, ResourceYield> = {
  plains: { food: 200, wood: 50, stone: 20, iron: 10 },
  forest: { food: 100, wood: 250, stone: 30, iron: 10 },
  mountains: { food: 40, wood: 40, stone: 250, iron: 150 },
  coast: { food: 220, wood: 60, stone: 20, iron: 10 },
  coastal: { food: 220, wood: 60, stone: 20, iron: 10 },
  marsh: { food: 80, wood: 120, stone: 40, iron: 30 },
  swamp: { food: 80, wood: 120, stone: 40, iron: 30 },
  hills: { food: 100, wood: 60, stone: 150, iron: 80 },
  desert: { food: 30, wood: 20, stone: 60, iron: 40 },
};

/**
 * Calculates building production multipliers for a province.
 */
export function getBuildingProductionMultipliers(buildings: ProvinceBuilding[] = []): {
  foodMultiplier: number;
  woodMultiplier: number;
  stoneMultiplier: number;
  ironMultiplier: number;
} {
  let foodMultiplier = 1.0;
  let woodMultiplier = 1.0;
  let stoneMultiplier = 1.0;
  let ironMultiplier = 1.0;

  for (const b of buildings) {
    if (b.type === 'granary') {
      foodMultiplier += b.level * 0.1;
    } else if (b.type === 'forge') {
      stoneMultiplier += b.level * 0.1;
      ironMultiplier += b.level * 0.1;
    }
  }

  return { foodMultiplier, woodMultiplier, stoneMultiplier, ironMultiplier };
}

/**
 * Simulates one monthly economic cycle across all provinces.
 *
 * 100% pure function:
 * 1. Taxation:
 *    - Collects tax gold based on province taxRate.
 *    - Tax gold is credited to the province owner's treasury.
 *    - Province morale is modified and clamped to [0, 100].
 * 2. Food Consumption & Demographics:
 *    - 1 food per 10 citizens consumed, modified by winter consumption factor (+30%).
 *    - If food is sufficient, population grows by +1% to +2% if morale >= 70.
 *    - If food is insufficient: famine strikes. All food is consumed, population drops by 5%, morale drops by 20.
 * 3. Resource Production:
 *    - Produces resources according to biome yields, seasonal harvest multipliers, and building levels.
 *
 * Leaves original state and its nested structures untouched.
 */
export function processEconomy(state: GameState): GameState {
  const seasonalMods = getSeasonalModifiers(state.season);

  // Deep copy lords dictionary to accumulate tax revenues
  const nextLords: Record<string, Lord> = {};
  for (const [id, lord] of Object.entries(state.lords)) {
    nextLords[id] = { ...lord };
  }

  const nextProvinces: Record<string, Province> = {};

  for (const [provId, province] of Object.entries(state.provinces)) {
    let currentMorale = province.morale;
    let currentPop = province.population;
    let currentFood = province.resources.food;

    // --- 1. Taxation ---
    const taxConfig = TAX_RATES_CONFIG[province.taxRate] || TAX_RATES_CONFIG.moderate;
    const taxGold = Math.floor(currentPop * taxConfig.rate);

    // Apply morale adjustment
    currentMorale = Math.max(0, Math.min(100, currentMorale + taxConfig.moraleDelta));

    // Credit gold to province owner
    if (province.lordId && nextLords[province.lordId]) {
      nextLords[province.lordId].gold += taxGold;
    }

    // --- 2. Food Consumption & Famine ---
    const baseFoodNeeded = Math.floor(currentPop / 10);
    const foodNeeded = Math.round(baseFoodNeeded * seasonalMods.foodConsumptionMultiplier);

    if (currentFood >= foodNeeded) {
      // Normal consumption
      currentFood -= foodNeeded;

      // Demographic growth if morale is favorable (>= 70)
      if (currentMorale >= 70) {
        // Morale 70 gives 1% growth; morale 100 gives 2% growth
        const growthRate = 0.01 + ((currentMorale - 70) / 30) * 0.01;
        const popGrowth = Math.floor(currentPop * growthRate);
        currentPop += popGrowth;
      }
    } else {
      // Famine! All remaining food consumed
      currentFood = 0;
      currentPop = Math.floor(currentPop * 0.95);
      currentMorale = Math.max(0, currentMorale - 20);
    }

    // --- 3. Resource Production ---
    const baseYield = BIOME_BASE_YIELDS[province.biome] || BIOME_BASE_YIELDS.plains;
    const { foodMultiplier, woodMultiplier, stoneMultiplier, ironMultiplier } =
      getBuildingProductionMultipliers(province.buildings);

    const foodProduced = Math.round(baseYield.food * seasonalMods.harvestMultiplier * foodMultiplier);
    const woodProduced = Math.round(baseYield.wood * woodMultiplier);
    const stoneProduced = Math.round(baseYield.stone * stoneMultiplier);
    const ironProduced = Math.round(baseYield.iron * ironMultiplier);

    nextProvinces[provId] = {
      ...province,
      population: currentPop,
      morale: currentMorale,
      resources: {
        ...province.resources,
        food: currentFood + foodProduced,
        wood: province.resources.wood + woodProduced,
        stone: province.resources.stone + stoneProduced,
        iron: province.resources.iron + ironProduced,
      },
    };
  }

  return {
    ...state,
    lords: nextLords,
    provinces: nextProvinces,
  };
}

/**
 * Sets a new tax policy for a province.
 *
 * Costs 1 Action Point (PA).
 * Verifies that the lord exists, has >= 1 PA, and owns the target province.
 * If conditions are not met, returns original state unchanged.
 */
export function setProvinceTaxRate(
  state: GameState,
  lordId: string,
  provinceId: string,
  newRate: TaxRate
): GameState {
  const lord = state.lords[lordId];
  const province = state.provinces[provinceId];

  if (!lord || !province) {
    return state;
  }

  if (province.lordId !== lordId) {
    return state;
  }

  if (lord.actionPoints < 1) {
    return state;
  }

  const nextLord: Lord = {
    ...lord,
    actionPoints: lord.actionPoints - 1,
  };

  const nextProvince: Province = {
    ...province,
    taxRate: newRate,
  };

  return {
    ...state,
    lords: {
      ...state.lords,
      [lordId]: nextLord,
    },
    provinces: {
      ...state.provinces,
      [provinceId]: nextProvince,
    },
  };
}
