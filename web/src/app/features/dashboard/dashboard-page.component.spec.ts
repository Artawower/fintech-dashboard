import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MarketFeedStatus } from '../../core/models/market-feed.model';
import type { InstrumentStatistics } from '../../core/models/instrument-statistics.model';
import { MarketFeedService } from '../../core/services/market-feed.service';
import { DashboardPage } from './dashboard-page.component';

describe('DashboardPage', () => {
  let fixture: ComponentFixture<DashboardPage>;
  let status: ReturnType<typeof signal<MarketFeedStatus>>;
  let error: ReturnType<typeof signal<string | null>>;
  let statistics: ReturnType<typeof signal<InstrumentStatistics[]>>;
  let pause: ReturnType<typeof vi.fn>;
  let resume: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    status = signal<MarketFeedStatus>('running');
    error = signal<string | null>(null);
    statistics = signal<InstrumentStatistics[]>([]);
    pause = vi.fn(() => status.set('paused'));
    resume = vi.fn(() => status.set('running'));

    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        {
          provide: MarketFeedService,
          useValue: { status, error, statistics, pause, resume },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('Should show the running feed and pause control', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Market feed: running');
    expect(element.querySelector('button')?.textContent?.trim()).toBe('Pause');
  });

  it('Should display all market metrics for each instrument', () => {
    statistics.set([{
      instrument: 'ALFA',
      lastPriceCents: 10200,
      spreadCents: 4,
      tradingVolume: 40,
      totalTradeValue: 406000,
      vwapCents: 10150,
      orderBookImbalance: 0.2,
    }]);
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

  it('Should show unavailable prices and zero volume before the first trade', () => {
    statistics.set([{
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

  it('Should pause and resume the feed from the dashboard', () => {
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

  it('Should show feed errors without pause controls', () => {
    status.set('error');
    error.set('Worker failed');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Worker failed');
    expect(element.querySelector('button')).toBeNull();
  });
});
