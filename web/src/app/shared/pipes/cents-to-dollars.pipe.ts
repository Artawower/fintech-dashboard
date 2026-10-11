import { Pipe, PipeTransform } from '@angular/core';

const USD_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

@Pipe({ name: 'centsToDollars' })
export class CentsToDollarsPipe implements PipeTransform {
  public transform(cents: number | null | undefined, fallback = '—'): string {
    return cents != null ? USD_FORMATTER.format(cents / 100) : fallback;
  }
}

