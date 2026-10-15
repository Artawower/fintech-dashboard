import { MarketUpdateField } from '@generator/assembly/market-update-layout';
import {
  InstrumentStatisticField,
  type InstrumentStatistics,
} from '@app/core/models/instrument-statistics.model';
import {
  calculateBidAskSpread,
  calculateOrderBookImbalance,
  calculateVWAP,
  sumTradingVolume,
} from '@app/core/domain/market-statistic';

export class MarketStatisticsAccumulator {
  private statistics!: InstrumentStatistics;

  public constructor(private readonly instruments: readonly string[]) {
    this.reset();
  }

  public processBatch(updates: Uint32Array): InstrumentStatistics {
    for (let i = 0; i < updates.length; i += MarketUpdateField.Count) {
      const instrumentIndex = updates[i + MarketUpdateField.InstrumentIndex];
      const offset = instrumentIndex * InstrumentStatisticField.Count;
      if (offset >= this.statistics.length) {
        throw new RangeError(`Unknown instrument index: ${instrumentIndex}.`);
      }

      const priceCents = updates[i + MarketUpdateField.PriceCents];
      if (!Number.isSafeInteger(priceCents) || priceCents <= 0) {
        throw new RangeError('Trade price must be a positive safe integer.');
      }

      const spreadCents = calculateBidAskSpread(
        updates[i + MarketUpdateField.BidCents],
        updates[i + MarketUpdateField.AskCents],
      );
      const tradeQuantity = updates[i + MarketUpdateField.TradeQuantity];
      const tradingVolume = sumTradingVolume(
        this.statistics[offset + InstrumentStatisticField.TradingVolume],
        tradeQuantity,
      );
      const totalTradeValue =
        this.statistics[offset + InstrumentStatisticField.TotalTradeValue] +
        priceCents * tradeQuantity;
      const vwapCents = calculateVWAP(totalTradeValue, tradingVolume);
      const orderBookImbalance = calculateOrderBookImbalance(
        updates[i + MarketUpdateField.BidQuantity],
        updates[i + MarketUpdateField.AskQuantity],
      );

      this.statistics[offset + InstrumentStatisticField.LastPriceCents] = priceCents;
      this.statistics[offset + InstrumentStatisticField.SpreadCents] = spreadCents;
      this.statistics[offset + InstrumentStatisticField.TradingVolume] = tradingVolume;
      this.statistics[offset + InstrumentStatisticField.TotalTradeValue] = totalTradeValue;
      this.statistics[offset + InstrumentStatisticField.VwapCents] = vwapCents ?? NaN;
      this.statistics[offset + InstrumentStatisticField.OrderBookImbalance] =
        orderBookImbalance ?? NaN;
    }

    return this.statistics;
  }

  public reset(): void {
    this.statistics = new Float64Array(InstrumentStatisticField.Count * this.instruments.length);

    for (
      let offset = 0;
      offset < this.statistics.length;
      offset += InstrumentStatisticField.Count
    ) {
      this.statistics[offset + InstrumentStatisticField.LastPriceCents] = NaN;
      this.statistics[offset + InstrumentStatisticField.SpreadCents] = NaN;
      this.statistics[offset + InstrumentStatisticField.VwapCents] = NaN;
      this.statistics[offset + InstrumentStatisticField.OrderBookImbalance] = NaN;
    }
  }
}
