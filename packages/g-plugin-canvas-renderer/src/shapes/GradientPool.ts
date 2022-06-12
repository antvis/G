import {
  computeLinearGradient,
  computeRadialGradient,
  GradientPatternType,
  LinearGradient,
  RadialGradient,
  singleton,
} from '@antv/g';

export type GradientParams = (LinearGradient | RadialGradient) & {
  width: number;
  height: number;
  type: GradientPatternType;
};

@singleton()
export class GradientPool {
  private gradientCache: Record<string, CanvasGradient> = {};

  getOrCreateGradient(params: GradientParams, context: CanvasRenderingContext2D) {
    const key = this.generateCacheKey(params);
    // @ts-ignore
    const { type, steps, width, height, angle, cx, cy } = params;

    if (this.gradientCache[key]) {
      return this.gradientCache[key];
    }

    let gradient: CanvasGradient | null = null;
    if (type === GradientPatternType.LinearGradient) {
      const { x1, y1, x2, y2 } = computeLinearGradient(width, height, angle);
      // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
      gradient = context.createLinearGradient(x1, y1, x2, y2);
    } else if (type === GradientPatternType.RadialGradient) {
      const { x, y, r } = computeRadialGradient(width, height, cx, cy);
      // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createRadialGradient
      gradient = context.createRadialGradient(x, y, 0, x, y, r);
    }

    if (gradient) {
      steps.forEach(([offset, color]) => {
        gradient?.addColorStop(offset, color);
      });

      this.gradientCache[key] = gradient;
    }

    return this.gradientCache[key];
  }

  private generateCacheKey(params: GradientParams): string {
    // @ts-ignore
    const { type, width, height, steps, angle, cx, cy } = params;
    return `gradient-${type}-${angle || 0}-${cx || 0}-${cy || 0}-${width}-${height}-${steps
      .map((step) => step.join(''))
      .join('-')}`;
  }
}
