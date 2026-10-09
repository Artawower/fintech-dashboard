import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  test: {
    environment: 'node',
    include: ['test/**/*.spec.ts'],
    typecheck: {
      enabled: true,
      include: ['test/**/*.spec.ts'],
      tsconfig: 'test/tsconfig.json',
    },
  },
});
