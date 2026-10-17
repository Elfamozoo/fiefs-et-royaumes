# Task 2 Brief: Core Domain Types & Data Constants

## Deliverables
- `src/engine/types.ts`: Comprehensive, strictly typed domain interfaces:
  - `Season` ('spring' | 'summer' | 'autumn' | 'winter')
  - `ResourceType` ('gold' | 'food' | 'wood' | 'stone' | 'iron')
  - `Resources` (Record<ResourceType, number>)
  - `TaxRate` ('low' | 'moderate' | 'high' | 'extortion')
  - `UnitFamily` ('infantry' | 'ranged' | 'cavalry' | 'exotic' | 'siege')
  - `UnitDefinition` (id, name, family, description, attack, defense, rangedAttack, armor, speed, morale, cost, upkeep { gold, food }, tier, counters)
  - `Regiment` (unitId, count)
  - `Army` (id, lordId, name, provinceId, regiments)
  - `Province` (id, name, lordId, biome, population, morale, taxRate, resources, buildings, connections, coordinates)
  - `LordArchetype` ('conqueror' | 'merchant' | 'diplomat' | 'traditionalist')
  - `Lord` (id, name, isPlayer, archetype, actionPoints, gold, suzerainId, vassals, heraldry)
  - `MarketCommodity` (resource, basePrice, currentPrice, priceHistory, monthlySupply, monthlyDemand)
  - `BattleReport` (attackerId, defenderId, provinceId, initialAttacker, initialDefender, finalAttacker, finalDefender, winnerId, lootedResources)
  - `GameState` (month, season, lords, provinces, armies, market, rumors, messages, playerLordId)
- `src/engine/data/units.ts`: Authentic catalogue of at least 100 distinct units:
  - Infanterie (Piquiers, Hallebardiers, Hommes d'armes, Épéistes, Massiers, Gardes royaux, Miliciens...)
  - Tirailleurs (Archers courts, Archers longs gallois, Arbalétriers génois, Arbalétriers lourds, Frondeurs...)
  - Cavalerie (Chevaliers féodaux, Écuyers montés, Hussards, Cataphractes, Chevau-légers, Archers montés...)
  - Unités régionales & exotiques de Kald (Samouraïs, Ronins, Guerriers du désert, Berserkers nordiques, Gardes prétoriens, Janissaires...)
  - Engins de siège (Béliers de sape, Balistes lourdes, Catapultes de siège, Trébuchets royaux, Mangonneaux, Tours de siège...)
- `src/engine/data/provinces.ts`: Map of the Terres de Kald with at least 15-20 interconnected provinces, biomes, starting populations, coordinates, and resources.
- `src/engine/__tests__/data.test.ts`: TDD test suite validating that:
  - `UNIT_CATALOGUE` has at least 100 valid unit definitions.
  - Every unit definition has valid attack, defense, upkeep, cost, and belongs to one of the 5 families.
  - `INITIAL_PROVINCES` has interconnected provinces with valid biomes and coordinates.

## TDD Workflow
1. Write the test `src/engine/__tests__/data.test.ts` first.
2. Run test to verify RED: `npx vitest run src/engine/__tests__/data.test.ts`.
3. Implement `src/engine/types.ts`, `src/engine/data/units.ts`, `src/engine/data/provinces.ts`.
4. Run test to verify GREEN: `npx vitest run src/engine/__tests__/data.test.ts`.
5. Run full test suite: `npx vitest run`.
6. Commit: `feat(engine): define core types, 100+ units catalogue, and provinces map`.
7. Report file: `.superpowers/sdd/2026-10-17-fiefs-et-royaumes-implementation/task-2-report.md`.
