import { Service } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject } from 'rxjs';
import { DEFAULT_MARKET_SETTINGS } from '../constants';
import { MarketSettings } from '../models/market-settings.model';

@Service()
export class SettingsService {
  private readonly settingsSubject$ = new BehaviorSubject<MarketSettings>(DEFAULT_MARKET_SETTINGS);

  public readonly settings$ = this.settingsSubject$.asObservable();

  public readonly settings = toSignal(this.settings$, {
    initialValue: DEFAULT_MARKET_SETTINGS,
  });

  public get currentSettings(): MarketSettings {
    return this.settingsSubject$.value;
  }

  public updateSettings(settings: MarketSettings): void {
    this.settingsSubject$.next(settings);
  }

  public resetToDefault(): void {
    this.settingsSubject$.next(DEFAULT_MARKET_SETTINGS);
  }
}
