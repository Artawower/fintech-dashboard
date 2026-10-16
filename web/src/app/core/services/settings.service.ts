import { Service } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject } from 'rxjs';
import { DEFAULT_MARKET_SETTINGS } from '@app/core/constants';
import { MarketSettings } from '@app/core/models/market-settings.model';
import { MARKET_SETTINGS_STORAGE_KEY } from '@app/core/settings.constants';

@Service()
export class SettingsService {
  private readonly settingsSubject$ = new BehaviorSubject<MarketSettings>(this.loadSettings());

  public readonly settings$ = this.settingsSubject$.asObservable();

  public readonly settings = toSignal(this.settings$, {
    requireSync: true,
  });

  public get currentSettings(): MarketSettings {
    return this.settingsSubject$.value;
  }

  public updateSettings(settings: MarketSettings): void {
    try {
      localStorage.setItem(MARKET_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Settings still apply in memory when storage is unavailable or full.
    }

    this.settingsSubject$.next(settings);
  }

  public resetToDefault(): void {
    this.updateSettings(DEFAULT_MARKET_SETTINGS);
  }

  private loadSettings(): MarketSettings {
    try {
      const stored = localStorage.getItem(MARKET_SETTINGS_STORAGE_KEY);
      if (stored === null) return DEFAULT_MARKET_SETTINGS;

      return JSON.parse(stored) as MarketSettings;
    } catch {
      // Invalid JSON and blocked storage must not prevent startup.
      return DEFAULT_MARKET_SETTINGS;
    }
  }

}
