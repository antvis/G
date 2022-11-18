import { Canvas } from '@antv/g-lite';
import type { SquarePatternCfg } from './interfaces';
import {
  drawBackground,
  getSymbolsPosition,
  getUnitPatternSize,
  initCanvas,
} from './util';

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
 * 绘制square
 *
 * @param context canvasContext
 * @param cfg squarePattern 的配置
 * @param x和y square的中心位置
 */
export function drawSquare(
  context: CanvasRenderingContext2D,
  cfg: SquarePatternCfg,
  x: number,
  y: number,
) {
  const { stroke, size, fill, lineWidth, fillOpacity, opacity, strokeOpacity } =
    cfg;

  context.strokeStyle = stroke;
  context.lineWidth = lineWidth;
  context.fillStyle = fill;
  // 因为正方形绘制从左上角开始，所以x，y做个偏移

  context.globalAlpha = opacity * strokeOpacity;
  context.strokeRect(x - size / 2, y - size / 2, size, size);

  context.globalAlpha = opacity * fillOpacity;
  context.fillRect(x - size / 2, y - size / 2, size, size);
}

/**
 * 创建 squarePattern
 */
export function squares(
  canvas: Canvas,
  cfg?: SquarePatternCfg,
): HTMLCanvasElement {
  const squareCfg = {
    ...defaultSquarePatternCfg,
    ...cfg,
  };

  const { size, padding, isStagger } = squareCfg;

  // 计算 画布大小，squares的位置
  const unitSize = getUnitPatternSize(size, padding, isStagger);
  const squares = getSymbolsPosition(unitSize, isStagger); // 计算方法与 dots 一样

  // 初始化 patternCanvas
  const [$canvas, context] = initCanvas(canvas, unitSize, unitSize);

  // 绘制 background，squares
  drawBackground(context, squareCfg, unitSize);
  for (const [x, y] of squares) {
    drawSquare(context, squareCfg, x, y);
  }

  return $canvas;
}
