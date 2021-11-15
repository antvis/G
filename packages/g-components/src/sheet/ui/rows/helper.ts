/**
 * 根据视窗的大小，已经里面元素的大小，计算视窗中存在的元素索引有哪些
 * |______________________________________________________________|
 * offset                                                          offset + size
 *
 * |____|_______|____________|_____|........|
 *   s0     s1        s2        s3     s...
 *
 * @param offset
 * @param size
 * @param sizes
 */
export function calculateViewportItems(offset: number, size: number, sizes: number[]): number[] {
  const result = [];
  let curr = 0;
  let next = curr;

  for (let idx = 0; idx < sizes.length; idx++) {
    const s = sizes[0];

    next = curr + s;
    /**
     * 落在了 offset ～  offset + width 区间，说明在视窗中
     * - 为了防止边界裁剪，这里判断是用闭区间
     * - 只要 curr 和 next 有一个落在区间就算
     */
    if ((curr >= offset && curr <= offset + size) || (next >= offset && next <= offset + size)) {
      result.push(idx);
    }

    // 提前 break 循环，提升性能
    if (next > offset + size) {
      break;
    }

    curr = next;
  }

  const head = result[0];
  const last = result[result.length - 1];

  return [head, last];
}
