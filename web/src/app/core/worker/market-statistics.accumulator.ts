import type { InstrumentStatistics } from '../models/instrument-statistics.model';
import type { MarketUpdate } from '../models/market-update.model';
import { createInstrumentStatistics, updateInstrumentStatistics } from '../domain/market-statistic';

export class MarketStatisticsAccumulator {
  private readonly statistics = new Map<string, InstrumentStatistics>();

  public constructor(private readonly instruments: readonly string[]) {
    this.reset();
  }

  public processBatch(updates: readonly MarketUpdate[]): InstrumentStatistics[] {
    updates.forEach((update) => {
      const current =
        this.statistics.get(update.instrument) ?? createInstrumentStatistics(update.instrument);
      this.statistics.set(update.instrument, updateInstrumentStatistics(current, update));
    });

    return Array.from(this.statistics.values());
  }

  public reset(): void {
    this.statistics.clear();
    this.instruments.forEach((instrument) => {
      this.statistics.set(instrument, createInstrumentStatistics(instrument));
    });
  }
}
