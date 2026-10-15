import { Environment } from './environment.type';

// NOTE: for better detection of CPU/memory issues
export const environment: Environment = {
  uiRefreshInterval: 200,

  instrumentCount: 500,
  updatesPerBatch: 10000,
  updateIntervalMs: 30,

  hideTable: true, // Better profiling
};
