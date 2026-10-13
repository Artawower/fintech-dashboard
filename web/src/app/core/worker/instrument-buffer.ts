export interface TransferableInstrumentBuffer {
  buffer: ArrayBuffer;
  count: number;
  slotWidth: number;
}

export function createInstrumentBuffer(instruments: readonly string[]): TransferableInstrumentBuffer {
  const maxLength = instruments.reduce((max, instrument) => Math.max(max, instrument.length), 0);
  const slotWidth = maxLength + 1;
  const buffer = new ArrayBuffer(instruments.length * slotWidth * Uint16Array.BYTES_PER_ELEMENT);
  const view = new Uint16Array(buffer);

  instruments.forEach((instrument, index) => {
    const offset = index * slotWidth;
    view[offset] = instrument.length;

    for (let charIndex = 0; charIndex < instrument.length; charIndex++) {
      view[offset + 1 + charIndex] = instrument.charCodeAt(charIndex);
    }
  });

  return { buffer, count: instruments.length, slotWidth };
}

export function readInstrumentBuffer(memory: TransferableInstrumentBuffer): string[] {
  const view = new Uint16Array(memory.buffer);
  const instruments = new Array<string>(memory.count);

  for (let index = 0; index < memory.count; index++) {
    const offset = index * memory.slotWidth;
    const length = view[offset];
    instruments[index] = String.fromCharCode(...view.subarray(offset + 1, offset + 1 + length));
  }

  return instruments;
}
