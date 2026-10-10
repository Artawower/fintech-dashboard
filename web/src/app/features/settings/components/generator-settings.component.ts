import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NumberField } from '../../../shared/components/number-field.component';
import { integerValidator } from '../../../shared/validators/integer.validator';
import { SettingsService } from '../../../core/services/settings.service';
import { MarketSettings } from '../../../core/models/market-settings.model';
import { SETTINGS_LIMITS } from '../settings.constants';

@Component({
  imports: [ReactiveFormsModule, NumberField],
  selector: 'app-generator-settings',
  templateUrl: './generator-settings.component.html',
})
export class GeneratorSettings {
  private readonly formBuilder = inject(FormBuilder);
  private readonly settingsService = inject(SettingsService);

  protected readonly limits = SETTINGS_LIMITS;

  readonly settingsForm = this.formBuilder.nonNullable.group({
    instrumentCount: [
      this.settingsService.settings().instrumentCount,
      [
        Validators.required,
        integerValidator,
        Validators.min(SETTINGS_LIMITS.instrumentCount.min),
        Validators.max(SETTINGS_LIMITS.instrumentCount.max),
      ],
    ],
    updatesPerBatch: [
      this.settingsService.settings().updatesPerBatch,
      [
        Validators.required,
        integerValidator,
        Validators.min(SETTINGS_LIMITS.updatesPerBatch.min),
        Validators.max(SETTINGS_LIMITS.updatesPerBatch.max),
      ],
    ],
    updateIntervalMs: [
      this.settingsService.settings().updateIntervalMs,
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
    this.settingsService.updateSettings(settings);
  }
}
