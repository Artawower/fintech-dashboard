// The entry file of your WebAssembly module.

import { Generator } from './generator';
import { GeneratorConfig, MarketUpdate } from './models';

let generator: Generator | null = null;

export function init(instrumentCount: i32, seed: i32): void {
  assert(instrumentCount > 0, 'Instrument count should be positive');
  const config = new GeneratorConfig(instrumentCount, seed);
  generator = new Generator(config);
}

function assertGenerator(): void {
  assert(generator !== null, 'Init should be called before generation process');
}

export function generate(batchSize: i32): MarketUpdate[] {
  assertGenerator();
  assert(batchSize >= 0, 'Batch size should not be negative');
  return generator!.generate(batchSize);
}

export function getInstruments(): string[] {
  assertGenerator();

  return generator!.getInstruments();
}
