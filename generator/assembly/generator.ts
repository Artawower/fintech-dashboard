import { MarketUpdate } from './market-update.model';
import { GeneratorConfig } from './generator-config';
import { getInstruments } from '.';

@final
export class Generator {
  constructor(private config: GeneratorConfig) {}

  public generate(batchSize: i32): MarketUpdate[] {
    return [];
  }

  public getInstruments(): void {}
}
