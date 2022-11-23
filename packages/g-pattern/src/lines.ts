import { Rect, Path } from '@antv/g-lite';
import type { LinePatternCfg } from './interfaces';

/**
 * linePattern 的 默认配置
 */
export const defaultLinePatternCfg = {
  spacing: 5,
  opacity: 1,
  backgroundColor: 'transparent',
  backgroundOpacity: 1,
  strokeOpacity: 1,
  stroke: '#fff',
  lineWidth: 2,
};

/**
 * 创建 linePattern
 */
export function lines(cfg?: LinePatternCfg): Rect {
  const lineCfg = {
    ...defaultLinePatternCfg,
    ...cfg,
  };

  const {
    spacing,
    lineWidth,
    backgroundColor,
    backgroundOpacity,
    opacity,
    stroke,
    strokeOpacity,
  } = lineCfg;

  // 计算 pattern 画布的大小， path 所需的 d
  const width = spacing + lineWidth || 1;
  const height = spacing + lineWidth || 1;
  const d = `
            M 0 0 L ${width} 0
            M 0 ${height} L ${width} ${height}
            `;

  const background = new Rect({
    style: {
      width,
      height,
      fill: backgroundColor,
      opacity: 1,
      fillOpacity: backgroundOpacity,
    },
  });

  const path = new Path({
    style: {
      d,
      opacity,
      stroke,
      strokeOpacity,
      fillOpacity: 1,
      lineWidth,
    },
  });

  background.appendChild(path);

  return background;
}
