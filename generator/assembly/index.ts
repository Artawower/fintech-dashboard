// The entry file of your WebAssembly module.

import { Generator } from './generator';
import { GeneratorConfig, MarketUpdate } from './models';

let generator: Generator | null = null;

export function init(instrumentCount: i32, seed: i32): void {
  // TODO: Add assert, instrument count should be more than 0!
  const config = new GeneratorConfig(instrumentCount, seed);
  generator = new Generator(config);
}

function assertGenerator(): void {
  assert(generator !== null, 'Init should be called before geeration process');
}

export function generate(batchSize: i32): MarketUpdate[] {
  assertGenerator();
  return generator!.generate(batchSize);
}

export function getInstruments(): string[] {
  assertGenerator();

  return generator!.getInstruments();
}
