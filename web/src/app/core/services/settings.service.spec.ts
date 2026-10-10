import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DEFAULT_MARKET_SETTINGS } from '../constants';
import { MarketSettings } from '../models/market-settings.model';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  it('should initialize with default market settings in signal and getter', () => {
    const service = TestBed.inject(SettingsService);
    expect(service.settings()).toEqual(DEFAULT_MARKET_SETTINGS);
    expect(service.currentSettings).toEqual(DEFAULT_MARKET_SETTINGS);
  });

  it('should emit new settings on settings$ observable when updated', () => {
    const service = TestBed.inject(SettingsService);
    const emitted: MarketSettings[] = [];
    const sub = service.settings$.subscribe((settings) => emitted.push(settings));

    const newSettings: MarketSettings = {
      instrumentCount: 10,
      updatesPerBatch: 200,
      updateIntervalMs: 1000,
    };

    service.updateSettings(newSettings);
    expect(emitted).toEqual([DEFAULT_MARKET_SETTINGS, newSettings]);
    expect(service.settings()).toEqual(newSettings);
    expect(service.currentSettings).toEqual(newSettings);

    sub.unsubscribe();
  });

  it('should reset to default market settings when resetToDefault is called', () => {
    const service = TestBed.inject(SettingsService);
    service.updateSettings({
      instrumentCount: 25,
      updatesPerBatch: 500,
      updateIntervalMs: 250,
    });

    service.resetToDefault();
    expect(service.settings()).toEqual(DEFAULT_MARKET_SETTINGS);
    expect(service.currentSettings).toEqual(DEFAULT_MARKET_SETTINGS);
  });
});
