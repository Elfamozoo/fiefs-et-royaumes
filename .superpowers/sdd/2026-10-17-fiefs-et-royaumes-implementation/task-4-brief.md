# Task 4 Brief: Economy, Fiefs & Dynamic Market System

## Deliverables
- `src/engine/systems/economy.ts`:
  - `processEconomy(state: GameState): GameState` (pure immutable function):
    - For each province in `state.provinces`:
      - **Taxation:**
        - 'low': 5% of population in gold, morale +5/month
        - 'moderate': 15% of population in gold, morale +0/month
        - 'high': 25% of population in gold, morale -5/month
        - 'extortion': 40% of population in gold, morale -15/month
        - Morale clamped between 0 and 100.
        - Tax gold added to the province owner's treasury (`state.lords[province.lordId].gold`) if `province.lordId` exists.
      - **Food Consumption & Famine:**
        - Standard consumption: 1 food per 10 citizens, multiplied by seasonal food consumption modifier (winter +30%).
        - If `province.resources.food >= foodNeeded`:
          - Deduct food.
          - If morale >= 70, population growth of +1% to +2%.
        - If `province.resources.food < foodNeeded`:
          - Famine: all remaining food consumed.
          - Population drops by 5%.
          - Morale drops by 20.
      - **Resource Production (per month):**
        - Biome base yields:
          - plains: food 200, wood 50, stone 20, iron 10
          - forest: food 100, wood 250, stone 30, iron 10
          - mountains: food 40, wood 40, stone 250, iron 150
          - coastal: food 220, wood 60, stone 20, iron 10
          - swamp: food 80, wood 120, stone 40, iron 30
        - Food production multiplied by season harvest multiplier (spring 1.0, summer 1.2, autumn 1.5, winter 0.6).
        - Building multipliers (e.g. granary, market, barracks).
  - `setProvinceTaxRate(state: GameState, lordId: string, provinceId: string, newRate: TaxRate): GameState`:
    - Costs 1 PA. Verifies lord owns province and has >= 1 PA.
- `src/engine/systems/market.ts`:
  - `INITIAL_MARKET`: default prices for gold (1.0), food (2.0), wood (3.0), stone (5.0), iron (10.0), with liquidity.
  - `executeMarketTrade(state: GameState, lordId: string, provinceId: string, resource: ResourceType, amount: number, isBuy: boolean): TradeResult`:
    - Validates inputs (amount > 0, resource !== 'gold').
    - If buy: checks lord's gold >= total cost. Deducts gold, adds resource to province, increments `commodity.monthlyDemand += amount`.
    - If sell: checks province has >= amount of resource. Deducts resource, adds gold to lord, increments `commodity.monthlySupply += amount`.
  - `updateMarketPrices(state: GameState): GameState`:
    - Updates commodity prices based on supply vs demand elasticity:
      $$P_{new} = \max(1, \text{round}(P_{current} \times (1 + \frac{\text{demand} - \text{supply}}{\text{liquidity}})))$$
    - Appends `currentPrice` to `priceHistory` (capped at last 24 entries).
    - Resets `monthlySupply = 0` and `monthlyDemand = 0`.
- `src/engine/systems/__tests__/economy.test.ts`:
  - Validates tax income for all 4 tax rates.
  - Validates morale impact and 0-100 clamping.
  - Validates food consumption, famine triggers, population loss on starvation.
  - Validates seasonal harvest differences (autumn harvest > winter harvest).
  - Validates `setProvinceTaxRate` deduction of 1 PA.
- `src/engine/systems/__tests__/market.test.ts`:
  - Validates buying resource deducts gold and increases province inventory.
  - Validates selling resource adds gold and deducts province inventory.
  - Validates failure when buyer lacks gold or seller lacks resource.
  - Validates price increases when monthly demand exceeds supply.
  - Validates price drops when monthly supply exceeds demand.
  - Validates price history updates and limits.

## TDD Workflow
1. Write failing tests in `src/engine/systems/__tests__/economy.test.ts` and `market.test.ts`.
2. Run tests to verify RED.
3. Implement `economy.ts` and `market.ts`, re-export in `src/engine/index.ts`.
4. Run tests to verify GREEN.
5. Full test suite passes cleanly.
6. Commit: `feat(engine): implement fief taxation, food consumption, and dynamic global market`.
7. Report file: `.superpowers/sdd/2026-10-17-fiefs-et-royaumes-implementation/task-4-report.md`.
