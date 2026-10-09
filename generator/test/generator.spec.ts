import { beforeEach, expect, test } from 'vitest';
import { generate } from '../build/release';

test('Should run script generation without errors', async () => {
  generate(1, 2);
});
