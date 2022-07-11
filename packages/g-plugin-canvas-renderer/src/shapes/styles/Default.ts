import type {
  CSSGradientValue,
  CSSRGB,
  DisplayObject,
  LinearGradient,
  ParsedBaseStyleProps,
  Pattern,
  RadialGradient,
  RenderingService,
} from '@antv/g';
import { GradientType, inject, isNil, isPattern, singleton } from '@antv/g';
import { ImagePool } from '@antv/g-plugin-image-loader';
import type { StyleRenderer } from './interfaces';

@singleton()
export class DefaultRenderer implements StyleRenderer {
  @inject(ImagePool)
  private imagePool: ImagePool;

  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedBaseStyleProps,
    object: DisplayObject,
    renderingService: RenderingService,
  ) {
    const {
      fill,
      opacity,
      fillOpacity,
      stroke,
      strokeOpacity,
      lineWidth,
      lineCap,
      lineJoin,
      shadowType,
      shadowColor,
      shadowBlur,
      filter,
      miterLimit,
    } = parsedStyle;
    const hasFill = !isNil(fill) && !(fill as CSSRGB).isNone;
    const hasStroke =
      !isNil(stroke) && !(stroke as CSSRGB).isNone && lineWidth && lineWidth.value > 0;
    const isFillTransparent = (fill as CSSRGB).alpha === 0;
    let hasShadowApplied = false;
    const hasFilter = !isNil(filter);

    if (hasFill) {
      context.globalAlpha = opacity.value * fillOpacity.value;

      if (!hasStroke || shadowType?.value === 'outer') {
        hasShadowApplied = true;
        this.setShadowAndFilter(object, context);
      }

      this.fill(context, object, fill, renderingService);

      if (hasShadowApplied) {
        context.shadowColor = 'transparent';
        context.shadowBlur = 0;

        if (hasFilter) {
          // save drop-shadow filter
          const oldFilter = context.filter;
          if (!isNil(oldFilter) && oldFilter.indexOf('drop-shadow') > -1) {
            context.filter = oldFilter.replace(/drop-shadow\([^)]*\)/, '').trim() || 'none';
          }
        }
      }
    }

    if (hasStroke) {
      context.globalAlpha = opacity.value * strokeOpacity.value;
      context.lineWidth = lineWidth.value;
      if (!isNil(miterLimit)) {
        context.miterLimit = miterLimit.value;
      }

      if (!isNil(lineCap)) {
        context.lineCap = lineCap.value as CanvasLineCap;
      }

      if (!isNil(lineJoin)) {
        context.lineJoin = lineJoin.value as CanvasLineJoin;
      }

      if (!hasShadowApplied) {
        context.globalCompositeOperation = 'source-atop';
        this.setShadowAndFilter(object, context);
      }

      this.stroke(context, object, stroke, renderingService);

      if (!hasShadowApplied) {
        context.globalCompositeOperation = 'source-over';
      }
    }
  }

  /**
   * apply before fill and stroke but only once
   */
  private setShadowAndFilter(object: DisplayObject, context: CanvasRenderingContext2D) {
    const { filter, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY } =
      object.parsedStyle as ParsedBaseStyleProps;

    if (!isNil(filter)) {
      // use raw filter string
      context.filter = object.style.filter;
    }

    const hasShadow = !isNil(shadowColor) && shadowBlur?.value > 0;
    if (hasShadow) {
      context.shadowColor = shadowColor.toString();
      context.shadowBlur = (shadowBlur && shadowBlur.value) || 0;
      context.shadowOffsetX = (shadowOffsetX && shadowOffsetX.value) || 0;
      context.shadowOffsetY = (shadowOffsetY && shadowOffsetY.value) || 0;
    }
  }

  private fill(
    context: CanvasRenderingContext2D,
    object: DisplayObject,
    fill: CSSRGB | CSSGradientValue[] | Pattern,
    renderingService: RenderingService,
  ) {
    if (Array.isArray(fill)) {
      fill.forEach((gradient) => {
        context.fillStyle = this.getColor(gradient, object, context);
        context.fill();
      });
    } else {
      if (isPattern(fill)) {
        context.fillStyle = this.getPattern(fill, object, context, renderingService);
      }
      context.fill();
    }
  }

  private stroke(
    context: CanvasRenderingContext2D,
    object: DisplayObject,
    stroke: CSSRGB | CSSGradientValue[] | Pattern,
    renderingService: RenderingService,
  ) {
    if (Array.isArray(stroke)) {
      stroke.forEach((gradient) => {
        context.strokeStyle = this.getColor(gradient, object, context);
        context.stroke();
      });
    } else {
      if (isPattern(stroke)) {
        context.strokeStyle = this.getPattern(stroke, object, context, renderingService);
      }
      context.stroke();
    }
  }

  private getPattern(
    pattern: Pattern,
    object: DisplayObject,
    context: CanvasRenderingContext2D,
    renderingService: RenderingService,
  ): CanvasPattern {
    const canvasPattern = this.imagePool.getOrCreatePatternSync(pattern, context, () => {
      // set dirty rectangle flag
      object.renderable.dirty = true;
      renderingService.dirtify();
    });

    return canvasPattern;
  }

  private getColor(
    parsedColor: CSSGradientValue,
    object: DisplayObject,
    context: CanvasRenderingContext2D,
  ) {
    let color: CanvasGradient | string;

    if (
      parsedColor.type === GradientType.LinearGradient ||
      parsedColor.type === GradientType.RadialGradient
    ) {
      const bounds = object.getGeometryBounds();
      const width = (bounds && bounds.halfExtents[0] * 2) || 1;
      const height = (bounds && bounds.halfExtents[1] * 2) || 1;
      color = this.imagePool.getOrCreateGradient(
        {
          type: parsedColor.type,
          ...(parsedColor.value as LinearGradient | RadialGradient),
          width,
          height,
        },
        context,
      );
    }

    return color;
  }
}
