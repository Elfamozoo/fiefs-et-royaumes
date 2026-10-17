/**
 * Fiefs & Royaumes - Core Domain Types
 * Terres de Kald Simulation Engine
 */

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export type ResourceType = 'gold' | 'food' | 'wood' | 'stone' | 'iron';

export type Resources = Record<ResourceType, number>;

export type TaxRate = 'low' | 'moderate' | 'high' | 'extortion';

export type UnitFamily = 'infantry' | 'ranged' | 'cavalry' | 'exotic' | 'siege';

export interface UnitUpkeep {
  gold: number;
  food: number;
}

export type UnitCost = Partial<Record<ResourceType, number>> & {
  gold: number;
};

export interface UnitDefinition {
  id: string;
  name: string;
  family: UnitFamily;
  description: string;
  attack: number;
  defense: number;
  rangedAttack: number;
  armor: number;
  speed: number;
  morale: number;
  cost: UnitCost;
  upkeep: UnitUpkeep;
  tier: 1 | 2 | 3 | 4;
  counters?: Partial<Record<UnitFamily, number>>;
}

export interface Regiment {
  unitId: string;
  count: number;
  experience?: number;
}

export interface Army {
  id: string;
  lordId: string;
  name: string;
  provinceId: string;
  regiments: Regiment[];
}

export type Biome = 'plains' | 'forest' | 'hills' | 'mountains' | 'marsh' | 'coast' | 'desert';

export interface Coordinates {
  x: number;
  y: number;
}

export type BuildingType = 'barracks' | 'walls' | 'granary' | 'market' | 'forge' | 'watchtower' | 'port';

export interface ProvinceBuilding {
  type: BuildingType;
  level: number;
}

export interface Province {
  id: string;
  name: string;
  lordId: string | null;
  biome: Biome;
  population: number;
  morale: number; // 0 to 100
  taxRate: TaxRate;
  resources: Resources;
  buildings: ProvinceBuilding[];
  connections: string[];
  coordinates: Coordinates;
}

export type LordArchetype = 'conqueror' | 'merchant' | 'diplomat' | 'traditionalist';

export interface LordHeraldry {
  shield: string;
  charge: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface Lord {
  id: string;
  name: string;
  isPlayer: boolean;
  archetype: LordArchetype;
  actionPoints: number; // Plafond 40 PA
  gold: number;
  suzerainId: string | null;
  vassals: string[];
  heraldry: LordHeraldry;
}

export interface MarketCommodity {
  resource: ResourceType;
  basePrice: number;
  currentPrice: number;
  priceHistory: number[];
  monthlySupply: number;
  monthlyDemand: number;
}

export interface BattleReport {
  attackerId: string;
  defenderId: string;
  provinceId: string;
  initialAttacker: Regiment[];
  initialDefender: Regiment[];
  finalAttacker: Regiment[];
  finalDefender: Regiment[];
  winnerId: string | null;
  lootedResources: Resources;
  rounds?: number;
  log?: string[];
}

export interface Rumor {
  id: string;
  authorId: string;
  authorName?: string;
  text: string;
  month: number;
  season: Season;
}

export interface Message {
  id: string;
  fromLordId: string;
  toLordId: string;
  content: string;
  month: number;
  read: boolean;
}

export type DiplomaticTreaty = 'non_aggression' | 'defensive_alliance' | 'war' | 'vassalage';

export interface DiplomacyRelation {
  lordA: string;
  lordB: string;
  treaty: DiplomaticTreaty;
  tributeRate?: number;
}

export type SpyMissionType = 'infiltrate' | 'scout_army' | 'sabotage' | 'assassinate';

export interface SpyMission {
  id: string;
  lordId: string;
  targetProvinceId: string;
  missionType: SpyMissionType;
}

export interface SpyResult {
  success: boolean;
  captured: boolean;
  details: string;
  intel?: unknown;
}

export interface TradeResult {
  success: boolean;
  lordId: string;
  resource: ResourceType;
  amount: number;
  isBuy: boolean;
  totalCost: number;
  newPrice: number;
  message: string;
}

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export interface GameState {
  month: number;
  season: Season;
  lords: Record<string, Lord>;
  provinces: Record<string, Province>;
  armies: Record<string, Army>;
  market: Record<ResourceType, MarketCommodity>;
  rumors: Rumor[];
  messages: Message[];
  playerLordId: string;
}
