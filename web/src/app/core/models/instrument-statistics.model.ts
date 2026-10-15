// 0 - instrumentIndex
// 1- lastPriceCents
// 2 - preadCents
// 3 - tradingVolume
// 4 - totalTradeValue
// 5 - vwapCents: number | null;
// 6 - orderBookImbalance: number | null;
export type InstrumentStatistics = Float64Array;

export enum InstrumentStatisticField {
  LastPriceCents = 0,
  SpreadCents = 1,
  TradingVolume = 2,
  TotalTradeValue = 3,
  VwapCents = 4,
  OrderBookImbalance = 5,
  Count = 6,
}
