import { MarketStatisticsAccumulator } from './market-statistics.accumulator';

describe('MarketStatisticsAccumulator', () => {
  test('Should accumulate completed statistics per instrument across batches', () => {
    const accumulator = new MarketStatisticsAccumulator(['ALFA', 'BETA']);

    accumulator.processBatch([
      {
        instrument: 'ALFA',
        priceCents: 10000,
        tradeQuantity: 10,
        bidCents: 9990,
        askCents: 10000,
        bidQuantity: 600,
        askQuantity: 400,
      },
    ]);

    const statistics = accumulator.processBatch([
      {
        instrument: 'ALFA',
        priceCents: 10200,
        tradeQuantity: 30,
        bidCents: 10196,
        askCents: 10200,
        bidQuantity: 400,
        askQuantity: 600,
      },
      {
        instrument: 'BETA',
        priceCents: 20000,
        tradeQuantity: 5,
        bidCents: 19900,
        askCents: 20000,
        bidQuantity: 0,
        askQuantity: 0,
      },
    ]);

    expect(statistics).toEqual([
      {
        instrument: 'ALFA',
        lastPriceCents: 10200,
        spreadCents: 4,
        tradingVolume: 40,
        totalTradeValue: 406000,
        vwapCents: 10150,
        orderBookImbalance: -0.2,
      },
      {
        instrument: 'BETA',
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

    expect(accumulator.processBatch([])).toEqual([
      {
        instrument: 'ALFA',
        lastPriceCents: null,
        spreadCents: null,
        tradingVolume: 0,
        totalTradeValue: 0,
        vwapCents: null,
        orderBookImbalance: null,
      },
      {
        instrument: 'BETA',
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
    accumulator.processBatch([
      {
        instrument: 'ALFA',
        priceCents: 10000,
        tradeQuantity: 10,
        bidCents: 9990,
        askCents: 10000,
        bidQuantity: 600,
        askQuantity: 400,
      },
    ]);

    accumulator.reset();

    expect(accumulator.processBatch([])).toEqual([
      {
        instrument: 'ALFA',
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
