import { expect, test } from 'vitest';
import { CentsToDollarsPipe } from './cents-to-dollars.pipe';

test('CentsToDollarsPipe converts cents to dollars formatted as currency', () => {
  expect(new CentsToDollarsPipe().transform(12345)).toBe('$123.45');
});

test('CentsToDollarsPipe returns fallback on null or undefined', () => {
  expect(new CentsToDollarsPipe().transform(null)).toBe('—');
  expect(new CentsToDollarsPipe().transform(undefined)).toBe('—');
});

