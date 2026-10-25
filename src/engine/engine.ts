/**
 * Fiefs & Royaumes - Master Engine Orchestrator
 *
 * Coordinates all simulation subsystems into a coherent tick loop:
 * - Time & seasonal advancement
 * - Provincial taxation, demographics & agricultural yields
 * - Military upkeep & automatic desertion
 * - Feudal tribute redistribution
 * - Autonomous AI decision-making
 * - Dynamic commodity price adjustments
 * - Province battle resolutions
 */

import type { Army, GameState, Lord, Province, ResourceType } from './types';
import { INITIAL_PROVINCES } from './data/provinces';
import { advanceMonth } from './systems/time';
import { processEconomy } from './systems/economy';
import { INITIAL_MARKET, updateMarketPrices } from './systems/market';
import { processArmyUpkeep } from './systems/military';
import { resolveBattle } from './systems/battle';
import { processVassalTributes, sendPigeonMessage, postPublicRumor } from './systems/diplomacy';
import { simulateAITurns } from './systems/ai';

/**
 * Creates the initial game state for a new game in Terres de Kald.
 */
export function createInitialGameState(playerLordName: string = 'Seigneur de Kald'): GameState {
  const playerLordId = 'lord_player';

  const playerLord: Lord = {
    id: playerLordId,
    name: playerLordName,
    isPlayer: true,
    archetype: 'conqueror',
    actionPoints: 20,
    gold: 1000,
    suzerainId: null,
    vassals: [],
    heraldry: {
      shield: 'heater',
      charge: 'lion',
      primaryColor: '#c0392b',
      secondaryColor: '#f1c40f',
    },
  };

  const aiLords: Lord[] = [
    {
      id: 'lord_vane',
      name: 'Seigneur Vane le Conquérant',
      isPlayer: false,
      archetype: 'conqueror',
      actionPoints: 20,
      gold: 600,
      suzerainId: null,
      vassals: [],
      heraldry: {
        shield: 'heater',
        charge: 'sword',
        primaryColor: '#8e44ad',
        secondaryColor: '#2c3e50',
      },
    },
    {
      id: 'lord_aldous',
      name: 'Comte Aldous de la Guilde',
      isPlayer: false,
      archetype: 'merchant',
      actionPoints: 20,
      gold: 1200,
      suzerainId: null,
      vassals: [],
      heraldry: {
        shield: 'heater',
        charge: 'scale',
        primaryColor: '#f39c12',
        secondaryColor: '#ffffff',
      },
    },
    {
      id: 'lord_ysabeau',
      name: 'Princesse Ysabeau',
      isPlayer: false,
      archetype: 'diplomat',
      actionPoints: 20,
      gold: 750,
      suzerainId: null,
      vassals: [],
      heraldry: {
        shield: 'heater',
        charge: 'raven',
        primaryColor: '#2980b9',
        secondaryColor: '#ecf0f1',
      },
    },
    {
      id: 'lord_godefroy',
      name: 'Baron Godefroy l’Ancien',
      isPlayer: false,
      archetype: 'traditionalist',
      actionPoints: 20,
      gold: 900,
      suzerainId: null,
      vassals: [],
      heraldry: {
        shield: 'heater',
        charge: 'tower',
        primaryColor: '#27ae60',
        secondaryColor: '#7f8c8d',
      },
    },
  ];

  const lordsRecord: Record<string, Lord> = {
    [playerLord.id]: playerLord,
  };
  for (const lord of aiLords) {
    lordsRecord[lord.id] = lord;
  }

  // Clone provinces and assign fiefs
  const provincesRecord: Record<string, Province> = {};
  for (const p of INITIAL_PROVINCES) {
    provincesRecord[p.id] = {
      ...p,
      resources: { ...p.resources },
      buildings: p.buildings ? p.buildings.map(b => ({ ...b })) : [],
      connections: [...p.connections],
    };
  }

  // Assign starter provinces
  if (provincesRecord['prov_kaldheim']) provincesRecord['prov_kaldheim'].lordId = playerLordId;
  if (provincesRecord['prov_val_dor']) provincesRecord['prov_val_dor'].lordId = playerLordId;

  if (provincesRecord['prov_marches_d_ostmark']) provincesRecord['prov_marches_d_ostmark'].lordId = 'lord_vane';
  if (provincesRecord['prov_mont_dragon']) provincesRecord['prov_mont_dragon'].lordId = 'lord_vane';

  if (provincesRecord['prov_port_franc']) provincesRecord['prov_port_franc'].lordId = 'lord_aldous';
  if (provincesRecord['prov_castel_du_lac']) provincesRecord['prov_castel_du_lac'].lordId = 'lord_aldous';

  if (provincesRecord['prov_foret_noire']) provincesRecord['prov_foret_noire'].lordId = 'lord_ysabeau';
  if (provincesRecord['prov_dunes_d_azur']) provincesRecord['prov_dunes_d_azur'].lordId = 'lord_ysabeau';

  if (provincesRecord['prov_hautes_cimes']) provincesRecord['prov_hautes_cimes'].lordId = 'lord_godefroy';
  if (provincesRecord['prov_oasis_de_kald']) provincesRecord['prov_oasis_de_kald'].lordId = 'lord_godefroy';

  // Initial Armies
  const armiesRecord: Record<string, Army> = {
    army_player_starter: {
      id: 'army_player_starter',
      lordId: playerLordId,
      name: `Garde de ${playerLordName}`,
      provinceId: 'prov_kaldheim',
      regiments: [
        { unitId: 'inf_miliciens_garnison', count: 30 },
        { unitId: 'ran_archers_courts', count: 15 },
      ],
    },
    army_vane_starter: {
      id: 'army_vane_starter',
      lordId: 'lord_vane',
      name: 'Ost d’Acier de Vane',
      provinceId: 'prov_marches_d_ostmark',
      regiments: [
        { unitId: 'inf_miliciens_garnison', count: 40 },
        { unitId: 'cav_eclaireurs_montes', count: 10 },
      ],
    },
  };

  // Deep clone initial market
  const marketRecord = JSON.parse(JSON.stringify(INITIAL_MARKET));

  const baseState: GameState = {
    month: 1,
    season: 'spring',
    lords: lordsRecord,
    provinces: provincesRecord,
    armies: armiesRecord,
    market: marketRecord,
    rumors: [],
    messages: [],
    playerLordId,
  };

  // Initial welcome message & atmosphere rumors
  let stateWithMsgs = sendPigeonMessage(
    baseState,
    'system',
    playerLordId,
    `Bienvenue dans les Terres de Kald, Messire ${playerLordName}. Les coffres de Kaldheim sont ouverts et le peuple attend vos ordres.`
  );

  stateWithMsgs = postPublicRumor(
    stateWithMsgs,
    'lord_aldous',
    'La foire marchande de Port-Franc attire des caravanes venues d’au-delà des mers.'
  );

  stateWithMsgs = postPublicRumor(
    stateWithMsgs,
    'lord_vane',
    'Les fers sont chauds dans les forges d’Ostmark. Que ceux qui convoitent nos terres soient prévenus.'
  );

  return stateWithMsgs;
}

