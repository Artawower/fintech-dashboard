import { DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import {
  InstrumentStatisticField,
  type InstrumentStatistics,
} from '@app/core/models/instrument-statistics.model';
import { CentsToDollarsPipe } from '@app/shared/pipes/cents-to-dollars.pipe';

@Component({
  imports: [DecimalPipe, CentsToDollarsPipe],
  selector: 'app-instrument-statistics-table',
  templateUrl: './instrument-statistics-table.component.html',
})
export class InstrumentStatisticsTable {
  public readonly statistics = input.required<InstrumentStatistics | null>();
  public readonly instruments = input.required<readonly string[]>();
  public readonly error = input<string | null>(null);
  public readonly fields = InstrumentStatisticField;
  public readonly instrumentCount = computed(
    () => (this.statistics()?.length ?? 0) / InstrumentStatisticField.Count,
  );
  public readonly offsets = computed(() =>
    Array.from(
      { length: this.instrumentCount() },
      (_, index) => index * InstrumentStatisticField.Count,
    ),
  );

  public availableValue(value: number): number | null {
    return Number.isNaN(value) ? null : value;
  }

  public unavailableAriaLabel(value: number | null): string | null {
    return value === null ? 'Unavailable' : null;
  }
}
