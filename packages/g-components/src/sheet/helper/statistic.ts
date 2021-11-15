/**
 * 数组求和
 * @param arr
 */
export function sum(arr: number[]) {
  return arr.reduce((r, curr) => r + curr, 0);
}
