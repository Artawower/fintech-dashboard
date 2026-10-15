import type { InstrumentStatistics } from '@app/core/models/instrument-statistics.model';

export interface StatisticsRow {
  lastPriceCents: number | null;
  spreadCents: number | null;
  tradingVolume: number;
  totalTradeValue: number;
  vwapCents: number | null;
  orderBookImbalance: number | null;
}

export function createStatisticsSnapshot(
  rows: readonly Partial<StatisticsRow>[],
): InstrumentStatistics {
  return new Float64Array(
    rows.flatMap((row) => [
      row.lastPriceCents ?? NaN,
      row.spreadCents ?? NaN,
      row.tradingVolume ?? 0,
      row.totalTradeValue ?? 0,
      row.vwapCents ?? NaN,
      row.orderBookImbalance ?? NaN,
    ]),
  );
}
