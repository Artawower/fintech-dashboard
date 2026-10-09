// The entry file of your WebAssembly module.

import { Generator } from './generator';
import { GeneratorConfig } from './generator-config';

let generator: Generator | null = null;

export function init(instrumentCount: i32 = 5): void {
  const config = new GeneratorConfig(instrumentCount);
  generator = new Generator(config);
}

export function generate(batchSize: i32): void {
  if (!generator) {
    init();
  }
}

export function getInstruments(): string[] {
  return [];
}
