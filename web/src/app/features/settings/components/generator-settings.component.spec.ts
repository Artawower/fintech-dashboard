import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { DEFAULT_MARKET_SETTINGS } from '../../../core/constants';
import { SETTINGS_LIMITS } from '../settings.constants';
import { GeneratorSettings } from './generator-settings.component';

describe('GeneratorSettings', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [GeneratorSettings] }).compileComponents();
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

  it('should log the current settings when they are applied', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(GeneratorSettings);
    fixture.detectChanges();

    fixture.componentInstance.settingsForm.controls.instrumentCount.setValue(8);
    expect(log).not.toHaveBeenCalled();

    const element = fixture.nativeElement as HTMLElement;
    const form = element.querySelector<HTMLFormElement>('form');
    form!.dispatchEvent(new Event('submit'));

    expect(log).toHaveBeenCalledWith('Settings applied:', {
      ...DEFAULT_MARKET_SETTINGS,
      instrumentCount: 8,
    });
  });
});
