import { Rect } from '@antv/g-lite';
import type { SquarePatternCfg } from './interfaces';
import { getSymbolsPosition, getUnitPatternSize } from './util';

/**
 * squarePattern 的 默认配置
 */
export const defaultSquarePatternCfg = {
  size: 6,
  padding: 1,
  isStagger: true,
  backgroundColor: 'transparent',
  opacity: 1,
  fill: '#fff',
  fillOpacity: 1,
  stroke: 'transparent',
  lineWidth: 0,
};

/**
 * 创建 squarePattern
 */
export function squares(cfg?: SquarePatternCfg): Rect {
  const squareCfg = {
    ...defaultSquarePatternCfg,
    ...cfg,
  };

  const {
    size,
    padding,
    isStagger,
    backgroundColor,
    backgroundOpacity,
    opacity,
    fill,
    fillOpacity,
    stroke,
    strokeOpacity,
    lineWidth,
  } = squareCfg;

  // 计算 画布大小，squares的位置
  const unitSize = getUnitPatternSize(size, padding, isStagger);
  const squares = getSymbolsPosition(unitSize, isStagger); // 计算方法与 dots 一样

  const background = new Rect({
    style: {
      width: unitSize,
      height: unitSize,
      fill: backgroundColor,
      opacity: 1,
      fillOpacity: backgroundOpacity,
    },
  });

  for (const [x, y] of squares) {
    const square = new Rect({
      style: {
        opacity,
        fill,
        fillOpacity,
        x: x - size / 2,
        y: y - size / 2,
        width: size,
        height: size,
        lineWidth,
        stroke,
        strokeOpacity,
      },
    });
    background.appendChild(square);
  }

  return background;
}
