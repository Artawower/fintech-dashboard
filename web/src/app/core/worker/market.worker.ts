/// <reference lib="webworker" />

import type { MarketSettings } from '@app/core/models/market-settings.model';
import type { WorkerInboundMessage, WorkerOutboundMessage } from './market-worker.protocol';
import { loadWasmGenerator } from './wasm-generator.loader';
import type { WasmMarketGenerator } from './wasm-generator.loader';
import { MarketStatisticsAccumulator } from './market-statistics.accumulator';

let activeRunId = 0;
let generator: WasmMarketGenerator | null = null;
let statistics: MarketStatisticsAccumulator | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let paused = false;
let settings: MarketSettings | null = null;

function stop(): void {
  if (timer === null) return;
  clearInterval(timer);
  timer = null;
}

function post(message: WorkerOutboundMessage): void {
  postMessage(message);
}

function reportError(runId: number, error: unknown): void {
  post({
    type: 'ERROR',
    runId,
    error: error instanceof Error ? error.message : String(error),
  });
}

function generateBatch(runId: number): void {
  if (runId !== activeRunId || !generator || !statistics || !settings) return;

  try {
    const updates = generator.generate(settings.updatesPerBatch);
    post({ type: 'STATISTICS', runId, statistics: statistics.processBatch(updates) });
  } catch (error) {
    stop();
    reportError(runId, error);
  }
}

function start(): void {
  stop();
  if (paused || !generator || !statistics || !settings) return;

  const runId = activeRunId;
  timer = setInterval(() => generateBatch(runId), settings.updateIntervalMs);
}

async function initialize(message: Extract<WorkerInboundMessage, { type: 'INIT' }>): Promise<void> {
  if (message.runId <= activeRunId) return;

  activeRunId = message.runId;
  paused = false;
  generator = null;
  statistics = null;
  settings = message.settings;
  stop();

  try {
    const nextGenerator = await loadWasmGenerator();
    if (activeRunId !== message.runId) return;

    nextGenerator.init(message.settings.instrumentCount, Math.floor(Math.random() * 1_000_000));
    generator = nextGenerator;
    statistics = new MarketStatisticsAccumulator(nextGenerator.getInstruments());
    post({
      type: 'STATISTICS',
      runId: message.runId,
      statistics: statistics.processBatch([]),
    });
    start();
  } catch (error) {
    if (activeRunId === message.runId) reportError(message.runId, error);
  }
}

function receive(message: WorkerInboundMessage): void {
  if (message.type === 'INIT') {
    void initialize(message);
    return;
  }
  if (message.runId !== activeRunId) return;

  if (message.type === 'PAUSE') {
    paused = true;
    stop();
    return;
  }

  paused = false;
  start();
}

addEventListener('message', ({ data }: MessageEvent<WorkerInboundMessage>) => {
  if (data) receive(data);
});
