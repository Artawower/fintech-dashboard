export function randIntRange(min: i32, max: i32): i32 {
  return min + <i32>Math.floor(Math.random() * (max - min + 1));
}
