/**
 * Fiefs & Royaumes - Tactical Battle Resolver
 *
 * Implements the sequential multi-phase battle engine for Terres de Kald:
 * 1. Preliminary siege engine bombardment (damages walls and garrisons)
 * 2. Ranged volley phase (archers/crossbows pre-contact fire)
 * 3. Cavalry charge & shock phase (with counter bonuses e.g. pikes vs cavalry)
 * 4. Melee combat rounds (attrition, armor absorption, family counters)
 * 5. Morale test & routing
 * 6. Casualty computation & resource looting
 */

import type {
  Army,
  BattleReport,
  Province,
  Regiment,
  Resources,
  UnitDefinition,
} from '../types';
import { UNIT_MAP } from '../data/units';

interface CombatRegiment {
  unitId: string;
  count: number;
  initialCount: number;
  unit: UnitDefinition;
  morale: number;
  routed: boolean;
}

function createRng(seed: number) {
  let s = (Math.abs(seed) % 2147483647) || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function initCombatRegiments(regiments: Regiment[]): CombatRegiment[] {
  return regiments
    .map(r => {
      const unit = UNIT_MAP[r.unitId];
      if (!unit) return null;
      return {
        unitId: r.unitId,
        count: r.count,
        initialCount: r.count,
        unit,
        morale: unit.morale,
        routed: false,
      };
    })
    .filter((r): r is CombatRegiment => r !== null && r.count > 0);
}

function countActiveMen(regs: CombatRegiment[]): number {
  return regs
    .filter(r => !r.routed && r.count > 0)
    .reduce((sum, r) => sum + r.count, 0);
}

function applyDamage(
  targets: CombatRegiment[],
  rawDamage: number,
  defenseBonusMultiplier: number = 1.0,
  rng: () => number
): void {
  const activeTargets = targets.filter(r => !r.routed && r.count > 0);
  if (activeTargets.length === 0 || rawDamage <= 0) return;

  // Distribute damage proportionally across target regiments
  let remainingDmg = rawDamage;
  for (const reg of activeTargets) {
    if (remainingDmg <= 0) break;
    const share = remainingDmg / activeTargets.length;
    const effectiveDefense = Math.max(1, (reg.unit.defense + reg.unit.armor) * defenseBonusMultiplier);
    const variance = 0.9 + rng() * 0.2;
    const casualties = Math.min(
      reg.count,
      Math.max(1, Math.round((share * variance) / effectiveDefense))
    );
    reg.count -= casualties;
    remainingDmg -= casualties * effectiveDefense;
  }
}

/**
 * Resolves a tactical battle between two armies in a given province.
 *
 * @param attacker  The attacking army
 * @param defender  The defending army stationed in the province
 * @param province  The province where combat takes place (provides fortifications)
 * @param seed      Optional RNG seed for deterministic battle replays
 */
export function resolveBattle(
  attacker: Army,
  defender: Army,
  province: Province,
  seed: number = 42
): BattleReport {
  const rng = createRng(seed);
  const log: string[] = [];

  const attRegs = initCombatRegiments(attacker.regiments);
  const defRegs = initCombatRegiments(defender.regiments);

  const initialAttackerTotal = countActiveMen(attRegs);
  const initialDefenderTotal = countActiveMen(defRegs);

  log.push(
    `Bataille engagée dans la province de ${province.name} ! ${attacker.name} (${initialAttackerTotal} hommes) attaque ${defender.name} (${initialDefenderTotal} hommes).`
  );

  // Fortifications
  const wallBuilding = province.buildings?.find(b => b.type === 'walls');
  let wallLevel = wallBuilding?.level ?? 0;
  let wallDefenseMultiplier = 1.0 + wallLevel * 0.15;

  // -------------------------------------------------------------------------
  // Phase 1: Siege Engines Preliminary Bombardment
  // -------------------------------------------------------------------------
  const attSiege = attRegs.filter(r => r.unit.family === 'siege' && r.count > 0);
  if (attSiege.length > 0) {
    log.push(`[Bombardement de siège] Les engins de siège pilonnent les fortifications adverses !`);
    const totalSiegePower = attSiege.reduce((sum, r) => sum + r.count * r.unit.attack, 0);

    if (wallLevel > 0) {
      const breachChance = Math.min(1.0, totalSiegePower / 100);
      if (rng() < breachChance) {
        wallLevel = Math.max(0, wallLevel - 1);
        wallDefenseMultiplier = 1.0 + wallLevel * 0.15;
        log.push(`[Bombardement de siège] Une brèche est ouverte dans les remparts ! Le bonus défensif est réduit.`);
      }
    }

    applyDamage(defRegs, totalSiegePower * 0.4, wallDefenseMultiplier, rng);
  }

  // -------------------------------------------------------------------------
  // Phase 2: Ranged Volley Phase
  // -------------------------------------------------------------------------
  const attRanged = attRegs.filter(r => r.unit.rangedAttack > 0 && r.count > 0 && !r.routed);
  const defRanged = defRegs.filter(r => r.unit.rangedAttack > 0 && r.count > 0 && !r.routed);

  if (attRanged.length > 0 || defRanged.length > 0) {
    log.push(`[Phase de tir] Volées de flèches, carreaux et projectiles échangées à distance.`);
    const attRangedPower = attRanged.reduce((sum, r) => sum + r.count * r.unit.rangedAttack, 0);
    const defRangedPower = defRanged.reduce((sum, r) => sum + r.count * r.unit.rangedAttack, 0);

    applyDamage(defRegs, attRangedPower, wallDefenseMultiplier, rng);
    applyDamage(attRegs, defRangedPower, 1.0, rng);
  }

  // -------------------------------------------------------------------------
  // Phase 3: Cavalry Charge & Shock Phase
  // -------------------------------------------------------------------------
  const attCav = attRegs.filter(r => r.unit.family === 'cavalry' && r.count > 0 && !r.routed);
  const defCav = defRegs.filter(r => r.unit.family === 'cavalry' && r.count > 0 && !r.routed);

  if (attCav.length > 0 || defCav.length > 0) {
    log.push(`[Charge de cavalerie] Choc retentissant des montures contre les lignes de combat !`);

    // Attacker cavalry charge
    for (const cav of attCav) {
      let chargePower = cav.count * cav.unit.attack * 1.5;
      const defPikes = defRegs.filter(r => (r.unit.counters?.cavalry ?? 0) > 1 && r.count > 0 && !r.routed);
      if (defPikes.length > 0) {
        chargePower *= 0.35;
        const pikeLosses = Math.min(
          cav.count,
          Math.ceil((defPikes.reduce((s, p) => s + p.count * (p.unit.counters?.cavalry ?? 1.5), 0) * 0.1) / Math.max(1, cav.unit.armor))
        );
        cav.count = Math.max(0, cav.count - pikeLosses);
      }
      applyDamage(defRegs, chargePower, wallDefenseMultiplier, rng);
    }

    // Defender cavalry counter-charge
    for (const cav of defCav) {
      let chargePower = cav.count * cav.unit.attack * 1.5;
      const attPikes = attRegs.filter(r => (r.unit.counters?.cavalry ?? 0) > 1 && r.count > 0 && !r.routed);
      if (attPikes.length > 0) {
        chargePower *= 0.35;
        const pikeLosses = Math.min(
          cav.count,
          Math.ceil((attPikes.reduce((s, p) => s + p.count * (p.unit.counters?.cavalry ?? 1.5), 0) * 0.1) / Math.max(1, cav.unit.armor))
        );
        cav.count = Math.max(0, cav.count - pikeLosses);
      }
      applyDamage(attRegs, chargePower, 1.0, rng);
    }
  }

  // -------------------------------------------------------------------------
  // Phase 4: Melee Combat Rounds
  // -------------------------------------------------------------------------
  let round = 1;
  const maxRounds = 5;

  while (round <= maxRounds && countActiveMen(attRegs) > 0 && countActiveMen(defRegs) > 0) {
    log.push(`[Mêlée - Round ${round}] Les troupes s'affrontent au corps à corps.`);

    // Calculate attacker melee power
    let attMeleePower = 0;
    for (const reg of attRegs.filter(r => !r.routed && r.count > 0)) {
      let power = reg.count * reg.unit.attack;
      // Counter bonuses against defender composition
      for (const [targetFamily, bonus] of Object.entries(reg.unit.counters ?? {})) {
        if (defRegs.some(d => d.unit.family === targetFamily && d.count > 0 && !d.routed)) {
          power *= bonus;
        }
      }
      attMeleePower += power;
    }

    // Calculate defender melee power
    let defMeleePower = 0;
    for (const reg of defRegs.filter(r => !r.routed && r.count > 0)) {
      let power = reg.count * reg.unit.attack;
      for (const [targetFamily, bonus] of Object.entries(reg.unit.counters ?? {})) {
        if (attRegs.some(a => a.unit.family === targetFamily && a.count > 0 && !a.routed)) {
          power *= bonus;
        }
      }
      defMeleePower += power;
    }

    applyDamage(defRegs, attMeleePower, wallDefenseMultiplier, rng);
    applyDamage(attRegs, defMeleePower, 1.0, rng);

    // Morale rout test
    const attRemaining = countActiveMen(attRegs);
    const defRemaining = countActiveMen(defRegs);

    if (attRemaining < initialAttackerTotal * 0.5) {
      for (const reg of attRegs) {
        if (!reg.routed && rng() * 100 > reg.morale) {
          reg.routed = true;
          log.push(`Une unité de l'attaquant (${reg.unit.name}) panique et fuit le champ de bataille !`);
        }
      }
    }

    if (defRemaining < initialDefenderTotal * 0.5) {
      for (const reg of defRegs) {
        if (!reg.routed && rng() * 100 > reg.morale) {
          reg.routed = true;
          log.push(`Une unité du défenseur (${reg.unit.name}) panique et fuit le champ de bataille !`);
        }
      }
    }

    round++;
  }

  // -------------------------------------------------------------------------
  // Phase 5: Outcome & Looting
  // -------------------------------------------------------------------------
  const finalAttackerTotal = countActiveMen(attRegs);
  const finalDefenderTotal = countActiveMen(defRegs);

  let winnerId: string | null = null;
  const lootedResources: Resources = {
    gold: 0,
    food: 0,
    wood: 0,
    stone: 0,
    iron: 0,
  };

  if (finalAttackerTotal > 0 && finalDefenderTotal === 0) {
    winnerId = attacker.lordId;
    log.push(`Victoire totale de l'attaquant (${attacker.name}) !`);
    // Loot up to 25% of province resources
    lootedResources.gold = Math.floor(province.resources.gold * 0.25);
    lootedResources.food = Math.floor(province.resources.food * 0.25);
    lootedResources.wood = Math.floor(province.resources.wood * 0.25);
    lootedResources.stone = Math.floor(province.resources.stone * 0.25);
    lootedResources.iron = Math.floor(province.resources.iron * 0.25);
  } else if (finalDefenderTotal > 0 && finalAttackerTotal === 0) {
    winnerId = defender.lordId;
    log.push(`L'assaut est repoussé ! Victoire éclatante de ${defender.name}.`);
  } else if (finalAttackerTotal > finalDefenderTotal) {
    winnerId = attacker.lordId;
    log.push(`Victoire aux points de l'attaquant (${attacker.name}) qui tient le terrain.`);
    lootedResources.gold = Math.floor(province.resources.gold * 0.15);
    lootedResources.food = Math.floor(province.resources.food * 0.15);
    lootedResources.wood = Math.floor(province.resources.wood * 0.15);
    lootedResources.stone = Math.floor(province.resources.stone * 0.15);
    lootedResources.iron = Math.floor(province.resources.iron * 0.15);
  } else {
    winnerId = defender.lordId;
    log.push(`Le défenseur (${defender.name}) maintient ses positions et repousse l'ennemi.`);
  }

  return {
    attackerId: attacker.lordId,
    defenderId: defender.lordId,
    provinceId: province.id,
    initialAttacker: attacker.regiments,
    initialDefender: defender.regiments,
    finalAttacker: attRegs.map(r => ({ unitId: r.unitId, count: r.count })),
    finalDefender: defRegs.map(r => ({ unitId: r.unitId, count: r.count })),
    winnerId,
    lootedResources,
    rounds: round - 1,
    log,
  };
}
