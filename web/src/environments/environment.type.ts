import { MarketSettings } from '@app/core/models/market-settings.model';

export type Environment = MarketSettings & {
  uiRefreshInterval: number;
  hideTable?: boolean;
};
