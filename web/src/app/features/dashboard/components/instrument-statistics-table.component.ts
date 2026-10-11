import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import type { InstrumentStatistics } from '@app/core/models/instrument-statistics.model';
import { CentsToDollarsPipe } from '@app/shared/pipes/cents-to-dollars.pipe';

@Component({
  imports: [DecimalPipe, CentsToDollarsPipe],
  selector: 'app-instrument-statistics-table',
  templateUrl: './instrument-statistics-table.component.html',
})
export class InstrumentStatisticsTable {
  public readonly statistics = input.required<InstrumentStatistics[]>();
  public readonly error = input<string | null>(null);

  public unavailableAriaLabel(value: number | null): string | null {
    return value === null ? 'Unavailable' : null;
  }
}

