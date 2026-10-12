import { MarketUpdateField } from '@generator/assembly/market-update-layout';
import type { InstrumentStatistics } from '@app/core/models/instrument-statistics.model';
import {
  createInstrumentStatistics,
  updateInstrumentStatistics,
} from '@app/core/domain/market-statistic';

export class MarketStatisticsAccumulator {
  private readonly statistics = new Map<number, InstrumentStatistics>();

  public constructor(private readonly instruments: readonly string[]) {
    this.reset();
  }

  public processBatch(updates: Uint32Array): InstrumentStatistics[] {
    for (let i = 0; i < updates.length; i += MarketUpdateField.Count) {
      const instrumentIndex = updates[i + MarketUpdateField.InstrumentIndex];

      const current =
        this.statistics.get(instrumentIndex) ?? createInstrumentStatistics(instrumentIndex);

      this.statistics.set(
        instrumentIndex,
        updateInstrumentStatistics(
          current,
          instrumentIndex,
          updates[i + MarketUpdateField.PriceCents],
          updates[i + MarketUpdateField.TradeQuantity],
          updates[i + MarketUpdateField.BidCents],
          updates[i + MarketUpdateField.AskCents],
          updates[i + MarketUpdateField.BidQuantity],
          updates[i + MarketUpdateField.AskQuantity],
        ),
      );
    }

    return Array.from(this.statistics.values());
  }

  public reset(): void {
    this.statistics.clear();
    this.instruments.forEach((_, i) => {
      this.statistics.set(i, createInstrumentStatistics(i));
    });
  }
}
