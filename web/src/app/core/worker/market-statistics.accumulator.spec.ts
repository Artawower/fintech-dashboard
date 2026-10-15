import { createStatisticsSnapshot } from '@test-utils/statistics-snapshot';
import { MarketStatisticsAccumulator } from './market-statistics.accumulator';

test('MarketStatisticsAccumulator accumulates statistics per instrument across batches', () => {
  const accumulator = new MarketStatisticsAccumulator(['ALFA', 'BETA']);
  accumulator.processBatch(new Uint32Array([0, 10000, 10, 9990, 10000, 600, 400]));

  const statistics = accumulator.processBatch(
    new Uint32Array([0, 10200, 30, 10196, 10200, 400, 600, 1, 20000, 5, 19900, 20000, 0, 0]),
  );

  expect(statistics).toEqual(
    createStatisticsSnapshot([
      {
        lastPriceCents: 10200,
        spreadCents: 4,
        tradingVolume: 40,
        totalTradeValue: 406000,
        vwapCents: 10150,
        orderBookImbalance: -0.2,
      },
      {
        lastPriceCents: 20000,
        spreadCents: 100,
        tradingVolume: 5,
        totalTradeValue: 100000,
        vwapCents: 20000,
        orderBookImbalance: null,
      },
    ]),
  );
});

test('MarketStatisticsAccumulator initializes unavailable metrics for every instrument', () => {
  const accumulator = new MarketStatisticsAccumulator(['ALFA', 'BETA']);

  expect(accumulator.processBatch(new Uint32Array(0))).toEqual(createStatisticsSnapshot([{}, {}]));
});

test('MarketStatisticsAccumulator resets statistics without changing the previous run buffer', () => {
  const accumulator = new MarketStatisticsAccumulator(['ALFA']);
  const previousStatistics = accumulator.processBatch(
    new Uint32Array([0, 10000, 10, 9990, 10000, 600, 400]),
  );
  const previousSnapshot = previousStatistics.slice();

  accumulator.reset();
  const statistics = accumulator.processBatch(new Uint32Array(0));

  expect(statistics).toEqual(createStatisticsSnapshot([{}]));
  expect(statistics).not.toBe(previousStatistics);
  expect(previousStatistics).toEqual(previousSnapshot);
});

test('MarketStatisticsAccumulator reuses its statistics buffer across batches', () => {
  const accumulator = new MarketStatisticsAccumulator(['ALFA']);
  const firstStatistics = accumulator.processBatch(
    new Uint32Array([0, 10000, 10, 9990, 10000, 600, 400]),
  );

  const nextStatistics = accumulator.processBatch(
    new Uint32Array([0, 10200, 30, 10196, 10200, 400, 600]),
  );

  expect(nextStatistics).toBe(firstStatistics);
});

test('MarketStatisticsAccumulator rejects updates for an unknown instrument index', () => {
  const accumulator = new MarketStatisticsAccumulator(['ALFA']);
  const updates = new Uint32Array([1, 10200, 30, 10196, 10200, 400, 600]);

  expect(() => accumulator.processBatch(updates)).toThrow(RangeError);
  expect(() => accumulator.processBatch(updates)).toThrow('Unknown instrument index: 1.');
});

test('MarketStatisticsAccumulator rejects a zero trade price without changing statistics', () => {
  const accumulator = new MarketStatisticsAccumulator(['ALFA']);
  const initialSnapshot = accumulator.processBatch(new Uint32Array(0)).slice();

  expect(() => accumulator.processBatch(new Uint32Array([0, 0, 2, 9990, 10000, 600, 400]))).toThrow(
    RangeError,
  );
  expect(accumulator.processBatch(new Uint32Array(0))).toEqual(initialSnapshot);
});

test('MarketStatisticsAccumulator preserves integer precision beyond Float32 range', () => {
  const accumulator = new MarketStatisticsAccumulator(['ALFA']);
  const tradeQuantity = 2 ** 24 + 1;

  const statistics = accumulator.processBatch(
    new Uint32Array([0, 1, tradeQuantity, 1, 2, 600, 400]),
  );

  expect(statistics).toEqual(
    createStatisticsSnapshot([
      {
        lastPriceCents: 1,
        spreadCents: 1,
        tradingVolume: tradeQuantity,
        totalTradeValue: tradeQuantity,
        vwapCents: 1,
        orderBookImbalance: 0.2,
      },
    ]),
  );
});
