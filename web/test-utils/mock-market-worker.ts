import { vi } from 'vitest';
import type { WorkerInboundMessage, WorkerOutboundMessage } from '../src/app/core/worker/market-worker.protocol';

export class MockMarketWorker {
  public static instances: MockMarketWorker[] = [];
  public readonly posted: WorkerInboundMessage[] = [];
  public readonly postMessage = vi.fn((message: WorkerInboundMessage) => this.posted.push(message));
  public onmessage: ((event: MessageEvent<WorkerOutboundMessage>) => void) | null = null;
  public onerror: ((event: ErrorEvent) => void) | null = null;
  public terminated = false;
  public readonly terminate = vi.fn(() => {
    this.terminated = true;
  });

  public constructor() {
    MockMarketWorker.instances.push(this);
  }

  public emit(message: WorkerOutboundMessage): void {
    this.onmessage?.(new MessageEvent('message', { data: message }));
  }
}
