# Task 3 Brief: Time & Seasons System

## Deliverables
- `src/engine/systems/time.ts`:
  - `advanceMonth(state: GameState): GameState` (pure immutable state transformation)
  - `getSeasonForMonth(month: number): Season`
    - Month 1-3: 'spring'
    - Month 4-6: 'summer'
    - Month 7-9: 'autumn'
    - Month 10-12: 'winter'
    - Cycles continuously (e.g. Month 13 is 'spring', 16 is 'summer', etc.)
  - `MAX_ACTION_POINTS = 40`
  - `MONTHLY_PA_GAIN = 10`
  - For every lord in `state.lords`:
    - Increment `actionPoints = Math.min(MAX_ACTION_POINTS, lord.actionPoints + MONTHLY_PA_GAIN)`
  - `SeasonalModifiers`:
    - harvestMultiplier (e.g., spring: 1.0, summer: 1.2, autumn: 1.5, winter: 0.6)
    - foodConsumptionMultiplier (e.g., spring: 1.0, summer: 1.0, autumn: 1.0, winter: 1.3)
    - travelCostPenalty (e.g., winter: +1 PA or +50% cost due to snow/mud)
  - `getSeasonalModifiers(season: Season): SeasonalModifiers`
- `src/engine/systems/__tests__/time.test.ts`: TDD test suite validating:
  - Month increments properly from 1 to 2, 2 to 3, etc.
  - Season correctly cycles through spring, summer, autumn, winter across multiple years.
  - Every lord gains +10 PA up to maximum 40 PA.
  - Lords with 35 PA reach 40 PA (not 45).
  - Lords already at 40 PA stay at 40 PA.
  - Immutability: original state is not mutated, a new state is returned.
  - Seasonal modifiers return correct values for all 4 seasons.

## TDD Workflow
1. Write `src/engine/systems/__tests__/time.test.ts` first.
2. Run test to verify RED: `npx vitest run src/engine/systems/__tests__/time.test.ts`.
3. Implement `src/engine/systems/time.ts` and re-export in `src/engine/index.ts`.
4. Run test to verify GREEN: `npx vitest run src/engine/systems/__tests__/time.test.ts`.
5. Run full test suite: `npx vitest run`.
6. Commit: `feat(engine): implement month advancement, seasons, and PA regeneration`.
7. Report file: `.superpowers/sdd/2026-10-17-fiefs-et-royaumes-implementation/task-3-report.md`.
