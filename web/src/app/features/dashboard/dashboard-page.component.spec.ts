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
let instruments: ReturnType<typeof signal<readonly string[]>>;
let pause: ReturnType<typeof vi.fn>;
let resume: ReturnType<typeof vi.fn>;

function sampleStatistics(
  instrumentIndex: number,
  lastPriceCents = 10200,
): InstrumentStatistics[] {
  return [{
    instrumentIndex,
    lastPriceCents,
    spreadCents: 4,
    tradingVolume: 40,
    totalTradeValue: 406000,
    vwapCents: 10150,
    orderBookImbalance: 0.2,
  }];
}

beforeEach(async () => {
  status = signal<MarketFeedStatus>('running');
  error = signal<string | null>(null);
  statistics$ = new BehaviorSubject<InstrumentStatistics[]>([]);
  instruments = signal<readonly string[]>(['ALFA', 'BETA']);
  pause = vi.fn(() => status.set('paused'));
  resume = vi.fn(() => status.set('running'));

  await TestBed.configureTestingModule({
    imports: [DashboardPage],
    providers: [
      {
        provide: MarketFeedService,
        useValue: { status, error, statistics$, instruments, pause, resume },
      },
    ],
  }).compileComponents();

  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
  fixture = TestBed.createComponent(DashboardPage);
  fixture.detectChanges();
});

afterEach(() => {
  TestBed.resetTestingModule();
  vi.useRealTimers();
});

test('Should show the running feed and pause control', () => {
  const element = fixture.nativeElement as HTMLElement;
  expect(element.textContent).toContain('Market feed: running');
  expect(element.querySelector('button')?.textContent?.trim()).toBe('Pause');
});

test('Should display all market metrics for each instrument', () => {
  statistics$.next(sampleStatistics(0));
  vi.advanceTimersByTime(200);
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
    instrumentIndex: 1,
    lastPriceCents: null,
    spreadCents: null,
    tradingVolume: 0,
    totalTradeValue: 0,
    vwapCents: null,
    orderBookImbalance: null,
  }]);
  vi.advanceTimersByTime(200);
  fixture.detectChanges();

  const row = (fixture.nativeElement as HTMLElement).querySelector('tbody tr');
  expect(row?.textContent).toContain('BETA');
  expect(row?.textContent?.match(/—/g)).toHaveLength(4);
  expect(row?.textContent).toContain('0');
});

test('Should render only the latest pending snapshot after the initial 200 ms window', () => {
  const firstSnapshot = sampleStatistics(0);
  const latestSnapshot = sampleStatistics(1, 14500);

  statistics$.next(firstSnapshot);
  statistics$.next(latestSnapshot);

  expect(fixture.componentInstance.statistics()).toEqual([]);

  vi.advanceTimersByTime(199);
  expect(fixture.componentInstance.statistics()).toEqual([]);

  vi.advanceTimersByTime(1);
  fixture.detectChanges();

  expect(fixture.componentInstance.statistics()).toEqual(latestSnapshot);
  expect((fixture.nativeElement as HTMLElement).querySelector('tbody tr')?.textContent).toContain('BETA');
  expect((fixture.nativeElement as HTMLElement).querySelector('tbody tr')?.textContent).toContain('$145.00');
});

test('Should render the leading snapshot immediately after an idle window and throttle subsequent snapshots', () => {
  vi.advanceTimersByTime(200);
  const firstSnapshot = sampleStatistics(0);
  const latestSnapshot = sampleStatistics(1, 14500);

  statistics$.next(firstSnapshot);
  expect(fixture.componentInstance.statistics()).toEqual(firstSnapshot);
  statistics$.next(latestSnapshot);

  vi.advanceTimersByTime(199);
  expect(fixture.componentInstance.statistics()).toEqual(firstSnapshot);
  vi.advanceTimersByTime(1);
  expect(fixture.componentInstance.statistics()).toEqual(latestSnapshot);

  const nextSnapshot = sampleStatistics(0, 15000);
  statistics$.next(nextSnapshot);
  vi.advanceTimersByTime(199);
  expect(fixture.componentInstance.statistics()).toEqual(latestSnapshot);
  vi.advanceTimersByTime(1);
  expect(fixture.componentInstance.statistics()).toEqual(nextSnapshot);
});

test('Should render the last pending snapshot even when the feed is paused', () => {
  const latestSnapshot = sampleStatistics(0, 14500);
  statistics$.next(latestSnapshot);
  fixture.componentInstance.togglePause();

  expect(status()).toBe('paused');
  expect(fixture.componentInstance.statistics()).toEqual([]);
  vi.advanceTimersByTime(200);
  fixture.detectChanges();

  expect(fixture.componentInstance.statistics()).toEqual(latestSnapshot);
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
