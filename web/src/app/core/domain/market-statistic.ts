import type { InstrumentStatistics } from '../models/instrument-statistics.model';
import type { MarketUpdate } from '../models/market-update.model';

export class InstrumentMismatchError extends Error {
  public constructor(updateInstrument: string, statisticsInstrument: string) {
    super(
      `Cannot apply an update for instrument "${updateInstrument}" to statistics for "${statisticsInstrument}".`,
    );
    this.name = 'InstrumentMismatchError';
  }
}

export class InvalidPriceRange extends Error {
  public constructor(bidPrice: number, askPrice: number) {
    super(`Invalid price range: ask price ${askPrice} must be greater than bid price ${bidPrice}.`);
  }
}

function assertIntegers(...values: number[]): void {
  const invalidValues = values.filter((value) => !Number.isSafeInteger(value));
  if (invalidValues.length) {
    throw new RangeError(`Values must be safe integers: ${invalidValues.join(', ')}.`);
  }
}

function assertNonNegative(...values: number[]): void {
  const invalidValues = values.filter((value) => value < 0);
  if (invalidValues.length) {
    throw new RangeError(`Values must be non-negative: ${invalidValues.join(', ')}.`);
  }
}

function assertPositive(...values: number[]): void {
  const invalidValues = values.filter((value) => value <= 0);
  if (invalidValues.length) {
    throw new RangeError(`Values must be positive: ${invalidValues.join(', ')}.`);
  }
}

export function calculateBidAskSpread(bidPrice: number, askPrice: number): number {
  assertIntegers(bidPrice, askPrice);
  assertPositive(bidPrice, askPrice);

  if (bidPrice >= askPrice) {
    throw new InvalidPriceRange(bidPrice, askPrice);
  }
  return askPrice - bidPrice;
}

export function sumTradingVolume(currentVolume: number, tradeQuantity: number): number {
  assertIntegers(currentVolume, tradeQuantity);
  assertNonNegative(currentVolume);
  assertPositive(tradeQuantity);

  const totalVolume = currentVolume + tradeQuantity;
  assertIntegers(totalVolume);
  assertNonNegative(totalVolume);
  return totalVolume;
}

/*
 * Volume-weighted average price (VWAP)
 * sum(tradePrice × tradeQuantity) / sum(tradeQuantity)
 * since the current run started. Larger trades contribute more.
 */
export function calculateVWAP(totalTradeValue: number, totalTradeQuantity: number): number | null {
  assertIntegers(totalTradeValue, totalTradeQuantity);
  assertNonNegative(totalTradeValue, totalTradeQuantity);

  if (totalTradeQuantity === 0) {
    return null;
  }

  assertPositive(totalTradeValue);
  return totalTradeValue / totalTradeQuantity;
}

/*
 * (bidQuantity − askQuantity) / (bidQuantity + askQuantity)
 * using the latest available buying and selling quantities.
 */
export function calculateOrderBookImbalance(
  bidQuantity: number,
  askQuantity: number,
): number | null {
  assertIntegers(bidQuantity, askQuantity);
  assertNonNegative(bidQuantity, askQuantity);

  const totalQuantity = bidQuantity + askQuantity;
  assertIntegers(totalQuantity);

  if (totalQuantity === 0) {
    return null;
  }

  return (bidQuantity - askQuantity) / totalQuantity;
}

export function createInstrumentStatistics(instrument: string): InstrumentStatistics {
  return {
    instrument,
    lastPriceCents: null,
    spreadCents: null,
    tradingVolume: 0,
    totalTradeValue: 0,
    vwapCents: null,
    orderBookImbalance: null,
  };
}

export function updateInstrumentStatistics(
  current: InstrumentStatistics,
  update: MarketUpdate,
): InstrumentStatistics {
  if (current.instrument !== update.instrument) {
    throw new InstrumentMismatchError(update.instrument, current.instrument);
  }

  assertIntegers(current.totalTradeValue, update.priceCents);
  assertNonNegative(current.totalTradeValue);
  assertPositive(update.priceCents);
  const spreadCents = calculateBidAskSpread(update.bidCents, update.askCents);
  const tradingVolume = sumTradingVolume(current.tradingVolume, update.tradeQuantity);
  const totalTradeValue = current.totalTradeValue + update.priceCents * update.tradeQuantity;
  assertIntegers(totalTradeValue);
  assertNonNegative(totalTradeValue);

  return {
    instrument: update.instrument,
    lastPriceCents: update.priceCents,
    spreadCents,
    tradingVolume,
    totalTradeValue,
    vwapCents: calculateVWAP(totalTradeValue, tradingVolume),
    orderBookImbalance: calculateOrderBookImbalance(update.bidQuantity, update.askQuantity),
  };
}
