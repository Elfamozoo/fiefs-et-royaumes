/**
 * Fiefs & Royaumes - Military System
 *
 * Implements army recruitment, monthly upkeep deduction, army movement
 * across the provinces of Terres de Kald, and cost-in-PA validation.
 */

import type {
  GameState,
  Lord,
  Province,
  Regiment,
  Army,
  Result,
} from '../types';
import { UNIT_MAP } from '../data/units';

/** PA cost to recruit a regiment */
export const RECRUIT_PA_COST = 2;

/** PA cost to move an army one province (flat terrain). Terrain multipliers applied on top. */
export const MOVE_PA_BASE_COST = 2;

/** Monthly upkeep is deducted per regiment per month.
 *  If a lord cannot pay gold, troop morale falls and they may desert.
 */
export const MORALE_PENALTY_UNPAID = 5;

// ---------------------------------------------------------------------------
// Recruitment
// ---------------------------------------------------------------------------

/**
 * Recruits a regiment of `count` units for the lord in the given province.
 *
 * Rules:
 *  - Lord must own the province.
 *  - Unit must exist in the catalogue.
 *  - Lord must have >= RECRUIT_PA_COST PA.
 *  - Lord must have enough gold (unit.cost.gold * count).
 *  - Food, wood, stone and iron costs (if any) come from province resources.
 */
export function recruitRegiment(
  state: GameState,
  lordId: string,
  provinceId: string,
  unitId: string,
  count: number
): Result<GameState> {
  const lord = state.lords[lordId];
  const province = state.provinces[provinceId];
  const unitDef = UNIT_MAP[unitId];

  if (!lord) return { ok: false, error: `Lord '${lordId}' not found.` };
  if (!province) return { ok: false, error: `Province '${provinceId}' not found.` };
  if (!unitDef) return { ok: false, error: `Unit '${unitId}' not in catalogue.` };
  if (province.lordId !== lordId) return { ok: false, error: 'Province not owned by this lord.' };
  if (count <= 0) return { ok: false, error: 'Count must be positive.' };
  if (lord.actionPoints < RECRUIT_PA_COST) return { ok: false, error: 'Not enough Action Points.' };

  const goldCost = unitDef.cost.gold * count;
  const foodCost = (unitDef.cost.food ?? 0) * count;
  const woodCost = (unitDef.cost.wood ?? 0) * count;
  const stoneCost = (unitDef.cost.stone ?? 0) * count;
  const ironCost = (unitDef.cost.iron ?? 0) * count;

  if (lord.gold < goldCost) return { ok: false, error: 'Not enough gold.' };
  if (province.resources.food < foodCost) return { ok: false, error: 'Not enough food in province.' };
  if (province.resources.wood < woodCost) return { ok: false, error: 'Not enough wood in province.' };
  if (province.resources.stone < stoneCost) return { ok: false, error: 'Not enough stone in province.' };
  if (province.resources.iron < ironCost) return { ok: false, error: 'Not enough iron in province.' };

  // Check if lord already has an army in this province, or create one
  const existingArmyEntry = Object.entries(state.armies).find(
    ([, a]) => a.lordId === lordId && a.provinceId === provinceId
  );

  const nextArmies = { ...state.armies };

  if (existingArmyEntry) {
    const [armyId, army] = existingArmyEntry;
    const existingReg = army.regiments.find(r => r.unitId === unitId);
    const updatedRegiments: Regiment[] = existingReg
      ? army.regiments.map(r =>
          r.unitId === unitId ? { ...r, count: r.count + count } : r
        )
      : [...army.regiments, { unitId, count }];
    nextArmies[armyId] = { ...army, regiments: updatedRegiments };
  } else {
    const armyId = `army_${lordId}_${provinceId}_${Date.now()}`;
    const newArmy: Army = {
      id: armyId,
      lordId,
      name: `Armée de ${lord.name}`,
      provinceId,
      regiments: [{ unitId, count }],
    };
    nextArmies[armyId] = newArmy;
  }

  const nextLord: Lord = {
    ...lord,
    actionPoints: lord.actionPoints - RECRUIT_PA_COST,
    gold: lord.gold - goldCost,
  };

  const nextProvince: Province = {
    ...province,
    resources: {
      ...province.resources,
      food: province.resources.food - foodCost,
      wood: province.resources.wood - woodCost,
      stone: province.resources.stone - stoneCost,
      iron: province.resources.iron - ironCost,
    },
  };

  return {
    ok: true,
    value: {
      ...state,
      lords: { ...state.lords, [lordId]: nextLord },
      provinces: { ...state.provinces, [provinceId]: nextProvince },
      armies: nextArmies,
    },
  };
}

