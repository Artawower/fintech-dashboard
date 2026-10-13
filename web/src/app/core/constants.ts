import { MarketSettings } from './models/market-settings.model';

export const PROJECT_NAME = 'Fintech Dashboard';

export const DEFAULT_MARKET_SETTINGS: MarketSettings = {
  instrumentCount: 50,
  updatesPerBatch: 1000,
  updateIntervalMs: 50,
};
