import { beforeEach, expect, test } from 'vitest';
import { init as initWithSeed, generate, getInstruments } from '../build/release';
import {
  DEFAULT_MAX_BOOK_QUANTITY,
  DEFAULT_MAX_NEXT_SPREAD,
  DEFAULT_MAX_PERCENT_DIFF,
  DEFAULT_MAX_TRADE_QUANTITY,
  DEFAULT_MIN_BOOK_QUANTITY,
  DEFAULT_MIN_NEXT_SPREAD,
  DEFAULT_MIN_TRADE_QUANTITY,
} from '../assembly/constants';

const seed = 27;
const defaultInstrumentCount = 10;
const testBatchSizes = [0, 1, 5, 10, 20, 50, 100, 1000];

const init = (instrumentCount: number) => initWithSeed(instrumentCount, seed);

beforeEach(() => {
  init(defaultInstrumentCount);
});

test('Should reject non-positive instrument count', () => {
  expect(() => init(0)).toThrow('Instrument count should be positive');
});

test('Should reject negative batch size', () => {
  expect(() => generate(-1)).toThrow('Batch size should not be negative');
});

test('Should generate required number of instruments', () => {
  [1, 5, 10, 20, 50].forEach((instrumentsCount) => {
    init(instrumentsCount);
    expect(getInstruments().length).toEqual(instrumentsCount);
  });
});

test('Should generate instruments with string labels', () => {
  init(100);
  getInstruments().forEach((instrument) => {
    expect(instrument).toBeTruthy();
    expect(typeof instrument).toEqual('string');
  });
});

test('Should generate unique instrument labels', () => {
  initWithSeed(50, 102);
  const instruments = getInstruments();

  expect(new Set(instruments).size).toBe(instruments.length);
});

test('Should return same random instruments each run', () => {
  init(50);
  expect(getInstruments()).toMatchSnapshot();
});

test('Should generate batch with exact size', () => {
  testBatchSizes.forEach((batchSize) => {
    const updates = generate(batchSize);
    expect(updates.length).toBe(batchSize);
  });
});

test('Should return non empty array with generated data', () => {
  const updates = generate(30);
  updates.forEach((u) => {
    expect(u).toBeTruthy();
  });
});

test('Should reference initialized instruments', () => {
  const instruments = new Set(getInstruments());
  const updates = generate(100);

  updates.forEach((update) => {
    expect(instruments.has(update.instrument)).toBe(true);
  });
});

test('Should generate spread within configured bounds', () => {
  const updates = generate(500);
  updates.forEach((update) => {
    const spread = update.askCents - update.bidCents;

    expect(spread).toBeGreaterThanOrEqual(DEFAULT_MIN_NEXT_SPREAD);
    expect(spread).toBeLessThanOrEqual(DEFAULT_MAX_NEXT_SPREAD);
  });
});

test('Should generate trade price as bid or ask', () => {
  const updates = generate(100);
  updates.forEach((update) => {
    expect([update.bidCents, update.askCents]).toContain(update.priceCents);
  });
});

test('Should generate positive prices', () => {
  const updates = generate(100);

  updates.forEach((update) => {
    expect(update.bidCents).toBeGreaterThan(0);
    expect(update.askCents).toBeGreaterThan(0);
    expect(update.priceCents).toBeGreaterThan(0);
  });
});

test('Should generate book quantities within configured bounds', () => {
  const updates = generate(100);

  updates.forEach((update) => {
    expect(update.bidQuantity).toBeGreaterThanOrEqual(DEFAULT_MIN_BOOK_QUANTITY);
    expect(update.bidQuantity).toBeLessThanOrEqual(DEFAULT_MAX_BOOK_QUANTITY);
    expect(update.askQuantity).toBeGreaterThanOrEqual(DEFAULT_MIN_BOOK_QUANTITY);
    expect(update.askQuantity).toBeLessThanOrEqual(DEFAULT_MAX_BOOK_QUANTITY);
  });
});

test('Should generate book quantities independently from trade quantity', () => {
  const updates = generate(100);

  expect(
    updates.some((update) => update.bidQuantity + update.askQuantity !== update.tradeQuantity),
  ).toBe(true);
});

test('Should generate trade quantity within configured bounds', () => {
  const updates = generate(100);

  updates.forEach((update) => {
    expect(update.tradeQuantity).toBeGreaterThanOrEqual(DEFAULT_MIN_TRADE_QUANTITY);
    expect(update.tradeQuantity).toBeLessThanOrEqual(DEFAULT_MAX_TRADE_QUANTITY);
  });
});

test('Should limit bid price change to defaultMaxPercentDiff', () => {
  init(1);
  const updates = generate(100);

  updates.slice(1).forEach((update, index) => {
    const previousPrice = updates[index].priceCents;
    const maxChange = Math.round((previousPrice * DEFAULT_MAX_PERCENT_DIFF) / 100);
    const actualChange = Math.abs(update.bidCents - previousPrice);

    expect(actualChange).toBeLessThanOrEqual(maxChange);
  });
});

test('Should generate same market updates with same seed', () => {
  const firstRun = generate(100);
  init(defaultInstrumentCount);
  const secondRun = generate(100);

  expect(secondRun).toEqual(firstRun);
});

test('Generated updates should match the previous snapshot', () => {
  const updates = generate(30);
  expect(updates).toMatchSnapshot();
});

test('Should use previous trade price for next update of same instrument', () => {
  init(1);
  const [firstUpdate, secondUpdate] = generate(2);

  const maxChange = Math.round((firstUpdate.priceCents * DEFAULT_MAX_PERCENT_DIFF) / 100);

  expect(secondUpdate.instrument).toBe(firstUpdate.instrument);
  expect(Math.abs(secondUpdate.bidCents - firstUpdate.priceCents)).toBeLessThanOrEqual(maxChange);
});

test('Should keep previous trade price between generated batches', () => {
  init(1);
  const [firstUpdate] = generate(1);
  const [secondUpdate] = generate(1);
  const maxChange = Math.round((firstUpdate.priceCents * DEFAULT_MAX_PERCENT_DIFF) / 100);

  expect(Math.abs(secondUpdate.bidCents - firstUpdate.priceCents)).toBeLessThanOrEqual(maxChange);
});

test('Should keep separate price history for each instrument', () => {
  init(2);
  const updates = generate(100);
  const previousPrices: { [key: string]: number } = {};
  let repeatedUpdates = 0;

  updates.forEach((update) => {
    const previousPrice = previousPrices[update.instrument];

    if (previousPrice !== undefined) {
      repeatedUpdates += 1;
      const maxChange = Math.round((previousPrice * DEFAULT_MAX_PERCENT_DIFF) / 100);
      expect(Math.abs(update.bidCents - previousPrice)).toBeLessThanOrEqual(maxChange);
    }

    previousPrices[update.instrument] = update.priceCents;
  });

  expect(Object.keys(previousPrices).length).toBeGreaterThan(1);
  expect(repeatedUpdates).toBeGreaterThan(0);
});
