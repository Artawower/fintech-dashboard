type WasmGeneratorModule = typeof import('@generator/build/release.js');

export type WasmMarketGenerator = Pick<
  WasmGeneratorModule,
  'init' | 'generate' | 'getInstruments'
>;

export async function loadWasmGenerator(): Promise<WasmMarketGenerator> {
  const moduleUrl = new URL('wasm/release.js', self.location.href).href;
  return (await import(moduleUrl)) as WasmMarketGenerator;
}
