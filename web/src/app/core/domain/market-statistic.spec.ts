import {
  calculateBidAskSpread,
  calculateOrderBookImbalance,
  calculateVWAP,
  createInstrumentStatistics,
  InstrumentMismatchError,
  InvalidPriceRange,
  sumTradingVolume,
  updateInstrumentStatistics,
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

describe('Order book imbalance calculation', () => {
  test('Should calculate imbalance from the latest bid and ask quantities', () => {
    expect(calculateOrderBookImbalance(600, 400)).toBeCloseTo(0.2);
  });

  test('Should return a negative imbalance when ask quantity is larger', () => {
    expect(calculateOrderBookImbalance(400, 600)).toBeCloseTo(-0.2);
  });

  test('Should return zero when bid and ask quantities are equal', () => {
    expect(calculateOrderBookImbalance(400, 400)).toBe(0);
  });

  test('Should return the imbalance bounds for a one-sided book', () => {
    expect(calculateOrderBookImbalance(600, 0)).toBe(1);
    expect(calculateOrderBookImbalance(0, 400)).toBe(-1);
  });

  test('Should return unavailable when both book quantities are zero', () => {
    expect(calculateOrderBookImbalance(0, 0)).toBeNull();
  });

  test('Should reject negative quantities', () => {
    [[-1, 10], [10, -1], [-1, -1]].forEach(([bidQuantity, askQuantity]) => {
      expect(() => calculateOrderBookImbalance(bidQuantity, askQuantity)).toThrow(RangeError);
    });
  });

  test('Should reject values that are not safe integers', () => {
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

  test('Should reject a combined quantity beyond the safe integer range', () => {
    expect(() => calculateOrderBookImbalance(Number.MAX_SAFE_INTEGER, 1)).toThrow(RangeError);
  });
});

describe('Instrument statistics reducer', () => {
  test('Should initialize statistics before any update arrives', () => {
    expect(createInstrumentStatistics('ALFA')).toEqual({
      instrument: 'ALFA',
      lastPriceCents: null,
      spreadCents: null,
      tradingVolume: 0,
      totalTradeValue: 0,
      vwapCents: null,
      orderBookImbalance: null,
    });
  });

  test('Should update cumulative statistics without mutating previous state', () => {
    const initial = createInstrumentStatistics('ALFA');
    const afterFirstTrade = updateInstrumentStatistics(initial, {
      instrument: 'ALFA',
      priceCents: 10000,
      tradeQuantity: 10,
      bidCents: 9990,
      askCents: 10000,
      bidQuantity: 600,
      askQuantity: 400,
    });
    const afterSecondTrade = updateInstrumentStatistics(afterFirstTrade, {
      instrument: 'ALFA',
      priceCents: 10200,
      tradeQuantity: 30,
      bidCents: 10196,
      askCents: 10200,
      bidQuantity: 400,
      askQuantity: 600,
    });

    expect(afterSecondTrade).toEqual({
      instrument: 'ALFA',
      lastPriceCents: 10200,
      spreadCents: 4,
      tradingVolume: 40,
      totalTradeValue: 406000,
      vwapCents: 10150,
      orderBookImbalance: -0.2,
    });
    expect(initial.tradingVolume).toBe(0);
    expect(afterFirstTrade.tradingVolume).toBe(10);
    expect(afterFirstTrade.totalTradeValue).toBe(100000);
  });

  test('Should reject an update for another instrument', () => {
    expect(() =>
      updateInstrumentStatistics(createInstrumentStatistics('ALFA'), {
        instrument: 'BETA',
        priceCents: 10200,
        tradeQuantity: 30,
        bidCents: 10196,
        askCents: 10200,
        bidQuantity: 400,
        askQuantity: 600,
      }),
    ).toThrow(InstrumentMismatchError);
  });

  test('Should describe the instrument mismatch', () => {
    expect(() =>
      updateInstrumentStatistics(createInstrumentStatistics('ALFA'), {
        instrument: 'BETA',
        priceCents: 10200,
        tradeQuantity: 30,
        bidCents: 10196,
        askCents: 10200,
        bidQuantity: 400,
        askQuantity: 600,
      }),
    ).toThrow('Cannot apply an update for instrument "BETA" to statistics for "ALFA".');
  });

  test('Should reject a non-integer trade price', () => {
    expect(() =>
      updateInstrumentStatistics(createInstrumentStatistics('ALFA'), {
        instrument: 'ALFA',
        priceCents: 10000.5,
        tradeQuantity: 2,
        bidCents: 9990,
        askCents: 10000,
        bidQuantity: 600,
        askQuantity: 400,
      }),
    ).toThrow(RangeError);
  });
});
