import { MarketUpdate } from './market-update.model';
import { GeneratorConfig } from './generator-config';

@final
export class Generator {
  private instruments: Array<string> = [];

  constructor(private config: GeneratorConfig) {
    this.initGenerator();
  }

  public generate(batchSize: i32): MarketUpdate[] {
    return [];
  }

  public getInstruments(): string[] {
    return this.instruments;
  }

  private initGenerator(): void {
    Math.seedRandom(this.config.seed);
    this.initInstruments();
  }

  private initInstruments(): void {
    this.instruments = new Array<string>(this.config.instrumentCount);

    for (let i: i32 = 0; i < this.instruments.length; i++) {
      this.instruments[i] = this.generateInstrument();
    }
  }

  private generateInstrument(): string {
    let code = '';
    const minCode = 'A'.charCodeAt(0);
    const maxCode = 'Z'.charCodeAt(0);

    for (let i: i8 = 0; i < this.config.instrumentLength; i++) {
      code += String.fromCharCode(getRadomInRange(minCode, maxCode));
    }

    return code;
  }
}
