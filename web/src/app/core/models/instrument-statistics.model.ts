export interface InstrumentStatistics {
  instrumentIndex: number;
  lastPriceCents: number | null;
  spreadCents: number | null;
  tradingVolume: number;
  totalTradeValue: number;
  vwapCents: number | null;
  orderBookImbalance: number | null;
}
