import { MarketStatisticsAccumulator } from './market-statistics.accumulator';

describe('MarketStatisticsAccumulator', () => {
  test('Should accumulate completed statistics per instrument across batches', () => {
    const accumulator = new MarketStatisticsAccumulator(['ALFA', 'BETA']);

    accumulator.processBatch(new Uint32Array([0, 10000, 10, 9990, 10000, 600, 400]));

    const statistics = accumulator.processBatch(
      new Uint32Array([
        0, 10200, 30, 10196, 10200, 400, 600,
        1, 20000, 5, 19900, 20000, 0, 0,
      ]),
    );

    expect(statistics).toEqual([
      {
        instrumentIndex: 0,
        lastPriceCents: 10200,
        spreadCents: 4,
        tradingVolume: 40,
        totalTradeValue: 406000,
        vwapCents: 10150,
        orderBookImbalance: -0.2,
      },
      {
        instrumentIndex: 1,
        lastPriceCents: 20000,
        spreadCents: 100,
        tradingVolume: 5,
        totalTradeValue: 100000,
        vwapCents: 20000,
        orderBookImbalance: null,
      },
    ]);
  });

  test('Should initialize statistics for every instrument before updates arrive', () => {
    const accumulator = new MarketStatisticsAccumulator(['ALFA', 'BETA']);

    expect(accumulator.processBatch(new Uint32Array(0))).toEqual([
      {
        instrumentIndex: 0,
        lastPriceCents: null,
        spreadCents: null,
        tradingVolume: 0,
        totalTradeValue: 0,
        vwapCents: null,
        orderBookImbalance: null,
      },
      {
        instrumentIndex: 1,
        lastPriceCents: null,
        spreadCents: null,
        tradingVolume: 0,
        totalTradeValue: 0,
        vwapCents: null,
        orderBookImbalance: null,
      },
    ]);
  });

  test('Should reset accumulated statistics for a new run', () => {
    const accumulator = new MarketStatisticsAccumulator(['ALFA']);
    accumulator.processBatch(new Uint32Array([0, 10000, 10, 9990, 10000, 600, 400]));

    accumulator.reset();

    expect(accumulator.processBatch(new Uint32Array(0))).toEqual([
      {
        instrumentIndex: 0,
        lastPriceCents: null,
        spreadCents: null,
        tradingVolume: 0,
        totalTradeValue: 0,
        vwapCents: null,
        orderBookImbalance: null,
      },
    ]);
  });
});
