import { test } from 'vitest';
import { loadGenerator } from './load-generator';

test('Should initialize generator with seed and instruments count', async () => {
  const { init } = await loadGenerator(27);
  init(50);
});
