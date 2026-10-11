import type { InstrumentStatistics } from '../models/instrument-statistics.model';
import type { MarketSettings } from '../models/market-settings.model';

export type WorkerInboundMessage =
  | { type: 'INIT'; runId: number; settings: MarketSettings }
  | { type: 'PAUSE'; runId: number }
  | { type: 'RESUME'; runId: number };

export type WorkerOutboundMessage =
  | { type: 'STATISTICS'; runId: number; statistics: InstrumentStatistics[] }
  | { type: 'ERROR'; runId: number; error: string };
