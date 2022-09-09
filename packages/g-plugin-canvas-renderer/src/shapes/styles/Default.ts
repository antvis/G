import type {
  CSSGradientValue,
  CSSRGB,
  DisplayObject,
  LinearGradient,
  ParsedBaseStyleProps,
  Pattern,
  RadialGradient,
  RenderingService,
} from '@antv/g-lite';
import { GradientType, inject, isPattern, Shape, singleton } from '@antv/g-lite';
import { ImagePool } from '@antv/g-plugin-image-loader';
import { isNil } from '@antv/util';
import type { StyleRenderer } from './interfaces';

@singleton()
export class DefaultRenderer implements StyleRenderer {
  constructor(
    @inject(ImagePool)
    private imagePool: ImagePool,
  ) {}

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
    const hasStroke = !isNil(stroke) && !(stroke as CSSRGB).isNone && lineWidth > 0;
    const isFillTransparent = (fill as CSSRGB).alpha === 0;
    const hasFilter = !!(filter && filter.length);
    const hasShadow = !isNil(shadowColor) && shadowBlur > 0;
    const nodeName = object.nodeName;
    const isInnerShadow = shadowType === 'inner';
    const shouldDrawShadowWithStroke =
      hasStroke &&
      hasShadow &&
      (nodeName === Shape.PATH ||
        nodeName === Shape.LINE ||
        nodeName === Shape.POLYLINE ||
        isFillTransparent ||
        isInnerShadow);

    if (hasFill) {
      context.globalAlpha = opacity * fillOpacity;

      if (!shouldDrawShadowWithStroke) {
        setShadowAndFilter(object, context, hasShadow);
      }

      this.fill(context, object, fill, renderingService);

      if (!shouldDrawShadowWithStroke) {
        this.clearShadowAndFilter(context, hasFilter, hasShadow);
      }
    }

    if (hasStroke) {
      context.globalAlpha = opacity * strokeOpacity;
      context.lineWidth = lineWidth;
      if (!isNil(miterLimit)) {
        context.miterLimit = miterLimit;
      }

      if (!isNil(lineCap)) {
        context.lineCap = lineCap;
      }

      if (!isNil(lineJoin)) {
        context.lineJoin = lineJoin;
      }

      if (shouldDrawShadowWithStroke) {
        if (isInnerShadow) {
          context.globalCompositeOperation = 'source-atop';
        }
        setShadowAndFilter(object, context, true);

        if (isInnerShadow) {
          this.stroke(context, object, stroke, renderingService);
          context.globalCompositeOperation = 'source-over';
          this.clearShadowAndFilter(context, hasFilter, true);
        }
      }

      this.stroke(context, object, stroke, renderingService);
    }
  }

  private clearShadowAndFilter(
    context: CanvasRenderingContext2D,
    hasFilter: boolean,
    hasShadow: boolean,
  ) {
    if (hasShadow) {
      context.shadowColor = 'transparent';
      context.shadowBlur = 0;
    }

    if (hasFilter) {
      // save drop-shadow filter
      const oldFilter = context.filter;
      if (!isNil(oldFilter) && oldFilter.indexOf('drop-shadow') > -1) {
        context.filter = oldFilter.replace(/drop-shadow\([^)]*\)/, '').trim() || 'none';
      }
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

/**
 * apply before fill and stroke but only once
 */
export function setShadowAndFilter(
  object: DisplayObject,
  context: CanvasRenderingContext2D,
  hasShadow: boolean,
) {
  const { filter, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY } =
    object.parsedStyle as ParsedBaseStyleProps;

  if (filter && filter.length) {
    // use raw filter string
    context.filter = object.style.filter;
  }

  if (hasShadow) {
    context.shadowColor = shadowColor.toString();
    context.shadowBlur = shadowBlur || 0;
    context.shadowOffsetX = shadowOffsetX || 0;
    context.shadowOffsetY = shadowOffsetY || 0;
  }
}
