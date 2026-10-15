import {
  calculateBidAskSpread,
  calculateOrderBookImbalance,
  calculateVWAP,
  InvalidPriceRange,
  sumTradingVolume,
} from './market-statistic';

test('sumTradingVolume adds a trade quantity to the current volume', () => {
  expect(sumTradingVolume(0, 30)).toBe(30);
});

test('sumTradingVolume preserves the existing volume when adding a trade', () => {
  expect(sumTradingVolume(40, 30)).toBe(70);
});

test('sumTradingVolume rejects an invalid current volume', () => {
  [-1, 1.5, NaN, Infinity].forEach((volume) => {
    expect(() => sumTradingVolume(volume, 1)).toThrow(RangeError);
  });
});

test('sumTradingVolume rejects an invalid trade quantity', () => {
  [0, -1, 1.5, NaN, Infinity].forEach((quantity) => {
    expect(() => sumTradingVolume(0, quantity)).toThrow(RangeError);
  });
});

test('sumTradingVolume rejects a total beyond the safe integer range', () => {
  expect(() => sumTradingVolume(Number.MAX_SAFE_INTEGER, 1)).toThrow(RangeError);
});

test('calculateBidAskSpread calculates the bid–ask spread', () => {
  expect(calculateBidAskSpread(10196, 10200)).toBe(4);
});

test('calculateBidAskSpread rejects an ask price below the bid price', () => {
  expect(() => calculateBidAskSpread(10200, 10196)).toThrow(InvalidPriceRange);
});

test('calculateBidAskSpread rejects equal bid and ask prices', () => {
  expect(() => calculateBidAskSpread(10200, 10200)).toThrow(InvalidPriceRange);
});

test('calculateBidAskSpread rejects negative prices and zero', () => {
  [
    [-5, 10],
    [10, -5],
    [-10, -5],
    [0, 10],
  ].forEach(([bid, ask]) => {
    expect(() => calculateBidAskSpread(bid, ask)).toThrow(RangeError);
  });
});

test('calculateBidAskSpread rejects non-integer or non-finite prices', () => {
  [
    [12.5, 13],
    [12, 13.2],
    [22.8, 23.1],
    [NaN, 10],
    [10, NaN],
    [NaN, NaN],
    [10, Infinity],
    [Infinity, 10],
    [Number.MAX_SAFE_INTEGER + 1, 10],
  ].forEach(([bid, ask]) => {
    expect(() => calculateBidAskSpread(bid, ask)).toThrow(RangeError);
  });
});

test('calculateVWAP uses all trades since the current run started', () => {
  const totalTradeValue = 10000 * 10 + 10200 * 30;
  expect(calculateVWAP(totalTradeValue, 40)).toBe(10150);
});

test('calculateVWAP calculates VWAP for a single trade', () => {
  expect(calculateVWAP(10200 * 30, 30)).toBe(10200);
});

test('calculateVWAP returns unavailable when total trade quantity is zero', () => {
  expect(calculateVWAP(0, 0)).toBeNull();
});

test('calculateVWAP rejects zero trade value when trade quantity is positive', () => {
  expect(() => calculateVWAP(0, 1)).toThrow(RangeError);
});

test('calculateVWAP preserves fractional cents for display rounding', () => {
  expect(calculateVWAP(4, 3)).toBeCloseTo(4 / 3);
});

test('calculateVWAP rejects negative total trade value or quantity', () => {
  [
    [-1, 1],
    [1, -1],
  ].forEach(([totalTradeValue, totalTradeQuantity]) => {
    expect(() => calculateVWAP(totalTradeValue, totalTradeQuantity)).toThrow(RangeError);
  });
});

test('calculateVWAP rejects values that are not safe integers', () => {
  [
    [1.5, 2],
    [2, 1.5],
    [NaN, 1],
    [1, Infinity],
    [Number.MAX_SAFE_INTEGER + 1, 1],
  ].forEach(([totalTradeValue, totalTradeQuantity]) => {
    expect(() => calculateVWAP(totalTradeValue, totalTradeQuantity)).toThrow(RangeError);
  });
});

test('calculateOrderBookImbalance uses the latest bid and ask quantities', () => {
  expect(calculateOrderBookImbalance(600, 400)).toBeCloseTo(0.2);
});

test('calculateOrderBookImbalance returns a negative imbalance when ask quantity is larger', () => {
  expect(calculateOrderBookImbalance(400, 600)).toBeCloseTo(-0.2);
});

test('calculateOrderBookImbalance returns zero when bid and ask quantities are equal', () => {
  expect(calculateOrderBookImbalance(400, 400)).toBe(0);
});

test('calculateOrderBookImbalance returns the imbalance bounds for a one-sided book', () => {
  expect(calculateOrderBookImbalance(600, 0)).toBe(1);
  expect(calculateOrderBookImbalance(0, 400)).toBe(-1);
});

test('calculateOrderBookImbalance returns unavailable when both book quantities are zero', () => {
  expect(calculateOrderBookImbalance(0, 0)).toBeNull();
});

test('calculateOrderBookImbalance rejects negative quantities', () => {
  [
    [-1, 10],
    [10, -1],
    [-1, -1],
  ].forEach(([bidQuantity, askQuantity]) => {
    expect(() => calculateOrderBookImbalance(bidQuantity, askQuantity)).toThrow(RangeError);
  });
});

test('calculateOrderBookImbalance rejects values that are not safe integers', () => {
  [
    [1.5, 2],
    [2, 1.5],
    [NaN, 1],
    [1, Infinity],
    [Number.MAX_SAFE_INTEGER + 1, 1],
  ].forEach(([bidQuantity, askQuantity]) => {
    expect(() => calculateOrderBookImbalance(bidQuantity, askQuantity)).toThrow(RangeError);
  });
});

test('calculateOrderBookImbalance rejects a combined quantity beyond the safe integer range', () => {
  expect(() => calculateOrderBookImbalance(Number.MAX_SAFE_INTEGER, 1)).toThrow(RangeError);
});
