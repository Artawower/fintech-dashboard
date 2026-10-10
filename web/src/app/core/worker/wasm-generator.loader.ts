type WasmGeneratorModule = typeof import('../../../../../generator/build/release.js');

export type WasmMarketGenerator = Pick<
  WasmGeneratorModule,
  'init' | 'generate' | 'getInstruments'
>;

export async function loadWasmGenerator(wasmUrl: string): Promise<WasmMarketGenerator> {
  const moduleUrl = new URL('release.js', wasmUrl).href;
  return (await import(moduleUrl)) as WasmMarketGenerator;
}
