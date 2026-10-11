import {
  calculateBidAskSpread,
  calculateVWAP,
  InvalidPriceRange,
  sumTradingVolume,
} from './market-statistic';

describe('Trading volume', () => {
  test('Should add a trade quantity to the current volume', () => {
    expect(sumTradingVolume(0, 30)).toBe(30);
  });

  test('Should preserve the existing volume when adding a trade', () => {
    expect(sumTradingVolume(40, 30)).toBe(70);
  });

  test('Should reject an invalid current volume', () => {
    [-1, 1.5, NaN, Infinity].forEach((volume) => {
      expect(() => sumTradingVolume(volume, 1)).toThrow(RangeError);
    });
  });

  test('Should reject an invalid trade quantity', () => {
    [0, -1, 1.5, NaN, Infinity].forEach((quantity) => {
      expect(() => sumTradingVolume(0, quantity)).toThrow(RangeError);
    });
  });

  test('Should reject a total beyond the safe integer range', () => {
    expect(() => sumTradingVolume(Number.MAX_SAFE_INTEGER, 1)).toThrow(RangeError);
  });
});

describe('Spread calculation', () => {
  test('Should calculate the bid–ask spread', () => {
    const res = calculateBidAskSpread(10196, 10200);
    expect(res).toBe(4);
  });

  test('Should reject an ask price below the bid price', () => {
    expect(() => {
      calculateBidAskSpread(10200, 10196);
    }).toThrow(InvalidPriceRange);
  });

  test('Should reject equal bid and ask prices', () => {
    expect(() => {
      calculateBidAskSpread(10200, 10200);
    }).toThrow(InvalidPriceRange);
  });

  test('Should reject negative prices and 0', () => {
    [
      [-5, 10],
      [10, -5],
      [-10, -5],
      [0, 10],
    ].forEach(([bid, ask]) => {
      expect(() => calculateBidAskSpread(bid, ask)).toThrow(RangeError);
    });
  });

  test('Should reject non-integer or non-finite prices', () => {
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
});

describe('VWAP calculation', () => {
  test('Should calculate the VWAP from all trades since the current run started', () => {
    const totalTradeValue = 10000 * 10 + 10200 * 30;
    expect(calculateVWAP(totalTradeValue, 40)).toBe(10150);
  });

  test('Should calculate VWAP for a single trade', () => {
    expect(calculateVWAP(10200 * 30, 30)).toBe(10200);
  });

  test('Should return unavailable when total trade quantity is zero', () => {
    expect(calculateVWAP(0, 0)).toBeNull();
  });

  test('Should reject zero trade value when trade quantity is positive', () => {
    expect(() => calculateVWAP(0, 1)).toThrow(RangeError);
  });

  test('Should preserve fractional cents for display rounding', () => {
    expect(calculateVWAP(4, 3)).toBeCloseTo(4 / 3);
  });

  test('Should reject negative total trade value or quantity', () => {
    [[-1, 1], [1, -1]].forEach(([totalTradeValue, totalTradeQuantity]) => {
      expect(() => calculateVWAP(totalTradeValue, totalTradeQuantity)).toThrow(RangeError);
    });
  });

  test('Should reject values that are not safe integers', () => {
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
});
