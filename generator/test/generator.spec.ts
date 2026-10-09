import { beforeEach, expect, test } from 'vitest';
import { init as initWithSeed, generate, getInstruments } from '../build/release';

const seed = 27;
const defaultInstrumentCount = 10;

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
