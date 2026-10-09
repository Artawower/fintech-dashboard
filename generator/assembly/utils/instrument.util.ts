import { randIntRange } from './random.util';

export function generateInstrument(length: i8): string {
  let code = '';
  const minCode = 'A'.charCodeAt(0);
  const maxCode = 'Z'.charCodeAt(0);

  for (let i: i8 = 0; i < length; i++) {
    code += String.fromCharCode(randIntRange(minCode, maxCode));
  }

  return code;
}
