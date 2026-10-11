import { expect, test } from 'vitest';
import { CentsToDollarsPipe } from './cents-to-dollars.pipe';

test('CentsToDollarsPipe converts cents to dollars', () => {
  expect(new CentsToDollarsPipe().transform(12345)).toBe(123.45);
});
