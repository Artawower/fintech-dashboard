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

function assertInteger(value: number): void {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`Value must be a safe integer: ${value}.`);
  }
}

function assertNonNegative(value: number): void {
  if (value < 0) {
    throw new RangeError(`Value must be non-negative: ${value}.`);
  }
}

function assertPositive(value: number): void {
  if (value <= 0) {
    throw new RangeError(`Value must be positive: ${value}.`);
  }
}

export function calculateBidAskSpread(bidPrice: number, askPrice: number): number {
  assertInteger(bidPrice);
  assertInteger(askPrice);
  assertPositive(bidPrice);
  assertPositive(askPrice);

  if (bidPrice >= askPrice) {
    throw new InvalidPriceRange(bidPrice, askPrice);
  }
  return askPrice - bidPrice;
}

export function sumTradingVolume(currentVolume: number, tradeQuantity: number): number {
  assertInteger(currentVolume);
  assertInteger(tradeQuantity);
  assertNonNegative(currentVolume);
  assertPositive(tradeQuantity);

  const totalVolume = currentVolume + tradeQuantity;
  assertInteger(totalVolume);
  assertNonNegative(totalVolume);
  return totalVolume;
}

/*
 * Volume-weighted average price (VWAP)
 * sum(tradePrice × tradeQuantity) / sum(tradeQuantity)
 * since the current run started. Larger trades contribute more.
 */
export function calculateVWAP(totalTradeValue: number, totalTradeQuantity: number): number | null {
  assertInteger(totalTradeValue);
  assertInteger(totalTradeQuantity);
  assertNonNegative(totalTradeValue);
  assertNonNegative(totalTradeQuantity);

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
  assertInteger(bidQuantity);
  assertInteger(askQuantity);
  assertNonNegative(bidQuantity);
  assertNonNegative(askQuantity);

  const totalQuantity = bidQuantity + askQuantity;
  assertInteger(totalQuantity);

  if (totalQuantity === 0) {
    return null;
  }

  return (bidQuantity - askQuantity) / totalQuantity;
}
