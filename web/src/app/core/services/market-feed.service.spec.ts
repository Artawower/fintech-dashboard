import { TestBed } from '@angular/core/testing';
import { afterEach, expect, test, vi } from 'vitest';
import { DEFAULT_MARKET_SETTINGS } from '@app/core/constants';
import type { InstrumentStatistics } from '@app/core/models/instrument-statistics.model';
import type { MarketSettings } from '@app/core/models/market-settings.model';
import { MockMarketWorker } from '@test-utils/mock-market-worker';
import { MarketFeedService } from './market-feed.service';
import { SettingsService } from './settings.service';

afterEach(() => {
  TestBed.resetTestingModule();
  vi.unstubAllGlobals();
});

function sampleStatistics(): InstrumentStatistics[] {
  return [{
    instrumentIndex: 0,
    lastPriceCents: 100,
    spreadCents: 2,
    tradingVolume: 2,
    totalTradeValue: 200,
    vwapCents: 100,
    orderBookImbalance: 0,
  }];
}

function setup() {
  MockMarketWorker.instances = [];
  vi.stubGlobal('Worker', MockMarketWorker);
  TestBed.configureTestingModule({ providers: [SettingsService, MarketFeedService] });
  const service = TestBed.inject(MarketFeedService);
  return {
    worker: MockMarketWorker.instances[0],
    service,
    settings: TestBed.inject(SettingsService),
  };
}

test('MarketFeedService starts a run with the default settings', () => {
  const { worker, service } = setup();

  expect(worker.posted[0]).toEqual({ type: 'INIT', runId: 1, settings: DEFAULT_MARKET_SETTINGS });
  expect(service.status()).toBe('running');
});

test('MarketFeedService stores instrument labels only for the active run', () => {
  const { worker, service, settings } = setup();
  worker.emit({ type: 'INSTRUMENTS', runId: 1, instruments: ['ALFA'] });
  expect(service.instruments()).toEqual(['ALFA']);

  settings.updateSettings({ instrumentCount: 8, updatesPerBatch: 50, updateIntervalMs: 100 });
  expect(service.instruments()).toEqual([]);

  worker.emit({ type: 'INSTRUMENTS', runId: 1, instruments: ['STALE'] });
  expect(service.instruments()).toEqual([]);

  worker.emit({ type: 'INSTRUMENTS', runId: 2, instruments: ['BETA'] });
  expect(service.instruments()).toEqual(['BETA']);
});

test('MarketFeedService emits statistics and clears them when settings change', () => {
  const { worker, service, settings } = setup();
  const snapshots: InstrumentStatistics[][] = [];
  const subscription = service.statistics$.subscribe((statistics) => snapshots.push(statistics));
  const statistics = sampleStatistics();
  worker.emit({ type: 'STATISTICS', runId: 1, statistics });

  const nextSettings: MarketSettings = { instrumentCount: 8, updatesPerBatch: 50, updateIntervalMs: 100 };
  settings.updateSettings(nextSettings);

  expect(worker.posted.at(-1)).toMatchObject({ type: 'INIT', runId: 2, settings: nextSettings });
  expect(snapshots).toEqual([[], statistics, []]);
  subscription.unsubscribe();
});

test('MarketFeedService ignores statistics from superseded runs', () => {
  const { worker, service, settings } = setup();
  const snapshots: InstrumentStatistics[][] = [];
  const subscription = service.statistics$.subscribe((statistics) => snapshots.push(statistics));
  settings.updateSettings({ instrumentCount: 8, updatesPerBatch: 50, updateIntervalMs: 100 });
  const statistics = sampleStatistics();

  worker.emit({ type: 'STATISTICS', runId: 1, statistics });
  expect(snapshots).toEqual([[], []]);

  worker.emit({ type: 'STATISTICS', runId: 2, statistics });
  expect(snapshots).toEqual([[], [], statistics]);
  subscription.unsubscribe();
});

test('MarketFeedService pauses and resumes the current run', () => {
  const { worker, service } = setup();
  service.pause();
  expect(worker.posted.at(-1)).toEqual({ type: 'PAUSE', runId: 1 });
  expect(service.status()).toBe('paused');

  service.resume();
  expect(worker.posted.at(-1)).toEqual({ type: 'RESUME', runId: 1 });
  expect(service.status()).toBe('running');
});

test('MarketFeedService exposes worker failures', () => {
  const { worker, service } = setup();
  worker.emit({ type: 'ERROR', runId: 1, error: 'Wasm execution trapped' });

  expect(service.status()).toBe('error');
  expect(service.error()).toBe('Wasm execution trapped');
});

test('MarketFeedService reports errors raised while creating the worker', () => {
  vi.stubGlobal(
    'Worker',
    class {
      public constructor() {
        throw new Error('Worker blocked by browser policy');
      }
    },
  );
  TestBed.configureTestingModule({ providers: [SettingsService, MarketFeedService] });
  const service = TestBed.inject(MarketFeedService);

  expect(service.status()).toBe('error');
  expect(service.error()).toBe('Worker blocked by browser policy');
});

test('MarketFeedService terminates the worker when destroyed', () => {
  const { worker } = setup();
  TestBed.resetTestingModule();

  expect(worker.terminate).toHaveBeenCalledOnce();
});
