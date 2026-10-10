export class InvalidPriceRange extends Error {
  public constructor(bidPrice: number, askPrice: number) {
    super();
    this.message = `Invalid price range: ask price ${askPrice} must be greater than bid price ${bidPrice}.`;
  }
}

export class NegativePrice extends Error {
  public constructor(prices: number[]) {
    super();
    this.message = `Invalid prices: ${prices.join(', ')} must be a non-negative`;
  }
}

function assertNonNegative(...args: number[]): void {
  const invalidPrices = args.filter((p) => p <= 0);
  if (invalidPrices.length) {
    throw new NegativePrice(invalidPrices);
  }
}

export class InvalidPriceType extends Error {
  public constructor(prices: number[]) {
    super();
    this.message = `Invalid prices: ${prices.join(', ')} must be an integer`;
  }
}

function assertIntegers(...args: number[]): void {
  const invalidPrices = args.filter(
    (p) => !Number.isInteger(p) || Number.isNaN(p) || !Number.isFinite(p),
  );
  if (invalidPrices.length) {
    throw new NegativePrice(invalidPrices);
  }
}

export function calculateBidAskSpread(bidPrice: number, askPrice: number): number {
  assertNonNegative(bidPrice, askPrice);
  assertIntegers(bidPrice, askPrice);

  if (bidPrice >= askPrice) {
    throw new InvalidPriceRange(bidPrice, askPrice);
  }
  return askPrice - bidPrice;
}
