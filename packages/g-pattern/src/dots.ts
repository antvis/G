import { Canvas } from '@antv/g-lite';
import type { DotPatternCfg } from './interfaces';
import {
  drawBackground,
  getSymbolsPosition,
  getUnitPatternSize,
  initCanvas,
} from './util';

export const defaultDotPatternCfg = {
  size: 6,
  padding: 2,
  backgroundColor: 'none',
  opacity: 1,
  fill: '#fff',
  fillOpacity: 1,
  stroke: 'none',
  strokeOpacity: 1,
  lineWidth: 0,
  isStagger: true,
};

export function drawDot(
  context: CanvasRenderingContext2D,
  cfg: DotPatternCfg,
  x: number,
  y: number,
) {
  const { size, fill, lineWidth, stroke, opacity, fillOpacity, strokeOpacity } =
    cfg;

  context.beginPath();
  context.fillStyle = fill;
  context.strokeStyle = stroke;
  context.lineWidth = lineWidth;
  context.arc(x, y, size / 2, 0, 2 * Math.PI, false);
  context.globalAlpha = opacity * fillOpacity;
  context.fill();
  if (lineWidth) {
    context.globalAlpha = opacity * strokeOpacity;
    context.stroke();
  }
  context.closePath();
}

export function dots(canvas: Canvas, cfg?: DotPatternCfg): HTMLCanvasElement {
  const dotCfg = {
    ...defaultDotPatternCfg,
    ...cfg,
  };

  const { size, padding, isStagger } = dotCfg;

  // 计算 画布大小，dots的位置
  const unitSize = getUnitPatternSize(size, padding, isStagger);
  const dots = getSymbolsPosition(unitSize, isStagger);

  // 初始化 patternCanvas
  const [$canvas, context] = initCanvas(canvas, unitSize, unitSize);

  // 绘制 background，dots
  drawBackground(context, dotCfg, unitSize);
  for (const [x, y] of dots) {
    drawDot(context, dotCfg, x, y);
  }

  return $canvas;
}
