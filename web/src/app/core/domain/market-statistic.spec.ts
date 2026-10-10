import { calculateBidAskSpread, InvalidPriceRange, NegativePrice } from './market-statistic';

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
      expect(() => calculateBidAskSpread(bid, ask)).toThrow(NegativePrice);
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
    ].forEach(([bid, ask]) => {
      expect(() => calculateBidAskSpread(bid, ask)).toThrow(NegativePrice);
    });
  });
});
