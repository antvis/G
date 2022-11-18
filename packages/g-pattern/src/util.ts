import { Canvas, runtime } from '@antv/g-lite';
import type { PatternCfg } from './interfaces';

/**
 * 初始化 cavnas，设置宽高等
 */
export function initCanvas(
  canvas: Canvas,
  width: number,
  height: number = width,
): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const { offscreenCanvas } = canvas.context.config;
  const $canvas = runtime.offscreenCanvas.getOrCreateCanvas(offscreenCanvas);
  const context = runtime.offscreenCanvas.getOrCreateContext(
    offscreenCanvas,
  ) as CanvasRenderingContext2D;

  // const $canvas = document.createElement('canvas');
  // const context = $canvas.getContext('2d');

  const dpr = canvas.context.contextService.getDPR();
  // 画布尺寸
  $canvas.width = width * dpr;
  $canvas.height = height * dpr;
  // 显示尺寸
  if (($canvas as HTMLCanvasElement).style) {
    ($canvas as HTMLCanvasElement).style.width = `${width}px`;
    ($canvas as HTMLCanvasElement).style.height = `${height}px`;
  }

  context.scale(dpr, dpr);

  return [$canvas as HTMLCanvasElement, context];
}

/**
 * 绘制背景
 *
 * @param context
 * @param cfg
 * @param width
 * @param height
 */
export function drawBackground(
  context: CanvasRenderingContext2D,
  cfg: PatternCfg,
  width: number,
  height: number = width,
) {
  const { backgroundColor, opacity } = cfg;

  context.globalAlpha = opacity;
  context.fillStyle = backgroundColor;

  context.beginPath();
  context.fillRect(0, 0, width, height);
  context.closePath();
}

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

/**
 * 给整个 pattern贴图 做变换, 目前支持旋转
 *
 * @param dpr  设备像素比
 * @param degree 旋转角度
 */
// export function transformMatrix(dpr: number, degree: number) {
//   const radian = deg2rad(degree);
//   const matrix = {
//     a: Math.cos(radian) * (1 / dpr),
//     b: Math.sin(radian) * (1 / dpr),
//     c: -Math.sin(radian) * (1 / dpr),
//     d: Math.cos(radian) * (1 / dpr),
//     e: 0,
//     f: 0,
//   };
//   return matrix;
// }
