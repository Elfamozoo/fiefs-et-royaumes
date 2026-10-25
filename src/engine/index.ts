/**
 * Fiefs & Royaumes - Core Domain Engine
 * Isomorphic, pure deterministic domain simulation for Terres de Kald.
 */

export const ENGINE_VERSION = '0.1.0';

// Core domain types
export * from './types';

// Constants & Initial data catalogues
export * from './data/units';
export * from './data/provinces';

// Systems
export * from './systems/time';
export * from './systems/economy';
export * from './systems/market';
export * from './systems/military';
export * from './systems/battle';
export * from './systems/diplomacy';
export * from './systems/espionage';
