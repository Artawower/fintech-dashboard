export function randIntRange(min: i32, max: i32): i32 {
  return min + <i32>Math.floor(Math.random() * (max - min + 1));
}

export function choice<T>(arr: Array<T>): T {
  assert(arr.length > 0, 'Cannot choose from an empty array');
  const index = <i32>Math.floor(Math.random() * arr.length);

  return arr[index];
}

export function direction(): i32 {
  return Math.random() > 0.5 ? 1 : -1;
}

export function pick<T>(v1: T, v2: T): T {
  return Math.random() > 0.5 ? v1 : v2;
}
