import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { DEFAULT_MARKET_SETTINGS } from '../../../core/constants';
import { SettingsService } from '../../../core/services/settings.service';
import { SETTINGS_LIMITS } from '../settings.constants';
import { GeneratorSettings } from './generator-settings.component';

describe('GeneratorSettings', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [GeneratorSettings] }).compileComponents();
    TestBed.inject(SettingsService).resetToDefault();
  });

  afterEach(() => vi.restoreAllMocks());

  it('should initialize with the default market settings', () => {
    const fixture = TestBed.createComponent(GeneratorSettings);
    const component = fixture.componentInstance;

    expect(component.settingsForm.getRawValue()).toEqual(DEFAULT_MARKET_SETTINGS);
    expect(component.settingsForm.valid).toBe(true);
  });

  it('should reject values outside the configured limits', () => {
    const fixture = TestBed.createComponent(GeneratorSettings);
    const controls = fixture.componentInstance.settingsForm.controls;

    controls.instrumentCount.setValue(SETTINGS_LIMITS.instrumentCount.max + 1);
    controls.instrumentCount.markAsTouched();
    controls.updatesPerBatch.setValue(SETTINGS_LIMITS.updatesPerBatch.min - 1);
    controls.updateIntervalMs.setValue(SETTINGS_LIMITS.updateIntervalMs.max + 1);
    fixture.detectChanges();

    expect(controls.instrumentCount.hasError('max')).toBe(true);
    expect(controls.updatesPerBatch.hasError('min')).toBe(true);
    expect(controls.updateIntervalMs.hasError('max')).toBe(true);
    expect(fixture.componentInstance.settingsForm.invalid).toBe(true);

    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector<HTMLInputElement>('[name="instrumentCount"]');
    const error = element.querySelector<HTMLElement>('#instrument-count-error');

    expect(input?.classList.contains('input-error')).toBe(true);
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(error?.textContent).toContain(`must not exceed ${SETTINGS_LIMITS.instrumentCount.max}`);
  });

  it('should reject non-integer (fractional) settings', () => {
    const fixture = TestBed.createComponent(GeneratorSettings);
    const controls = fixture.componentInstance.settingsForm.controls;

    controls.instrumentCount.setValue(5.5);
    controls.instrumentCount.markAsTouched();
    controls.updatesPerBatch.setValue(10.2);
    controls.updatesPerBatch.markAsTouched();
    controls.updateIntervalMs.setValue(100.75);
    controls.updateIntervalMs.markAsTouched();
    fixture.detectChanges();

    expect(controls.instrumentCount.hasError('integer')).toBe(true);
    expect(controls.updatesPerBatch.hasError('integer')).toBe(true);
    expect(controls.updateIntervalMs.hasError('integer')).toBe(true);
    expect(fixture.componentInstance.settingsForm.invalid).toBe(true);

    const element = fixture.nativeElement as HTMLElement; console.log(element.innerHTML);
    expect(element.querySelector('#instrument-count-error')?.textContent).toContain(
      'Instrument count must be an integer.',
    );
    expect(element.querySelector('#updates-per-batch-error')?.textContent).toContain(
      'Updates per batch must be an integer.',
    );
    expect(element.querySelector('#update-interval-error')?.textContent).toContain(
      'Batch interval must be an integer.',
    );
  });

  it('should accept inclusive integer boundary values', () => {
    const fixture = TestBed.createComponent(GeneratorSettings);
    const controls = fixture.componentInstance.settingsForm.controls;

    controls.instrumentCount.setValue(SETTINGS_LIMITS.instrumentCount.min);
    controls.updatesPerBatch.setValue(SETTINGS_LIMITS.updatesPerBatch.min);
    controls.updateIntervalMs.setValue(SETTINGS_LIMITS.updateIntervalMs.min);
    expect(fixture.componentInstance.settingsForm.valid).toBe(true);

    controls.instrumentCount.setValue(SETTINGS_LIMITS.instrumentCount.max);
    controls.updatesPerBatch.setValue(SETTINGS_LIMITS.updatesPerBatch.max);
    controls.updateIntervalMs.setValue(SETTINGS_LIMITS.updateIntervalMs.max);
    expect(fixture.componentInstance.settingsForm.valid).toBe(true);
  });

  it('should associate all form inputs with accessible labels', () => {
    const fixture = TestBed.createComponent(GeneratorSettings);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement; console.log(element.innerHTML);

    const fields = [
      { inputId: '#instrument-count', labelId: '#instrument-count-label', labelText: 'Instrument count' },
      { inputId: '#updates-per-batch', labelId: '#updates-per-batch-label', labelText: 'Updates per batch' },
      { inputId: '#update-interval', labelId: '#update-interval-label', labelText: 'Batch interval' },
    ];

    for (const field of fields) {
      const input = element.querySelector<HTMLInputElement>(field.inputId);
      const label = element.querySelector<HTMLElement>(field.labelId);
      expect(input?.getAttribute('aria-labelledby')).toBe(field.labelId.replace('#', ''));
      expect(label?.textContent?.trim()).toBe(field.labelText);
    }
  });

  it('should update SettingsService when settings are applied', () => {
    const fixture = TestBed.createComponent(GeneratorSettings);
    const settingsService = TestBed.inject(SettingsService);
    fixture.detectChanges();

    fixture.componentInstance.settingsForm.controls.instrumentCount.setValue(8);

    const element = fixture.nativeElement as HTMLElement;
    const form = element.querySelector<HTMLFormElement>('form');
    form!.dispatchEvent(new Event('submit'));

    expect(settingsService.settings()).toEqual({
      ...DEFAULT_MARKET_SETTINGS,
      instrumentCount: 8,
    });
  });

  it('should initialize form with current settings from SettingsService', () => {
    const settingsService = TestBed.inject(SettingsService);
    settingsService.updateSettings({
      instrumentCount: 12,
      updatesPerBatch: 250,
      updateIntervalMs: 800,
    });

    const fixture = TestBed.createComponent(GeneratorSettings);
    expect(fixture.componentInstance.settingsForm.getRawValue()).toEqual({
      instrumentCount: 12,
      updatesPerBatch: 250,
      updateIntervalMs: 800,
    });
  });
});
