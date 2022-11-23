import { Circle, Rect } from '@antv/g-lite';
import type { DotPatternCfg } from './interfaces';
import { getSymbolsPosition, getUnitPatternSize } from './util';

export const defaultDotPatternCfg = {
  size: 6,
  padding: 2,
  backgroundColor: 'transparent',
  opacity: 1,
  fill: '#fff',
  fillOpacity: 1,
  stroke: 'transparent',
  strokeOpacity: 1,
  lineWidth: 0,
  isStagger: true,
};

export function dots(cfg?: DotPatternCfg): Rect {
  const dotCfg = {
    ...defaultDotPatternCfg,
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
    lineWidth,
    stroke,
    strokeOpacity,
  } = dotCfg;

  // 计算 画布大小，dots的位置
  const unitSize = getUnitPatternSize(size, padding, isStagger);
  const dots = getSymbolsPosition(unitSize, isStagger);

  const background = new Rect({
    style: {
      width: unitSize,
      height: unitSize,
      fill: backgroundColor,
      opacity: 1,
      fillOpacity: backgroundOpacity,
    },
  });

  for (const [cx, cy] of dots) {
    const circle = new Circle({
      style: {
        opacity,
        fill,
        fillOpacity,
        cx,
        cy,
        r: size / 2,
        lineWidth,
        stroke,
        strokeOpacity,
      },
    });
    background.appendChild(circle);
  }

  return background;
}
