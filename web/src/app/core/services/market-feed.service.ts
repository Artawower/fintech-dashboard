import { DestroyRef, inject, Service, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { MarketFeedStatus } from '@app/core/models/market-feed.model';
import type { InstrumentStatistics } from '@app/core/models/instrument-statistics.model';
import type { MarketSettings } from '@app/core/models/market-settings.model';
import type { WorkerOutboundMessage } from '@app/core/worker/market-worker.protocol';
import { SettingsService } from './settings.service';
import { BehaviorSubject } from 'rxjs';

@Service()
export class MarketFeedService {
  private readonly settings = inject(SettingsService);
  private readonly destroyRef = inject(DestroyRef);
  private worker: Worker | null = null;
  private currentRunId = 0;

  private readonly _statistics$ = new BehaviorSubject<InstrumentStatistics | null>(null);

  public readonly instruments = signal<readonly string[]>([]);
  public readonly status = signal<MarketFeedStatus>('idle');
  public readonly error = signal<string | null>(null);
  public readonly statistics$ = this._statistics$.asObservable();

  public constructor() {
    const worker = this.createWorker();
    if (!worker) return;

    this.worker = worker;
    this.listenToWorker(worker);
    this.listenToSettings();
    this.destroyRef.onDestroy(() => worker.terminate());
  }

  public pause(): void {
    if (this.status() !== 'running') return;
    this.worker?.postMessage({ type: 'PAUSE', runId: this.currentRunId });
    this.status.set('paused');
  }

  public resume(): void {
    if (this.status() !== 'paused') return;
    this.worker?.postMessage({ type: 'RESUME', runId: this.currentRunId });
    this.status.set('running');
  }

  private createWorker(): Worker | null {
    try {
      return new Worker(new URL('../worker/market.worker', import.meta.url), { type: 'module' });
    } catch (error) {
      this.fail(error instanceof Error ? error.message : String(error));
      return null;
    }
  }

  private listenToWorker(worker: Worker): void {
    worker.onmessage = ({ data }) => this.handleMessage(data);
    worker.onerror = ({ message }) => this.fail(message || 'Worker error occurred');
  }

  private listenToSettings(): void {
    this.settings.settings$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((settings) => this.startRun(settings));
  }

  private startRun(settings: MarketSettings): void {
    const runId = ++this.currentRunId;
    this.status.set('running');
    this.instruments.set([]);
    this._statistics$.next(null);
    this.error.set(null);
    this.worker?.postMessage({
      type: 'INIT',
      runId,
      settings,
    });
  }

  private handleMessage(message: WorkerOutboundMessage): void {
    if (message.runId !== this.currentRunId) return;
    if (message.type === 'ERROR') {
      this.fail(message.error);
      return;
    }
    if (message.type === 'INSTRUMENTS') {
      this.instruments.set(message.instruments);
      return;
    }

    this._statistics$.next(message.statistics);
  }

  private fail(error: string): void {
    this.status.set('error');
    this.error.set(error);
  }
}
