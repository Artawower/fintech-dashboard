import { MarketSettings } from './models/market-settings.model';

export const PROJECT_NAME = 'Fintech Dashboard';

export const DEFAULT_MARKET_SETTINGS: MarketSettings = {
  instrumentCount: 5,
  updatesPerBatch: 100,
  updateIntervalMs: 500,
};
