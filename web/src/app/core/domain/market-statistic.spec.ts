import {
  calculateBidAskSpread,
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
