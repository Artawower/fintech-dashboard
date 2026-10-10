import { MarketSettings } from '../../core/models/market-settings.model';

type SettingLimits = Record<keyof MarketSettings, Readonly<{ min: number; max: number }>>;

export const SETTINGS_LIMITS: SettingLimits = {
  instrumentCount: { min: 1, max: 50 },
  updatesPerBatch: { min: 1, max: 1000 },
  updateIntervalMs: { min: 50, max: 2000 },
};
