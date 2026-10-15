import { Component, inject } from '@angular/core';
import { MarketFeedService } from '@app/core/services/market-feed.service';
import { InstrumentStatisticsTable } from './components/instrument-statistics-table.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { asyncScheduler, throttleTime } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  imports: [InstrumentStatisticsTable],
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPage {
  public readonly marketFeed = inject(MarketFeedService);
  public readonly environment = environment;

  public readonly statistics = toSignal(
    this.marketFeed.statistics$.pipe(
      // throttleTime(0, animationFrameScheduler, { // If we need a real time update
      throttleTime(environment.uiRefreshInterval, asyncScheduler, {
        trailing: true,
        leading: true,
      }),
    ),
    { initialValue: new Float64Array() },
  );

  public togglePause(): void {
    if (this.marketFeed.status() === 'running') {
      this.marketFeed.pause();
      return;
    }
    if (this.marketFeed.status() === 'paused') this.marketFeed.resume();
  }
}
