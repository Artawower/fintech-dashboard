import { readFile } from 'node:fs/promises';

type GeneratorExports = Pick<
  typeof import('../build/release.js'),
  'init' | 'generate'
>;

export async function loadGenerator(seed: number) {
  const wasm = await readFile(new URL('../build/release.wasm', import.meta.url));
  const { instance } = await WebAssembly.instantiate(wasm, {
    env: {
      seed: () => seed,
      abort: (_message: number, _fileName: number, line: number, column: number) => {
        throw new Error(`AssemblyScript aborted at ${line}:${column}`);
      },
    },
  });
  const { init, generate } = instance.exports as GeneratorExports;

  return { init, generate };
}
