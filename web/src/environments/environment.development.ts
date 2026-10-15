import { Environment } from './environment.type';

// NOTE: for better detection of CPU/memory issues
export const environment: Environment = {
  uiRefreshInterval: 200,

  instrumentCount: 50,
  updatesPerBatch: 1000,
  updateIntervalMs: 50,

  hideTable: false, // Better profiling
};
