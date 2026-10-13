export interface SharedInstrumentMemory {
  buffer: SharedArrayBuffer;
  count: number;
  slotWidth: number;
}

export function createSharedInstrumentMemory(
  instruments: readonly string[],
): SharedInstrumentMemory | null {
  if (!globalThis.crossOriginIsolated || typeof SharedArrayBuffer === 'undefined') return null;

  const maxLength = instruments.reduce((max, instrument) => Math.max(max, instrument.length), 0);
  const slotWidth = maxLength + 1;
  const buffer = new SharedArrayBuffer(instruments.length * slotWidth * Int32Array.BYTES_PER_ELEMENT);
  const view = new Int32Array(buffer);

  instruments.forEach((instrument, index) => {
    const offset = index * slotWidth;
    view[offset] = instrument.length;

    for (let charIndex = 0; charIndex < instrument.length; charIndex++) {
      view[offset + 1 + charIndex] = instrument.charCodeAt(charIndex);
    }
  });

  return { buffer, count: instruments.length, slotWidth };
}

export function readSharedInstrumentMemory(memory: SharedInstrumentMemory): string[] {
  const view = new Int32Array(memory.buffer);
  const instruments = new Array<string>(memory.count);

  for (let index = 0; index < memory.count; index++) {
    const offset = index * memory.slotWidth;
    const length = view[offset];
    instruments[index] = String.fromCharCode(...view.subarray(offset + 1, offset + 1 + length));
  }

  return instruments;
}
