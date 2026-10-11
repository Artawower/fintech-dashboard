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
