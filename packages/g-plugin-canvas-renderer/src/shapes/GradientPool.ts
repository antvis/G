import { LinearGradient, RadialGradient, PARSED_COLOR_TYPE } from '@antv/g';
import { injectable } from 'inversify';

export type GradientParams = (LinearGradient | RadialGradient) & { width: number; height: number; type: PARSED_COLOR_TYPE; };

@injectable()
export class GradientPool {
  private gradientCache: Record<string, CanvasGradient> = {};

  getOrCreateGradient(params: GradientParams, context: CanvasRenderingContext2D) {
    const key = this.generateCacheKey(params);
    const { type, x0, y0, x1, y1, steps, width, height } = params;

    if (this.gradientCache[key]) {
      return this.gradientCache[key];
    }

    let gradient: CanvasGradient | null = null;
    if (type === PARSED_COLOR_TYPE.LinearGradient) {
      // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
      gradient = context.createLinearGradient(
        x0 * width,
        y0 * height,
        x1 * width,
        y1 * height,
      );
    } else if (type === PARSED_COLOR_TYPE.RadialGradient) {
      const r = Math.sqrt(width * width + height * height) / 2;
      // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createRadialGradient
      gradient = context.createRadialGradient(
        x0 * width,
        y0 * height,
        0,
        x1 * width,
        y1 * height,
        (params as RadialGradient).r1 * r,
      );
    }

    if (gradient) {
      steps.forEach(([offset, color]) => {
        gradient?.addColorStop(Number(offset), color);
      });

      this.gradientCache[key] = gradient;
    }

    return this.gradientCache[key];
  }

  private generateCacheKey(params: GradientParams): string {
    // @ts-ignore
    const { type, x0, y0, x1, y1, r1, steps, width, height } = params;
    return `gradient-${type}-${x0}-${y0}-${x1}-${y1}-${r1 || 0}-${width}-${height}-${steps.map((step) => step.join('')).join('-')}`;
  }
}
