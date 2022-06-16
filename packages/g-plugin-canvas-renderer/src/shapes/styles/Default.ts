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
      shadowColor,
      filter,
      miterLimit,
    } = parsedStyle;
    const hasFill = !isNil(fill) && !(fill as CSSRGB).isNone;
    const hasStroke = !isNil(stroke) && !(stroke as CSSRGB).isNone;
    const isFillTransparent = (fill as CSSRGB).alpha === 0;

    if (hasFill) {
      if (!isNil(fillOpacity) && fillOpacity.value !== 1) {
        context.globalAlpha = fillOpacity.value;
        this.fill(context, object, fill, renderingService);
        context.globalAlpha = opacity.value;
      } else {
        this.fill(context, object, fill, renderingService);
      }
    }

    if (hasStroke) {
      if (lineWidth && lineWidth.value > 0) {
        const applyOpacity = !isNil(strokeOpacity) && strokeOpacity.value !== 1;
        if (applyOpacity) {
          context.globalAlpha = strokeOpacity.value;
        }
        context.lineWidth = lineWidth.value;
        if (!isNil(miterLimit)) {
          context.miterLimit = miterLimit;
        }

        if (!isNil(lineCap)) {
          context.lineCap = lineCap.value as CanvasLineCap;
        }

        if (!isNil(lineJoin)) {
          context.lineJoin = lineJoin.value as CanvasLineJoin;
        }

        let oldShadowBlur: number;
        let oldShadowColor: string;
        let oldFilter: string;
        const hasShadowColor = !isNil(shadowColor);
        const hasFilter = !isNil(filter);

        if (hasShadowColor) {
          // prevent inner shadow when drawing stroke, toggle shadowBlur & filter(drop-shadow)
          // save shadow blur
          oldShadowBlur = context.shadowBlur;
          oldShadowColor = context.shadowColor;
          if (!isNil(oldShadowBlur)) {
            context.shadowColor = 'transparent';
            context.shadowBlur = 0;
          }
        }

        if (hasFilter) {
          // save drop-shadow filter
          oldFilter = context.filter;
          if (!isNil(oldFilter) && oldFilter.indexOf('drop-shadow') > -1) {
            context.filter = oldFilter.replace(/drop-shadow\([^)]*\)/, '').trim() || 'none';
          }
        }

        const drawStroke = hasFill && !isFillTransparent;
        if (drawStroke) {
          this.stroke(context, object, stroke, renderingService);
        }

        // restore shadow blur
        if (hasShadowColor) {
          context.shadowColor = oldShadowColor;
          context.shadowBlur = oldShadowBlur;
        }
        // restore filters
        if (hasFilter) {
          context.filter = oldFilter;
        }

        if (!drawStroke) {
          this.stroke(context, object, stroke, renderingService);
        }
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
