import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { integerValidator } from './integer.validator';

describe('integerValidator', () => {
  it('should return null for empty values (null, undefined, empty string)', () => {
    expect(integerValidator(new FormControl(null))).toBeNull();
    expect(integerValidator(new FormControl(undefined))).toBeNull();
    expect(integerValidator(new FormControl(''))).toBeNull();
  });

  it('should return null for valid integers', () => {
    expect(integerValidator(new FormControl(0))).toBeNull();
    expect(integerValidator(new FormControl(1))).toBeNull();
    expect(integerValidator(new FormControl(-5))).toBeNull();
    expect(integerValidator(new FormControl(100))).toBeNull();
  });

  it('should return { integer: true } for non-integer numbers and strings', () => {
    expect(integerValidator(new FormControl(1.5))).toEqual({ integer: true });
    expect(integerValidator(new FormControl(-0.01))).toEqual({ integer: true });
    expect(integerValidator(new FormControl(NaN))).toEqual({ integer: true });
    expect(integerValidator(new FormControl(Infinity))).toEqual({ integer: true });
    expect(integerValidator(new FormControl('abc'))).toEqual({ integer: true });
  });
});
