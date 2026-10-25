import { describe, it, expect } from 'vitest';
import type { Army, Province, Regiment } from '../../types';
import { resolveBattle } from '../battle';

function createMockProvince(overrides: Partial<Province> = {}): Province {
  return {
    id: 'prov_battle',
    name: 'Château de Kald',
    lordId: 'lord_defender',
    biome: 'plains',
    population: 5000,
    morale: 80,
    taxRate: 'moderate',
    resources: { gold: 1000, food: 2000, wood: 1000, stone: 800, iron: 500 },
    buildings: [{ type: 'walls', level: 1 }],
    connections: [],
    coordinates: { x: 50, y: 50 },
    ...overrides,
  };
}

function createArmy(id: string, lordId: string, regiments: Regiment[]): Army {
  return {
    id,
    lordId,
    name: `Armée de ${lordId}`,
    provinceId: 'prov_battle',
    regiments,
  };
}

describe('Battle System - resolveBattle', () => {
  it('resolves a simple combat and declares a winner', () => {
    // 50 miliciens vs 5 paysans -> Attacker should crush defender easily
    const attacker = createArmy('att_1', 'lord_att', [{ unitId: 'inf_miliciens_garnison', count: 50 }]);
    const defender = createArmy('def_1', 'lord_def', [{ unitId: 'inf_paysans_armes', count: 5 }]);
    const province = createMockProvince();

    const report = resolveBattle(attacker, defender, province, 12345);

    expect(report.attackerId).toBe('lord_att');
    expect(report.defenderId).toBe('lord_def');
    expect(report.winnerId).toBe('lord_att');
    expect(report.finalAttacker[0].count).toBeGreaterThan(0);
    // Defender wiped or routed
    const defCount = report.finalDefender.reduce((acc, r) => acc + r.count, 0);
    expect(defCount).toBeLessThan(5);
    expect(report.log).toBeDefined();
    expect(report.log?.length).toBeGreaterThan(0);
  });

  it('runs siege engines phase against fortified defenders', () => {
    // Attacker has mangonel (siege), defender has walls
    const attacker = createArmy('att_siege', 'lord_att', [
      { unitId: 'sie_mangonneaux_a_contrepoids', count: 5 },
      { unitId: 'inf_gardes_de_la_cite', count: 20 },
    ]);
    const defender = createArmy('def_fort', 'lord_def', [
      { unitId: 'inf_miliciens_garnison', count: 25 },
    ]);
    const province = createMockProvince({
      buildings: [{ type: 'walls', level: 2 }],
    });

    const report = resolveBattle(attacker, defender, province, 42);

    expect(report.winnerId).toBeDefined();
    // Check siege phase log entries
    const siegeLog = report.log?.some(l => l.toLowerCase().includes('siège') || l.toLowerCase().includes('bombardement'));
    expect(siegeLog).toBe(true);
  });

  it('inflicts pre-contact casualties during ranged phase', () => {
    // 40 archers longs gallois vs 20 paysans armes
    const attacker = createArmy('att_archers', 'lord_att', [
      { unitId: 'ran_archers_longs_gallois', count: 40 },
    ]);
    const defender = createArmy('def_inf', 'lord_def', [
      { unitId: 'inf_paysans_armes', count: 20 },
    ]);
    const province = createMockProvince({ buildings: [] });

    const report = resolveBattle(attacker, defender, province, 999);

    expect(report.winnerId).toBe('lord_att');
    const rangedLog = report.log?.some(l => l.toLowerCase().includes('tir') || l.toLowerCase().includes('volée'));
    expect(rangedLog).toBe(true);
  });

  it('applies cavalry charge multiplier and shock', () => {
    // Chevaliers feodaux charging peasants
    const attacker = createArmy('att_knights', 'lord_att', [
      { unitId: 'cav_chevaliers_feodaux', count: 15 },
    ]);
    const defender = createArmy('def_levy', 'lord_def', [
      { unitId: 'inf_paysans_armes', count: 30 },
    ]);
    const province = createMockProvince({ buildings: [] });

    const report = resolveBattle(attacker, defender, province, 777);

    expect(report.winnerId).toBe('lord_att');
    const chargeLog = report.log?.some(l => l.toLowerCase().includes('charge') || l.toLowerCase().includes('choc'));
    expect(chargeLog).toBe(true);
  });

  it('applies counter bonuses (e.g. piquiers flamands counter cavalry)', () => {
    // Pikemen have counter bonus against cavalry
    const cavAttacker = createArmy('att_cav', 'lord_att', [
      { unitId: 'cav_eclaireurs_montes', count: 20 },
    ]);
    const pikeDefender = createArmy('def_pike', 'lord_def', [
      { unitId: 'inf_piquiers_flamands', count: 20 },
    ]);
    const province = createMockProvince({ buildings: [] });

    const report = resolveBattle(cavAttacker, pikeDefender, province, 54321);

    // Pikemen with counters should defeat or hold light cavalry
    expect(report.winnerId).toBe('lord_def');
  });

  it('loots resources from the province when attacker wins', () => {
    const attacker = createArmy('att_victor', 'lord_att', [
      { unitId: 'cav_chevaliers_feodaux', count: 40 },
    ]);
    const defender = createArmy('def_weak', 'lord_def', [
      { unitId: 'inf_paysans_armes', count: 2 },
    ]);
    const province = createMockProvince({
      resources: { gold: 1000, food: 2000, wood: 1000, stone: 800, iron: 500 },
    });

    const report = resolveBattle(attacker, defender, province, 100);

    expect(report.winnerId).toBe('lord_att');
    // Looted resources should be non-zero (up to 25%)
    expect(report.lootedResources.gold).toBeGreaterThan(0);
    expect(report.lootedResources.food).toBeGreaterThan(0);
    expect(report.lootedResources.gold).toBeLessThanOrEqual(250);
  });

  it('does NOT loot resources if defender repels the attack', () => {
    const attacker = createArmy('att_weak', 'lord_att', [
      { unitId: 'inf_paysans_armes', count: 2 },
    ]);
    const defender = createArmy('def_strong', 'lord_def', [
      { unitId: 'inf_gardes_royaux', count: 50 },
    ]);
    const province = createMockProvince({
      resources: { gold: 1000, food: 2000, wood: 1000, stone: 800, iron: 500 },
    });

    const report = resolveBattle(attacker, defender, province, 100);

    expect(report.winnerId).toBe('lord_def');
    expect(report.lootedResources.gold).toBe(0);
    expect(report.lootedResources.food).toBe(0);
  });
});
