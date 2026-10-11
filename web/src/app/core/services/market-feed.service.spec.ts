import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_MARKET_SETTINGS } from '@app/core/constants';
import type { MarketSettings } from '@app/core/models/market-settings.model';
import type { InstrumentStatistics } from '@app/core/models/instrument-statistics.model';
import { MockMarketWorker } from '@test-utils/mock-market-worker';
import { MarketFeedService } from './market-feed.service';
import { SettingsService } from './settings.service';

afterEach(() => {
  TestBed.resetTestingModule();
  vi.unstubAllGlobals();
});

describe('MarketFeedService', () => {
  function sampleStatistics(): InstrumentStatistics[] {
    return [{
      instrument: 'AAPL',
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

  it('starts a run with the default settings', () => {
    const { worker, service } = setup();
    expect(worker.posted[0]).toEqual({ type: 'INIT', runId: 1, settings: DEFAULT_MARKET_SETTINGS });
    expect(service.status()).toBe('running');
  });

  it('restarts and clears statistics when settings change', () => {
    const { worker, service, settings } = setup();
    worker.emit({ type: 'STATISTICS', runId: 1, statistics: sampleStatistics() });

    const nextSettings: MarketSettings = { instrumentCount: 8, updatesPerBatch: 50, updateIntervalMs: 100 };
    settings.updateSettings(nextSettings);

    expect(worker.posted.at(-1)).toMatchObject({ type: 'INIT', runId: 2, settings: nextSettings });
    expect(service.statistics()).toEqual([]);
  });

  it('ignores statistics from superseded runs', () => {
    const { worker, service, settings } = setup();
    settings.updateSettings({ instrumentCount: 8, updatesPerBatch: 50, updateIntervalMs: 100 });

    const statistics = sampleStatistics();
    worker.emit({ type: 'STATISTICS', runId: 1, statistics });
    expect(service.statistics()).toEqual([]);

    worker.emit({ type: 'STATISTICS', runId: 2, statistics });
    expect(service.statistics()).toEqual(statistics);
  });

  it('pauses and resumes the current run', () => {
    const { worker, service } = setup();
    service.pause();
    expect(worker.posted.at(-1)).toEqual({ type: 'PAUSE', runId: 1 });
    expect(service.status()).toBe('paused');

    service.resume();
    expect(worker.posted.at(-1)).toEqual({ type: 'RESUME', runId: 1 });
    expect(service.status()).toBe('running');
  });

  it('exposes worker failures', () => {
    const { worker, service } = setup();
    worker.emit({ type: 'ERROR', runId: 1, error: 'Wasm execution trapped' });
    expect(service.status()).toBe('error');
    expect(service.error()).toBe('Wasm execution trapped');
  });

  it('reports errors raised while creating the worker', () => {
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

  it('terminates the worker when destroyed', () => {
    const { worker } = setup();
    TestBed.resetTestingModule();
    expect(worker.terminate).toHaveBeenCalledOnce();
  });
});
