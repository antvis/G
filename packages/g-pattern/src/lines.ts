import { Rect, Path } from '@antv/g-lite';
import type { LinePatternCfg } from './interfaces';

/**
 * linePattern 的 默认配置
 */
export const defaultLinePatternCfg = {
  spacing: 5,
  opacity: 1,
  backgroundColor: 'transparent',
  strokeOpacity: 1,
  stroke: '#fff',
  lineWidth: 2,
};

/**
 * 绘制line
 *
 * @param context canvasContext
 * @param cfg linePattern 的配置
 * @param d 绘制 path 所需的 d
 */
// export function drawLine(
//   context: CanvasRenderingContext2D,
//   cfg: LinePatternCfg,
//   d: string,
// ) {
//   const { stroke, lineWidth, strokeOpacity, opacity } = cfg;
//   const path = new Path2D(d);

//   context.globalAlpha = opacity * strokeOpacity;
//   context.lineCap = 'square';
//   context.strokeStyle = lineWidth ? stroke : 'transparent';
//   context.lineWidth = lineWidth;
//   context.stroke(path);
// }

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
      opacity,
    },
  });

  const path = new Path({
    style: {
      d,
      opacity,
      stroke,
      strokeOpacity,
      lineWidth,
    },
  });

  background.appendChild(path);

  return background;
}
