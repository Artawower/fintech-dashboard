import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NumberField } from '../../../shared/components/number-field.component';
import { integerValidator } from '../../../shared/validators/integer.validator';
import { DEFAULT_MARKET_SETTINGS } from '../../../core/constants';
import { MarketSettings } from '../../../core/models/market-settings.model';
import { SETTINGS_LIMITS } from '../settings.constants';

@Component({
  imports: [ReactiveFormsModule, NumberField],
  selector: 'app-generator-settings',
  templateUrl: './generator-settings.component.html',
})
export class GeneratorSettings {
  private readonly formBuilder = inject(FormBuilder);

  protected readonly limits = SETTINGS_LIMITS;

  readonly settingsForm = this.formBuilder.nonNullable.group({
    instrumentCount: [
      DEFAULT_MARKET_SETTINGS.instrumentCount,
      [
        Validators.required,
        integerValidator,
        Validators.min(SETTINGS_LIMITS.instrumentCount.min),
        Validators.max(SETTINGS_LIMITS.instrumentCount.max),
      ],
    ],
    updatesPerBatch: [
      DEFAULT_MARKET_SETTINGS.updatesPerBatch,
      [
        Validators.required,
        integerValidator,
        Validators.min(SETTINGS_LIMITS.updatesPerBatch.min),
        Validators.max(SETTINGS_LIMITS.updatesPerBatch.max),
      ],
    ],
    updateIntervalMs: [
      DEFAULT_MARKET_SETTINGS.updateIntervalMs,
      [
        Validators.required,
        integerValidator,
        Validators.min(SETTINGS_LIMITS.updateIntervalMs.min),
        Validators.max(SETTINGS_LIMITS.updateIntervalMs.max),
      ],
    ],
  });

  protected readonly controls = this.settingsForm.controls;

  protected applySettings(): void {
    if (this.settingsForm.invalid) {
      return;
    }

    const settings: MarketSettings = this.settingsForm.getRawValue();
    console.log('Settings applied:', settings);
  }
}