// ---------------------------------------------------------------------------
// Movement
// ---------------------------------------------------------------------------

/**
 * Returns the terrain-based PA cost for moving to a target province.
 *
 * Biome multipliers for travel cost:
 *  - plains: 1x (base)
 *  - coast: 1x
 *  - hills: 1.5x
 *  - forest: 1.5x
 *  - marsh: 2x
 *  - mountains: 2x
 *  - desert: 1.5x
 */
export function getTravelCost(targetBiome: Province['biome']): number {
  const multipliers: Record<Province['biome'], number> = {
    plains: 1,
    coast: 1,
    hills: 1.5,
    forest: 1.5,
    marsh: 2,
    mountains: 2,
    desert: 1.5,
  };
  return Math.ceil(MOVE_PA_BASE_COST * (multipliers[targetBiome] ?? 1));
}

/**
 * Moves an army from its current province to an adjacent target province.
 *
 * Rules:
 *  - Target province must be adjacent (listed in origin.connections).
 *  - Lord must have enough PA (based on terrain).
 */
export function moveArmy(
  state: GameState,
  armyId: string,
  targetProvinceId: string
): Result<GameState> {
  const army = state.armies[armyId];
  if (!army) return { ok: false, error: `Army '${armyId}' not found.` };

  const lord = state.lords[army.lordId];
  if (!lord) return { ok: false, error: `Lord '${army.lordId}' not found.` };

  const originProvince = state.provinces[army.provinceId];
  const targetProvince = state.provinces[targetProvinceId];
  if (!originProvince) return { ok: false, error: `Origin province not found.` };
  if (!targetProvince) return { ok: false, error: `Target province '${targetProvinceId}' not found.` };

  if (!originProvince.connections.includes(targetProvinceId)) {
    return { ok: false, error: `Province '${targetProvinceId}' is not adjacent.` };
  }

  const paCost = getTravelCost(targetProvince.biome);
  if (lord.actionPoints < paCost) {
    return { ok: false, error: `Not enough Action Points (need ${paCost}, have ${lord.actionPoints}).` };
  }

  const nextLord: Lord = { ...lord, actionPoints: lord.actionPoints - paCost };
  const nextArmy: Army = { ...army, provinceId: targetProvinceId };

  return {
    ok: true,
    value: {
      ...state,
      lords: { ...state.lords, [army.lordId]: nextLord },
      armies: { ...state.armies, [armyId]: nextArmy },
    },
  };
}

// ---------------------------------------------------------------------------
// Monthly Upkeep
// ---------------------------------------------------------------------------

/**
 * Deducts monthly upkeep (gold) for all armies.
 * If a lord cannot afford upkeep, troop morale is penalized and desertion strikes (5%).
 * Pure immutable function.
 */
export function processArmyUpkeep(state: GameState): GameState {
  const nextLords = { ...state.lords };
  const nextArmies = { ...state.armies };

  for (const army of Object.values(state.armies)) {
    const lord = nextLords[army.lordId];
    if (!lord) continue;

    let totalGoldUpkeep = 0;

    for (const regiment of army.regiments) {
      const unitDef = UNIT_MAP[regiment.unitId];
      if (!unitDef) continue;
      totalGoldUpkeep += unitDef.upkeep.gold * regiment.count;
    }

    if (lord.gold >= totalGoldUpkeep) {
      nextLords[army.lordId] = { ...lord, gold: lord.gold - totalGoldUpkeep };
    } else {
      // Can't pay — gold drops to 0 and 5% desertion per unpaid turn
      nextLords[army.lordId] = { ...lord, gold: 0 };
      nextArmies[army.id] = {
        ...army,
        regiments: army.regiments.map(r => ({
          ...r,
          count: Math.max(0, Math.floor(r.count * 0.95)),
        })),
      };
    }
  }

  return {
    ...state,
    lords: nextLords,
    armies: nextArmies,
  };
}
