import { Component, inject } from '@angular/core';
import { MarketFeedService } from '../../core/services/market-feed.service';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
})
export class DashboardPage {
  public readonly marketFeed = inject(MarketFeedService);

  public togglePause(): void {
    if (this.marketFeed.status() === 'running') {
      this.marketFeed.pause();
      return;
    }
    if (this.marketFeed.status() === 'paused') this.marketFeed.resume();
  }
}