/**
 * Ticks the simulation forward by one full month.
 * Pure immutable transformation.
 */
export function tickGameState(state: GameState): GameState {
  // 1. Advance Month, Season, and regenerate Action Points
  let nextState = advanceMonth(state);

  // 2. Process Provincial Economy (Taxes, Food Consumption, Harvests)
  nextState = processEconomy(nextState);

  // 3. Process Military Upkeep and Desertion
  nextState = processArmyUpkeep(nextState);

  // 4. Feudal Tributes
  nextState = processVassalTributes(nextState);

  // 5. AI Lords Decision Loop
  nextState = simulateAITurns(nextState);

  // 6. Dynamic Market Elasticity
  nextState = updateMarketPrices(nextState);

  // 7. Resolve Battles if conflicting armies share a province
  const provinceArmiesMap: Record<string, Army[]> = {};
  for (const army of Object.values(nextState.armies)) {
    if (!provinceArmiesMap[army.provinceId]) {
      provinceArmiesMap[army.provinceId] = [];
    }
    provinceArmiesMap[army.provinceId].push(army);
  }

  for (const [provId, armies] of Object.entries(provinceArmiesMap)) {
    if (armies.length >= 2) {
      // Find two armies belonging to different lords
      const firstArmy = armies[0];
      const opposingArmy = armies.find(a => a.lordId !== firstArmy.lordId);

      if (opposingArmy) {
        const province = nextState.provinces[provId];
        if (province) {
          const report = resolveBattle(firstArmy, opposingArmy, province);

          // Update surviving armies
          const nextArmies = { ...nextState.armies };
          nextArmies[firstArmy.id] = {
            ...firstArmy,
            regiments: report.finalAttacker.filter(r => r.count > 0),
          };
          nextArmies[opposingArmy.id] = {
            ...opposingArmy,
            regiments: report.finalDefender.filter(r => r.count > 0),
          };

          // If army is wiped, remove it
          if (nextArmies[firstArmy.id].regiments.length === 0) {
            delete nextArmies[firstArmy.id];
          }
          if (nextArmies[opposingArmy.id].regiments.length === 0) {
            delete nextArmies[opposingArmy.id];
          }

          nextState = {
            ...nextState,
            armies: nextArmies,
          };
        }
      }
    }
  }

  return nextState;
}
