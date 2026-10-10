export function randIntRange(min: i32, max: i32): i32 {
  return min + <i32>Math.floor(Math.random() * (max - min + 1));
}

export function choice<T>(arr: Array<T>): T {
  assert(arr.length > 0, 'Cannot choose from an empty array');
  const index = <i32>Math.floor(Math.random() * arr.length);

  return arr[index];
}
