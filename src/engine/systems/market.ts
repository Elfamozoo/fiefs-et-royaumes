/**
 * Fiefs & Royaumes - Global Market System
 *
 * Implements the dynamic global commodity market where prices fluctuate
 * based on the law of supply and demand across all lords (player + AI).
 * Faithful reproduction of the original Fiefs & Royaumes market mechanics.
 */

import type { GameState, MarketCommodity, ResourceType, TradeResult } from '../types';

/**
 * Default liquidity constant per commodity.
 * A liquidity of 1000 means a net trade of 1000 units moves the price by 100%.
 */
const DEFAULT_LIQUIDITY = 1000;

/**
 * Initial market state with historical base prices for the Terres de Kald.
 * Prices are in gold ecus per unit.
 */
export const INITIAL_MARKET: Record<ResourceType, MarketCommodity> = {
  gold: {
    resource: 'gold',
    basePrice: 1.0,
    currentPrice: 1.0,
    priceHistory: [1.0],
    monthlySupply: 0,
    monthlyDemand: 0,
    liquidity: DEFAULT_LIQUIDITY,
  },
  food: {
    resource: 'food',
    basePrice: 2.0,
    currentPrice: 2.0,
    priceHistory: [2.0],
    monthlySupply: 0,
    monthlyDemand: 0,
    liquidity: DEFAULT_LIQUIDITY,
  },
  wood: {
    resource: 'wood',
    basePrice: 3.0,
    currentPrice: 3.0,
    priceHistory: [3.0],
    monthlySupply: 0,
    monthlyDemand: 0,
    liquidity: DEFAULT_LIQUIDITY,
  },
  stone: {
    resource: 'stone',
    basePrice: 5.0,
    currentPrice: 5.0,
    priceHistory: [5.0],
    monthlySupply: 0,
    monthlyDemand: 0,
    liquidity: DEFAULT_LIQUIDITY,
  },
  iron: {
    resource: 'iron',
    basePrice: 10.0,
    currentPrice: 10.0,
    priceHistory: [10.0],
    monthlySupply: 0,
    monthlyDemand: 0,
    liquidity: DEFAULT_LIQUIDITY,
  },
};

/**
 * Maximum number of price history entries kept per commodity.
 */
const MAX_PRICE_HISTORY = 24;

/**
 * Executes a market trade (buy or sell) for a lord.
 *
 * This function mutates the state in-place for market tracking purposes
 * (monthlyDemand / monthlySupply, lord gold, province resource), consistent
 * with the original game's design where the market is a shared global object.
 *
 * The returned TradeResult.state holds the same reference as the input state.
 *
 * @param state  Current game state
 * @param lordId ID of the lord performing the trade
 * @param provinceId ID of the province where the trade is based
 * @param resource Commodity to buy/sell (cannot be 'gold')
 * @param amount Number of units to trade (must be > 0)
 * @param isBuy true = buying from market, false = selling to market
 */
export function executeMarketTrade(
  state: GameState,
  lordId: string,
  provinceId: string,
  resource: ResourceType,
  amount: number,
  isBuy: boolean
): TradeResult {
  const failResult = (message: string): TradeResult => ({
    success: false,
    lordId,
    resource,
    amount,
    isBuy,
    totalCost: 0,
    newPrice: state.market[resource]?.currentPrice ?? 0,
    message,
    state,
  });

  // Validate: gold is not a tradeable commodity
  if (resource === 'gold') {
    return failResult('Cannot trade gold as a market commodity.');
  }

  // Validate amount
  if (amount <= 0) {
    return failResult('Trade amount must be a positive integer.');
  }

  const lord = state.lords[lordId];
  if (!lord) {
    return failResult(`Lord '${lordId}' not found.`);
  }

  const province = state.provinces[provinceId];
  if (!province) {
    return failResult(`Province '${provinceId}' not found.`);
  }

  const commodity = state.market[resource];
  const totalCost = Math.round(commodity.currentPrice * amount);

  if (isBuy) {
    // Check the lord has enough gold
    if (lord.gold < totalCost) {
      return failResult(
        `Insufficient gold: need ${totalCost} écus, have ${lord.gold}.`
      );
    }

    // Apply trade: deduct gold, add resource to province, track demand
    lord.gold -= totalCost;
    province.resources[resource] += amount;
    commodity.monthlyDemand += amount;

    return {
      success: true,
      lordId,
      resource,
      amount,
      isBuy: true,
      totalCost,
      newPrice: commodity.currentPrice,
      message: `Bought ${amount} ${resource} for ${totalCost} écus.`,
      state,
    };
  } else {
    // Sell: check province has enough resource
    if (province.resources[resource] < amount) {
      return failResult(
        `Insufficient resource: need ${amount} ${resource}, province has ${province.resources[resource]}.`
      );
    }

    // Apply trade: deduct resource, add gold to lord, track supply
    province.resources[resource] -= amount;
    lord.gold += totalCost;
    commodity.monthlySupply += amount;

    return {
      success: true,
      lordId,
      resource,
      amount,
      isBuy: false,
      totalCost,
      newPrice: commodity.currentPrice,
      message: `Sold ${amount} ${resource} for ${totalCost} écus.`,
      state,
    };
  }
}

/**
 * Updates all commodity prices based on monthly supply/demand balance,
 * appends to price history (capped at MAX_PRICE_HISTORY entries),
 * and resets monthly counters.
 *
 * Formula:
 *   P_new = max(1, round(P_current * (1 + (demand - supply) / liquidity)))
 *
 * Pure immutable: returns a new GameState with updated market.
 */
export function updateMarketPrices(state: GameState): GameState {
  const nextMarket: Record<ResourceType, MarketCommodity> = { ...state.market };

  for (const key of Object.keys(state.market) as ResourceType[]) {
    const commodity = state.market[key];
    const liquidity = commodity.liquidity ?? DEFAULT_LIQUIDITY;

    const elasticity = (commodity.monthlyDemand - commodity.monthlySupply) / liquidity;
    const rawPrice = commodity.currentPrice * (1 + elasticity);
    const newPrice = Math.max(1, Math.round(rawPrice));

    // Append current price to history, cap at MAX_PRICE_HISTORY
    const updatedHistory = [...commodity.priceHistory, newPrice];
    const cappedHistory =
      updatedHistory.length > MAX_PRICE_HISTORY
        ? updatedHistory.slice(updatedHistory.length - MAX_PRICE_HISTORY)
        : updatedHistory;

    nextMarket[key] = {
      ...commodity,
      currentPrice: newPrice,
      priceHistory: cappedHistory,
      monthlySupply: 0,
      monthlyDemand: 0,
    };
  }

  return {
    ...state,
    market: nextMarket,
  };
}
