import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MarketFeedStatus } from '../../core/models/market-feed.model';
import { MarketFeedService } from '../../core/services/market-feed.service';
import { DashboardPage } from './dashboard-page.component';

describe('DashboardPage', () => {
  let fixture: ComponentFixture<DashboardPage>;
  let status: ReturnType<typeof signal<MarketFeedStatus>>;
  let error: ReturnType<typeof signal<string | null>>;
  let pause: ReturnType<typeof vi.fn>;
  let resume: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    status = signal<MarketFeedStatus>('running');
    error = signal<string | null>(null);
    pause = vi.fn(() => status.set('paused'));
    resume = vi.fn(() => status.set('running'));

    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        {
          provide: MarketFeedService,
          useValue: { status, error, pause, resume },
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
