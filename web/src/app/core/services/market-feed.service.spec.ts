import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_MARKET_SETTINGS } from '../constants';
import type { MarketSettings } from '../models/market-settings.model';
import type { MarketUpdate } from '../models/market-update.model';
import { MockMarketWorker } from '../../../../test-utils/mock-market-worker';
import { MarketFeedService } from './market-feed.service';
import { SettingsService } from './settings.service';

afterEach(() => {
  TestBed.resetTestingModule();
  vi.unstubAllGlobals();
});

describe('MarketFeedService', () => {
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
    expect(worker.posted[0]).toMatchObject({ type: 'INIT', runId: 1, settings: DEFAULT_MARKET_SETTINGS });
    expect(service.status()).toBe('running');
  });

  it('restarts and clears the latest batch when settings change', () => {
    const { worker, service, settings } = setup();
    const updates: MarketUpdate[] = [{
      instrument: 'AAPL',
      priceCents: 100,
      tradeQuantity: 2,
      bidCents: 99,
      askCents: 101,
      bidQuantity: 5,
      askQuantity: 4,
    }];
    worker.emit({ type: 'BATCH', runId: 1, updates });

    const nextSettings: MarketSettings = { instrumentCount: 8, updatesPerBatch: 50, updateIntervalMs: 100 };
    settings.updateSettings(nextSettings);

    expect(worker.posted.at(-1)).toMatchObject({ type: 'INIT', runId: 2, settings: nextSettings });
    expect(service.latestBatch()).toEqual([]);
  });

  it('ignores batches from superseded runs', () => {
    const { worker, service, settings } = setup();
    settings.updateSettings({ instrumentCount: 8, updatesPerBatch: 50, updateIntervalMs: 100 });

    const updates: MarketUpdate[] = [{
      instrument: 'AAPL',
      priceCents: 100,
      tradeQuantity: 2,
      bidCents: 99,
      askCents: 101,
      bidQuantity: 5,
      askQuantity: 4,
    }];
    worker.emit({ type: 'BATCH', runId: 1, updates });
    expect(service.latestBatch()).toEqual([]);

    worker.emit({ type: 'BATCH', runId: 2, updates });
    expect(service.latestBatch()).toEqual(updates);
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
