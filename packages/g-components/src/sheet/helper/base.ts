/**
 * 进制转换
 */

const BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * 文本转数字
 * AA -> 1 * 26 + 1
 * @param i
 */
export function toNumber(s: string) {
  let r = 0;
  let length = s.length;

  for (let idx = 0; idx < length; idx++) {
    const curr = BASE.indexOf(s[idx]) + 1;

    r = r + curr * Math.pow(BASE.length, length - idx - 1);
  }

  return r;
}

/**
 * 数字转文本
 * 0 -> A , 26 -> AA
 * @param i
 */
export function toString(i: number) {
  let r = [];
  let e = i;

  // 长除法，比较特殊的是进制数从 1 开始，而不是从 0 开始
  do {
    e--;
    const j = e % BASE.length;
    r.unshift(BASE[j]);

    e = (e - j) / BASE.length;
  } while (e > 0);

  return r.join('');
}
