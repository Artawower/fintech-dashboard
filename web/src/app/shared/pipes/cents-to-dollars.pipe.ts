import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'centsToDollars' })
export class CentsToDollarsPipe implements PipeTransform {
  public transform(cents: number): number {
    return cents / 100;
  }
}
