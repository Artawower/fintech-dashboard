import { Component, inject } from '@angular/core';
import { MarketFeedService } from '@app/core/services/market-feed.service';
import { InstrumentStatisticsTable } from './components/instrument-statistics-table.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { asyncScheduler, throttleTime } from 'rxjs';

const UI_REFRESH_INTERVAL_MS = 200;

@Component({
  imports: [InstrumentStatisticsTable],
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPage {
  public readonly marketFeed = inject(MarketFeedService);

  public readonly statistics = toSignal(
    this.marketFeed.statistics$.pipe(
      // throttleTime(0, animationFrameScheduler, { // If we need a real time update
      throttleTime(UI_REFRESH_INTERVAL_MS, asyncScheduler, {
        trailing: true,
        leading: true,
      }),
    ),
    { initialValue: [] },
  );

  public togglePause(): void {
    if (this.marketFeed.status() === 'running') {
      this.marketFeed.pause();
      return;
    }
    if (this.marketFeed.status() === 'paused') this.marketFeed.resume();
  }
}
