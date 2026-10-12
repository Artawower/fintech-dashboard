import type { InstrumentStatistics } from '@app/core/models/instrument-statistics.model';

export class InstrumentMismatchError extends Error {
  public constructor(updateInstrument: number, statisticsInstrument: number) {
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

export function createInstrumentStatistics(instrumentIndex: number): InstrumentStatistics {
  return {
    instrumentIndex,
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
  instrumentIndex: number,
  priceCents: number,
  tradeQuantity: number,
  bidCents: number,
  askCents: number,
  bidQuantity: number,
  askQuantity: number,
): InstrumentStatistics {
  if (current.instrumentIndex !== instrumentIndex) {
    throw new InstrumentMismatchError(instrumentIndex, current.instrumentIndex);
  }

  assertIntegers(current.totalTradeValue, priceCents);
  assertNonNegative(current.totalTradeValue);
  assertPositive(priceCents);
  const spreadCents = calculateBidAskSpread(bidCents, askCents);
  const tradingVolume = sumTradingVolume(current.tradingVolume, tradeQuantity);
  const totalTradeValue = current.totalTradeValue + priceCents * tradeQuantity;
  assertIntegers(totalTradeValue);
  assertNonNegative(totalTradeValue);

  return {
    instrumentIndex,
    lastPriceCents: priceCents,
    spreadCents,
    tradingVolume,
    totalTradeValue,
    vwapCents: calculateVWAP(totalTradeValue, tradingVolume),
    orderBookImbalance: calculateOrderBookImbalance(bidQuantity, askQuantity),
  };
}
