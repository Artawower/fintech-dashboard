import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import type { MarketFeedStatus } from '@app/core/models/market-feed.model';
import type { InstrumentStatistics } from '@app/core/models/instrument-statistics.model';
import { MarketFeedService } from '@app/core/services/market-feed.service';
import { DashboardPage } from './dashboard-page.component';

let fixture: ComponentFixture<DashboardPage>;
let status: ReturnType<typeof signal<MarketFeedStatus>>;
let error: ReturnType<typeof signal<string | null>>;
let statistics$: BehaviorSubject<InstrumentStatistics[]>;
let pause: ReturnType<typeof vi.fn>;
let resume: ReturnType<typeof vi.fn>;
let animationFrames: Map<number, FrameRequestCallback>;
let nextAnimationFrameId: number;

function sampleStatistics(
  instrument: string,
  lastPriceCents = 10200,
): InstrumentStatistics[] {
  return [{
    instrument,
    lastPriceCents,
    spreadCents: 4,
    tradingVolume: 40,
    totalTradeValue: 406000,
    vwapCents: 10150,
    orderBookImbalance: 0.2,
  }];
}

function flushAnimationFrame(): void {
  const callbacks = [...animationFrames.values()];
  animationFrames.clear();
  callbacks.forEach((callback) => callback(0));
}

beforeEach(async () => {
  animationFrames = new Map();
  nextAnimationFrameId = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    const id = ++nextAnimationFrameId;
    animationFrames.set(id, callback);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => animationFrames.delete(id));

  status = signal<MarketFeedStatus>('running');
  error = signal<string | null>(null);
  statistics$ = new BehaviorSubject<InstrumentStatistics[]>([]);
  pause = vi.fn(() => status.set('paused'));
  resume = vi.fn(() => status.set('running'));

  await TestBed.configureTestingModule({
    imports: [DashboardPage],
    providers: [
      {
        provide: MarketFeedService,
        useValue: { status, error, statistics$, pause, resume },
      },
    ],
  }).compileComponents();

  fixture = TestBed.createComponent(DashboardPage);
  fixture.detectChanges();
  flushAnimationFrame();
  fixture.detectChanges();
});

afterEach(() => {
  TestBed.resetTestingModule();
  vi.unstubAllGlobals();
});

test('Should show the running feed and pause control', () => {
  const element = fixture.nativeElement as HTMLElement;
  expect(element.textContent).toContain('Market feed: running');
  expect(element.querySelector('button')?.textContent?.trim()).toBe('Pause');
});

test('Should display all market metrics for each instrument', () => {
  statistics$.next(sampleStatistics('ALFA'));
  fixture.detectChanges();

  const element = fixture.nativeElement as HTMLElement;
  const row = element.querySelector('tbody tr');

  expect(element.querySelector('table')?.getAttribute('aria-label')).toBe('Live market statistics');
  expect(row?.textContent).toContain('ALFA');
  expect(row?.textContent).toContain('$102.00');
  expect(row?.textContent).toContain('$0.04');
  expect(row?.textContent).toContain('40');
  expect(row?.textContent).toContain('$101.50');
  expect(row?.textContent).toContain('+0.20');
});

test('Should show unavailable prices and zero volume before the first trade', () => {
  statistics$.next([{
    instrument: 'BETA',
    lastPriceCents: null,
    spreadCents: null,
    tradingVolume: 0,
    totalTradeValue: 0,
    vwapCents: null,
    orderBookImbalance: null,
  }]);
  fixture.detectChanges();

  const row = (fixture.nativeElement as HTMLElement).querySelector('tbody tr');
  expect(row?.textContent).toContain('BETA');
  expect(row?.textContent?.match(/—/g)).toHaveLength(4);
  expect(row?.textContent).toContain('0');
});

test('Should render the latest statistics snapshot scheduled for an animation frame', () => {
  const firstSnapshot = sampleStatistics('ALFA');
  const latestSnapshot = sampleStatistics('BETA', 14500);

  statistics$.next(firstSnapshot);
  statistics$.next(latestSnapshot);

  expect(fixture.componentInstance.statistics()).toEqual(firstSnapshot);

  flushAnimationFrame();
  fixture.detectChanges();

  expect(fixture.componentInstance.statistics()).toEqual(latestSnapshot);
  expect((fixture.nativeElement as HTMLElement).querySelector('tbody tr')?.textContent).toContain('BETA');
  expect((fixture.nativeElement as HTMLElement).querySelector('tbody tr')?.textContent).toContain('$145.00');
});

test('Should pause and resume the feed from the dashboard', () => {
  const element = fixture.nativeElement as HTMLElement;
  element.querySelector<HTMLButtonElement>('button')?.click();
  fixture.detectChanges();

  expect(pause).toHaveBeenCalledOnce();
  expect(element.querySelector('button')?.textContent?.trim()).toBe('Resume');

  element.querySelector<HTMLButtonElement>('button')?.click();
  fixture.detectChanges();

  expect(resume).toHaveBeenCalledOnce();
  expect(element.querySelector('button')?.textContent?.trim()).toBe('Pause');
});

test('Should show feed errors without pause controls', () => {
  status.set('error');
  error.set('Worker failed');
  fixture.detectChanges();

  const element = fixture.nativeElement as HTMLElement;
  expect(element.querySelector('[role="alert"]')?.textContent).toContain('Worker failed');
  expect(element.querySelector('button')).toBeNull();
});
