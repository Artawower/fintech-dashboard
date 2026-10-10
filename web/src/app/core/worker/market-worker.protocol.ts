import type { MarketSettings } from '../models/market-settings.model';
import type { MarketUpdate } from '../models/market-update.model';

export type WorkerInboundMessage =
  | { type: 'INIT'; runId: number; settings: MarketSettings; wasmUrl: string }
  | { type: 'PAUSE'; runId: number }
  | { type: 'RESUME'; runId: number };

export type WorkerOutboundMessage =
  | { type: 'BATCH'; runId: number; updates: MarketUpdate[] }
  | { type: 'ERROR'; runId: number; error: string };
