import { GeneratorConfig } from './models';
import { MarketUpdateField } from './market-update-layout';
import { direction, generateInstrument, pick, randIntRange } from './utils';

// [instrumentIndex, priceCents, tradeQuantity, bidCents, askCents, bidQuantity, askQuantity]
type MarketUpdate = StaticArray<i32>;

@final
export class Generator {
  private instruments: Array<string> = [];
  private history: Int32Array = new Int32Array(0);
  private updates: MarketUpdate = new StaticArray<i32>(0);

  constructor(private readonly config: GeneratorConfig) {
    this.initGenerator();
  }

  public getInstruments(): string[] {
    return this.instruments;
  }

  private initGenerator(): void {
    Math.seedRandom(this.config.seed);
    this.initInstruments();
    this.initHistory();
  }

  private initInstruments(): void {
    const instruments = new Set<string>();

    while (instruments.size < this.config.instrumentCount) {
      instruments.add(generateInstrument(this.config.instrumentLength));
    }

    this.instruments = instruments.values();
  }

  private initHistory(): void {
    this.history = new Int32Array(this.instruments.length);
  }

  public generate(batchSize: i32): MarketUpdate {
    const updatesLength = batchSize * MarketUpdateField.Count;
    if (this.updates.length !== updatesLength) {
      this.updates = new StaticArray<i32>(updatesLength);
    }
    const updates = this.updates;

    for (let i: i32 = 0; i < updatesLength; i += MarketUpdateField.Count) {
      const instrumentIndex = this.getRandomInstrumentIndex();
      const lastPriceCents = this.getLastInstrumentPrice(instrumentIndex);
      const bidCents = this.generateNextBid(lastPriceCents);
      const spreadCents = randIntRange(this.config.minNextSpread, this.config.maxNextSpread);
      const askCents = bidCents + spreadCents;
      const priceCents = pick(bidCents, askCents);
      const tradeQuantity = randIntRange(
        this.config.minTradeQuantity,
        this.config.maxTradeQuantity,
      );
      const bidQuantity = randIntRange(this.config.minBookQuantity, this.config.maxBookQuantity);
      const askQuantity = randIntRange(this.config.minBookQuantity, this.config.maxBookQuantity);

      updates[i + MarketUpdateField.InstrumentIndex] = instrumentIndex;
      updates[i + MarketUpdateField.PriceCents] = priceCents;
      updates[i + MarketUpdateField.TradeQuantity] = tradeQuantity;
      updates[i + MarketUpdateField.BidCents] = bidCents;
      updates[i + MarketUpdateField.AskCents] = askCents;
      updates[i + MarketUpdateField.BidQuantity] = bidQuantity;
      updates[i + MarketUpdateField.AskQuantity] = askQuantity;

      this.saveMarketUpdate(instrumentIndex, priceCents);
    }

    return updates;
  }

  private getRandomInstrumentIndex(): i32 {
    return randIntRange(0, this.instruments.length - 1);
  }

  private getLastInstrumentPrice(instrumentIndex: i32): i32 {
    if (!this.history[instrumentIndex]) {
      return randIntRange(this.config.minInstrumentCentPrice, this.config.maxInstrumentCentPrice);
    }

    return this.history[instrumentIndex];
  }

  private generateNextBid(price: i32): i32 {
    const diff = randIntRange(0, this.config.maxPercentDiff);

    const changeDiffCents = <f64>direction() * Math.round(<f64>price * (<f64>diff / 100.0));

    const nextPrice = <f64>price + changeDiffCents;
    const maxBidCents = <f64>i32.MAX_VALUE - <f64>this.config.maxNextSpread;

    return <i32>Math.min(maxBidCents, Math.max(1.0, nextPrice));
  }

  private saveMarketUpdate(instrumentNumber: i32, priceCents: i32): void {
    this.history[instrumentNumber] = priceCents;
  }
}
