import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { startWith, switchMap } from 'rxjs';

@Component({
  imports: [ReactiveFormsModule, NgTemplateOutlet],
  host: { class: 'block' },
  selector: 'app-number-field',
  templateUrl: './number-field.component.html',
})
export class NumberField {
  readonly inputId = input.required<string>();
  readonly inputName = input.required<string>();
  readonly label = input.required<string>();
  readonly control = input.required<FormControl<number>>();
  readonly min = input.required<number>();
  readonly max = input.required<number>();
  readonly step = input<number>(1);
  readonly rangeUnit = input<string>('');
  readonly errorUnit = input<string>('');
  readonly suffix = input<string>('');

  protected readonly labelId = computed(() => `${this.inputId()}-label`);
  protected readonly helpId = computed(() => `${this.inputId()}-help`);
  protected readonly errorId = computed(() => `${this.inputId()}-error`);
  protected readonly describedBy = computed(() => `${this.helpId()} ${this.errorId()}`);

  private readonly controlEvents = toSignal(
    toObservable(this.control).pipe(
      switchMap((control) => control.events.pipe(startWith(null))),
    ),
    { initialValue: null },
  );

  protected readonly isInvalid = computed(() => {
    this.controlEvents();
    const control = this.control();
    return control.invalid && (control.dirty || control.touched);
  });

  protected readonly errorMessage = computed(() => {
    this.controlEvents();
    const control = this.control();
    const label = this.label();
    const unitSuffix = this.errorUnit() ? ` ${this.errorUnit()}` : '';

    if (control.hasError('required')) {
      return `${label} is required.`;
    }
    if (control.hasError('integer')) {
      return `${label} must be an integer.`;
    }
    if (control.hasError('min')) {
      return `${label} must be at least ${this.min()}${unitSuffix}.`;
    }
    if (control.hasError('max')) {
      return `${label} must not exceed ${this.max()}${unitSuffix}.`;
    }
    return null;
  });
}
