import { MarketUpdateField } from '@generator/assembly/market-update-layout';

type WasmGeneratorModule = typeof import('@generator/build/release.js');

interface RawGenerator {
  init: WasmGeneratorModule['init'];
  generate(batchSize: number): number;
  getInstruments(): number;
  memory: WebAssembly.Memory;
}

export interface WasmMarketGenerator extends Omit<RawGenerator, 'getInstruments' | 'generate'> {
  getInstruments: () => string[];
  generate(batchSize: number): Uint32Array;
}

export async function loadWasmGenerator(): Promise<WasmMarketGenerator> {
  const rspns = await fetch('wasm/release.wasm');
  console.log('✎: [line 7][wasm-generator.loader.ts] rspns: ', rspns);

  const { instance } = await WebAssembly.instantiateStreaming(rspns, {
    env: {
      abort: (
        _messagePtr: number,
        _fileNamePtr: number,
        lineNumber: number,
        columnNumber: number,
      ) => {
        throw new Error(`Abort on ${lineNumber}:${columnNumber}`);
      },
      seed: () => 0,
    },
  });

  const rawExports = instance.exports as unknown as RawGenerator;

  return {
    memory: rawExports.memory,
    init: rawExports.init,
    getInstruments: (): string[] =>
      getRawDataReader(rawExports.memory).readRawStringArray(rawExports.getInstruments()),
    generate: (batchSize: number) => {
      const generatedDataPtr = rawExports.generate(batchSize);
      return new Uint32Array(
        rawExports.memory.buffer,
        generatedDataPtr,
        batchSize * MarketUpdateField.Count,
      );
    },
  };
}

// NOTE: this is rough copy of generator/build/release.js
function getRawDataReader(mem: WebAssembly.Memory) {
  let dataview: DataView;

  const initDataView = () => (dataview = new DataView(mem.buffer));
  initDataView();

  function readRawStringArray(ptr: number): string[] {
    if (ptr === 0) {
      return [];
    }

    const dataview = new DataView(mem.buffer);
    const dataStartPtr = getI32(ptr + 4);
    const arrayLength = getI32(ptr + 12);

    const res = [];

    for (let i = 0; i < arrayLength; i++) {
      const stringPtr = dataview.getUint32(dataStartPtr + i * 4, true);

      const byteLength = dataview.getUint32(stringPtr - 4, true);

      const codeUnitCount = byteLength / 2;

      const rawString = new Uint16Array(dataview.buffer, stringPtr, codeUnitCount);

      res.push(String.fromCharCode(...rawString));
    }

    return res;
  }

  function getI32(ptr: number): number {
    try {
      return dataview.getInt32(ptr, true);
    } catch {
      initDataView();
      return dataview.getInt32(ptr, true);
    }
  }

  return { readRawStringArray };
}
