import { MarketUpdate, GeneratorConfig } from './models';
import { choice, generateInstrument, randIntRange } from './utils';

@final
export class Generator {
  private instruments: Array<string> = [];
  private history: Map<string, MarketUpdate> = new Map();

  constructor(private readonly config: GeneratorConfig) {
    this.initGenerator();
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
      this.instruments[i] = generateInstrument(this.config.instrumentLength);
    }
  }

  public generate(batchSize: i32): MarketUpdate[] {
    const updates = new Array<MarketUpdate>(batchSize);

    for (let i: i32 = 0; i < batchSize; i++) {
      updates[i] = this.generateMarketUpdate();
    }

    return updates;
  }

  private generateMarketUpdate(): MarketUpdate {
    const instrument = this.getRandomInstrument();
    const lastPriceCents = this.getLastInstrumentPrice(instrument);
    const bidCents = this.generateNextBid(lastPriceCents);
    const spreadCents = randIntRange(this.config.minNextSpread, this.config.maxNextSpread);
    const askCents = bidCents + spreadCents;
    const priceCents = choice([bidCents, askCents]);
    const tradeQuantity = randIntRange(this.config.minTradeQuantity, this.config.maxTradeQuantity);
    const bidQuantity = randIntRange(0, tradeQuantity);
    const askQuantity = tradeQuantity - bidQuantity;

    const update: MarketUpdate = {
      instrument,
      lastPriceCents,
      time: Date.now(),
      priceCents,
      tradeQuantity,
      bidCents,
      askCents,
      bidQuantity,
      askQuantity,
    };

    this.saveMarketUpdate(update);
    return update;
  }

  private getRandomInstrument(): string {
    return choice(this.instruments);
  }

  private getLastInstrumentPrice(instrument: string): i32 {
    if (!this.history.has(instrument)) {
      return randIntRange(this.config.minInstrumentCentPrice, this.config.maxInstrumentCentPrice);
    }

    const previousRecord = this.history.get(instrument);

    return previousRecord.priceCents;
  }

  private generateNextBid(price: i32): i32 {
    const direction = choice([-1, 1]);
    const diff = randIntRange(0, this.config.maxPercentDiff);

    const changeDiffCents = direction * <i32>Math.round(<f64>price * (<f64>diff / 100.0));
    const nextPrice = price + changeDiffCents;

    return nextPrice;
  }

  private saveMarketUpdate(update: MarketUpdate): void {
    this.history.set(update.instrument, update);
  }
}
