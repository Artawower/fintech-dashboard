// The entry file of your WebAssembly module.

import { Generator } from './generator';
import { GeneratorConfig } from './generator-config';

let generator: Generator | null = null;

export function init(instrumentCount: i32, seed: i32): void {
  const config = new GeneratorConfig(instrumentCount, seed);
  generator = new Generator(config);
}

function assertGenerator(): void {
  assert(generator !== null, 'Init should be called before geeration process');
}

export function generate(batchSize: i32): void {
  assertGenerator();
}

export function getInstruments(): string[] {
  assertGenerator();

  return generator!.getInstruments();
}
