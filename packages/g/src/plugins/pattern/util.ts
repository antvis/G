/**
 * 计算贴图单元大小
 *
 * @param size 元素大小
 * @param padding 圆点间隔
 * @param isStagger 是否交错
 * @reutrn 返回贴图单元大小
 */
export function getUnitPatternSize(
  size: number,
  padding: number,
  isStagger: boolean,
): number {
  // 如果交错, unitSize 放大两倍
  const unitSize = size + padding;
  return isStagger ? unitSize * 2 : unitSize;
}

/**
 * 计算有交错情况的元素坐标
 *
 * @param unitSize 贴图单元大小
 * @param isStagger 是否交错
 * @reutrn 元素中心坐标 x,y 数组集合
 */
export function getSymbolsPosition(
  unitSize: number,
  isStagger: boolean,
): number[][] {
  // 如果交错, 交错绘制 dot
  const symbolsPos = isStagger
    ? [
        [unitSize * (1 / 4), unitSize * (1 / 4)],
        [unitSize * (3 / 4), unitSize * (3 / 4)],
      ]
    : [[unitSize * (1 / 2), unitSize * (1 / 2)]];
  return symbolsPos;
}
