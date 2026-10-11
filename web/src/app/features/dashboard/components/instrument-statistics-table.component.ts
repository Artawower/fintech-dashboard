import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import type { InstrumentStatistics } from '@app/core/models/instrument-statistics.model';

@Component({
  imports: [CurrencyPipe, DecimalPipe],
  selector: 'app-instrument-statistics-table',
  templateUrl: './instrument-statistics-table.component.html',
})
export class InstrumentStatisticsTable {
  public readonly statistics = input.required<InstrumentStatistics[]>();
  public readonly error = input<string | null>(null);
}
