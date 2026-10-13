import type { InstrumentStatistics } from '@app/core/models/instrument-statistics.model';
import type { MarketSettings } from '@app/core/models/market-settings.model';
import type { SharedInstrumentMemory } from './shared-instrument-memory';

export type WorkerInboundMessage =
  | { type: 'INIT'; runId: number; settings: MarketSettings }
  | { type: 'PAUSE'; runId: number }
  | { type: 'RESUME'; runId: number };

export type WorkerOutboundMessage =
  | { type: 'INSTRUMENTS'; runId: number; instruments: string[] }
  | { type: 'SHARED_INSTRUMENTS'; runId: number; memory: SharedInstrumentMemory }
  | { type: 'STATISTICS'; runId: number; statistics: InstrumentStatistics[] }
  | { type: 'ERROR'; runId: number; error: string };
