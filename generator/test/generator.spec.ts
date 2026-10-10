import { beforeEach, expect, test } from 'vitest';
import { init as initWithSeed, generate, getInstruments } from '../build/release';

const seed = 27;
const defaultInstrumentCount = 10;
const testBatchSizes = [0, 5, 10, 20, 50, 100];

const init = (instrumentCount: number) => initWithSeed(instrumentCount, seed);

beforeEach(() => {
  init(defaultInstrumentCount);
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

test('Bid price should be less than ask', () => {
  const updates = generate(500);
  updates.forEach((u) => {
    expect(u.bidCents < u.askCents).toBeTruthy();
  });
});

test('Should generate trade price as bid or ask', () => {
  const updates = generate(100);
  updates.forEach((update) => {
    expect([update.bidCents, update.askCents]).toContain(update.priceCents);
  });
});

test('Should split trade quantity between bid and ask', () => {
  const updates = generate(100);

  updates.forEach((update) => {
    expect(update.bidQuantity).toBeGreaterThanOrEqual(0);
    expect(update.askQuantity).toBeGreaterThanOrEqual(0);
    expect(update.bidQuantity + update.askQuantity).toBe(update.tradeQuantity);
  });
});

test('Should generate trade quantity within configured bounds', () => {
  const updates = generate(100);

  updates.forEach((update) => {
    expect(update.tradeQuantity).toBeGreaterThanOrEqual(1);
    expect(update.tradeQuantity).toBeLessThanOrEqual(5000);
  });
});

test('Should limit bid price change to 15 percent', () => {
  const updates = generate(100);

  updates.forEach((update) => {
    const maxChange = Math.round(update.lastPriceCents * 0.15);
    const actualChange = Math.abs(update.bidCents - update.lastPriceCents);

    expect(actualChange).toBeLessThanOrEqual(maxChange);
  });
});
