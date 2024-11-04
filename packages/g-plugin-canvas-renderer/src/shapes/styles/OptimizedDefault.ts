import {
  CanvasContext,
  CSSRGB,
  DisplayObject,
  GlobalRuntime,
  ParsedBaseStyleProps,
  isPattern,
  Shape,
} from '@antv/g-lite';
import type { ImagePool } from '@antv/g-plugin-image-loader';
import { isNil } from '@antv/util';
import {
  CanvasRendererPlugin,
  type RenderState,
} from '../../CanvasRendererPlugin';
import type { StyleRenderer } from './interfaces';
import { getColor, getPattern } from './helper';

const SHADOW_NUMBER_STYLE = [
  'shadowBlur',
  'shadowOffsetX',
  'shadowOffsetY',
] as const;
const STROKE_STYLE = ['lineCap', 'lineJoin', 'miterLimit'] as const;
export const DEFAULT_STYLE = {
  // common
  globalAlpha: 1,
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowColor: '#000',
  filter: 'none' as const,
  globalCompositeOperation: 'source-over' as const,

  // stroke/fill
  strokeStyle: '#000',
  strokeOpacity: 1,
  lineWidth: 1,
  lineDash: [],
  lineDashOffset: 0,
  lineCap: 'butt' as const,
  lineJoin: 'miter' as const,
  miterLimit: 10,
  fillStyle: '#000',
  fillOpacity: 1,

  // image
};

const defaultParsedStyle = {} as ParsedBaseStyleProps;

/**
 * Updating the canvas context is an expensive operation. The state of the context is cached and the actual update operation is performed only when the cache is not hit.
 *
 * In any case, the previous value is returned, which is convenient for temporarily updating the context and restoring it later.
 */
function updateContextIfNotHitCache<
  K extends keyof CanvasRenderingContext2D | 'lineDash',
  V = unknown,
>(context: CanvasRenderingContext2D, key: K, value: V, cache: Map<K, unknown>) {
  const prevValue = (
    cache.has(key)
      ? cache.get(key)
      : DEFAULT_STYLE[key as keyof typeof DEFAULT_STYLE]
  ) as V;

  if (prevValue !== value) {
    // console.log('not hit cache', key, value, prevValue, cache);
    if (key === 'lineDash') {
      context.setLineDash(value as number[]);
    } else {
      // @ts-ignore
      context[key] = value;
    }
    cache.set(key, value);
  }

  return prevValue;
}

export class OptimizedDefaultRenderer implements StyleRenderer {
  constructor(public imagePool: ImagePool) {}

  applyAttributesToContext(
    context: CanvasRenderingContext2D,
    object: DisplayObject,
  ) {}

  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedBaseStyleProps,
    object: DisplayObject,
    canvasContext: CanvasContext,
    plugin: CanvasRendererPlugin,
    runtime: GlobalRuntime,
  ) {}

  // #region common style
  private applyCommonStyleToContext(
    context: CanvasRenderingContext2D,
    object: DisplayObject,
    forceUpdate: boolean,
    renderState: RenderState,
  ) {
    // const dpr = object.ownerDocument.defaultView.getContextService().getDPR();
    const prevStyle = forceUpdate
      ? defaultParsedStyle
      : renderState.prevObject.parsedStyle;
    const style = object.parsedStyle;

    if (forceUpdate || style.opacity !== prevStyle.opacity) {
      updateContextIfNotHitCache(
        context,
        'globalAlpha',
        !isNil(style.opacity) ? style.opacity : DEFAULT_STYLE.globalAlpha,
        renderState.currentContext,
      );
    }

    // TODO blend prop
    // @ts-ignore
    if (forceUpdate || style.blend !== prevStyle.blend) {
      updateContextIfNotHitCache(
        context,
        'globalCompositeOperation',
        // @ts-ignore
        !isNil(style.blend)
          ? // @ts-ignore
            style.blend
          : DEFAULT_STYLE.globalCompositeOperation,
        renderState.currentContext,
      );
    }
  }
  // #endregion common style

  // #region stroke/fill style
  private applyStrokeFillStyleToContext(
    context: CanvasRenderingContext2D,
    object: DisplayObject,
    forceUpdate: boolean,
    renderState: RenderState,
  ) {
    const prevStyle = forceUpdate
      ? defaultParsedStyle
      : renderState.prevObject.parsedStyle;
    const style = object.parsedStyle;
    const { lineWidth = DEFAULT_STYLE.lineWidth } = style;
    const hasFill = style.fill && !(style.fill as CSSRGB).isNone;
    const hasStroke =
      style.stroke && !(style.stroke as CSSRGB).isNone && lineWidth > 0;

    if (hasStroke) {
      if (
        forceUpdate ||
        object.attributes.stroke !== renderState.prevObject.attributes.stroke
      ) {
        const value =
          !isNil(style.stroke) &&
          !Array.isArray(style.stroke) &&
          !(style.stroke as CSSRGB).isNone
            ? object.attributes.stroke
            : DEFAULT_STYLE.strokeStyle;

        updateContextIfNotHitCache(
          context,
          'strokeStyle',
          value,
          renderState.currentContext,
        );
      }

      if (forceUpdate || style.lineWidth !== prevStyle.lineWidth) {
        updateContextIfNotHitCache(
          context,
          'lineWidth',
          !isNil(style.lineWidth) ? style.lineWidth : DEFAULT_STYLE.lineWidth,
          renderState.currentContext,
        );
      }

      if (forceUpdate || style.lineDash !== prevStyle.lineDash) {
        updateContextIfNotHitCache(
          context,
          'lineDash',
          style.lineDash || DEFAULT_STYLE.lineDash,
          renderState.currentContext,
        );
      }

      if (forceUpdate || style.lineDashOffset !== prevStyle.lineDashOffset) {
        updateContextIfNotHitCache(
          context,
          'lineDashOffset',
          !isNil(style.lineDashOffset)
            ? style.lineDashOffset
            : DEFAULT_STYLE.lineDashOffset,
          renderState.currentContext,
        );
      }

      for (let i = 0; i < STROKE_STYLE.length; i++) {
        const styleName = STROKE_STYLE[i];
        if (forceUpdate || style[styleName] !== prevStyle[styleName]) {
          updateContextIfNotHitCache(
            context,
            styleName,
            !isNil(style[styleName])
              ? style[styleName]
              : DEFAULT_STYLE[styleName],
            renderState.currentContext,
          );
        }
      }
    }

    if (
      hasFill &&
      (forceUpdate ||
        object.attributes.fill !== renderState.prevObject.attributes.fill)
    ) {
      const value =
        !isNil(style.fill) &&
        !Array.isArray(style.fill) &&
        !(style.fill as CSSRGB).isNone
          ? object.attributes.fill
          : DEFAULT_STYLE.fillStyle;

      updateContextIfNotHitCache(
        context,
        'fillStyle',
        value,
        renderState.currentContext,
      );
    }
  }
  // #endregion stroke/fill style

  applyStyleToContext(
    context: CanvasRenderingContext2D,
    object: DisplayObject,
    forceUpdate: boolean,
    renderState: RenderState,
  ) {
    const nodeName = object.nodeName as Shape;

    this.applyCommonStyleToContext(context, object, forceUpdate, renderState);

    if (nodeName === Shape.IMAGE) {
      //
    } else {
      this.applyStrokeFillStyleToContext(
        context,
        object,
        forceUpdate,
        renderState,
      );
    }
  }

  applyShadowAndFilterStyleToContext(
    context: CanvasRenderingContext2D,
    object: DisplayObject,
    hasShadow: boolean,
    renderState: RenderState,
  ) {
    const style = object.parsedStyle;

    if (hasShadow) {
      updateContextIfNotHitCache(
        context,
        'shadowColor',
        style.shadowColor.toString(),
        renderState.currentContext,
      );
      for (let i = 0; i < SHADOW_NUMBER_STYLE.length; i++) {
        const styleName = SHADOW_NUMBER_STYLE[i];
        updateContextIfNotHitCache(
          context,
          styleName,
          style[styleName] || DEFAULT_STYLE[styleName],
          renderState.currentContext,
        );
      }
    }

    if (style.filter && style.filter.length) {
      updateContextIfNotHitCache(
        context,
        'filter',
        // use raw filter string
        object.attributes.filter,
        renderState.currentContext,
      );
    }
  }

  clearShadowAndFilterStyleForContext(
    context: CanvasRenderingContext2D,
    hasShadow: boolean,
    hasFilter: boolean,
    renderState: RenderState,
    onlyClearShadowFilter = false,
  ) {
    if (hasShadow) {
      updateContextIfNotHitCache(
        context,
        'shadowColor',
        DEFAULT_STYLE.shadowColor,
        renderState.currentContext,
      );
      for (let i = 0; i < SHADOW_NUMBER_STYLE.length; i++) {
        const styleName = SHADOW_NUMBER_STYLE[i];
        updateContextIfNotHitCache(
          context,
          styleName,
          DEFAULT_STYLE[styleName],
          renderState.currentContext,
        );
      }
    }

    if (hasFilter) {
      if (hasShadow && onlyClearShadowFilter) {
        // save drop-shadow filter
        const oldFilter = context.filter;
        if (!isNil(oldFilter) && oldFilter.indexOf('drop-shadow') > -1) {
          updateContextIfNotHitCache(
            context,
            'filter',
            oldFilter.replace(/drop-shadow\([^)]*\)/, '').trim() ||
              DEFAULT_STYLE.filter,
            renderState.currentContext,
          );
        }
      } else {
        updateContextIfNotHitCache(
          context,
          'filter',
          DEFAULT_STYLE.filter,
          renderState.currentContext,
        );
      }
    }
  }

  fillToContext(
    context: CanvasRenderingContext2D,
    object: DisplayObject,
    renderState: RenderState,
    plugin: CanvasRendererPlugin,
    runtime: GlobalRuntime,
  ) {
    const { fill, fillRule } = object.parsedStyle;
    let resetStyle = null as unknown;

    if (Array.isArray(fill) && fill.length > 0) {
      fill.forEach((gradient) => {
        const prevStyle = updateContextIfNotHitCache(
          context,
          'fillStyle',
          getColor(gradient, object, context, this.imagePool),
          renderState.currentContext,
        );
        resetStyle = resetStyle ?? prevStyle;

        if (fillRule) {
          context.fill(fillRule);
        } else {
          context.fill();
        }
      });
    } else {
      if (isPattern(fill)) {
        const pattern = getPattern(
          fill,
          object,
          context,
          object.ownerDocument.defaultView.context,
          plugin,
          runtime,
          this.imagePool,
        );
        if (pattern) {
          context.fillStyle = pattern;
          resetStyle = true;
        }
      }

      if (fillRule) {
        context.fill(fillRule);
      } else {
        context.fill();
      }
    }

    if (resetStyle !== null) {
      updateContextIfNotHitCache(
        context,
        'fillStyle',
        resetStyle,
        renderState.currentContext,
      );
    }
  }

  strokeToContext(
    context: CanvasRenderingContext2D,
    object: DisplayObject,
    renderState: RenderState,
    plugin: CanvasRendererPlugin,
    runtime: GlobalRuntime,
  ) {
    const { stroke } = object.parsedStyle;
    let resetStyle = null as unknown;

    if (Array.isArray(stroke) && stroke.length > 0) {
      stroke.forEach((gradient) => {
        const prevStyle = updateContextIfNotHitCache(
          context,
          'strokeStyle',
          getColor(gradient, object, context, this.imagePool),
          renderState.currentContext,
        );
        resetStyle = resetStyle ?? prevStyle;

        context.stroke();
      });
    } else {
      if (isPattern(stroke)) {
        const pattern = getPattern(
          stroke,
          object,
          context,
          object.ownerDocument.defaultView.context,
          plugin,
          runtime,
          this.imagePool,
        );
        if (pattern) {
          const prevStyle = updateContextIfNotHitCache(
            context,
            'strokeStyle',
            pattern,
            renderState.currentContext,
          );
          resetStyle = resetStyle ?? prevStyle;
        }
      }

      context.stroke();
    }

    if (resetStyle !== null) {
      updateContextIfNotHitCache(
        context,
        'strokeStyle',
        resetStyle,
        renderState.currentContext,
      );
    }
  }

  drawToContext(
    context: CanvasRenderingContext2D,
    object: DisplayObject,
    renderState: RenderState,
    plugin: CanvasRendererPlugin,
    runtime: GlobalRuntime,
  ) {
    const nodeName = object.nodeName as Shape;
    const style = object.parsedStyle;
    const {
      opacity = DEFAULT_STYLE.globalAlpha,
      fillOpacity = DEFAULT_STYLE.fillOpacity,
      strokeOpacity = DEFAULT_STYLE.strokeOpacity,
      lineWidth = DEFAULT_STYLE.lineWidth,
    } = style;

    const hasFill = style.fill && !(style.fill as CSSRGB).isNone;
    const hasStroke =
      style.stroke && !(style.stroke as CSSRGB).isNone && lineWidth > 0;

    if (!hasFill && !hasStroke) {
      return;
    }

    const hasShadow = !isNil(style.shadowColor) && style.shadowBlur > 0;
    const isInnerShadow = style.shadowType === 'inner';
    const isFillTransparent = (style.fill as CSSRGB)?.alpha === 0;
    const hasFilter = !!(style.filter && style.filter.length);
    // Shadows can only be applied to fill() or stroke(), the default is fill()
    const shouldDrawShadowWithStroke =
      hasShadow &&
      hasStroke &&
      (nodeName === Shape.PATH ||
        nodeName === Shape.LINE ||
        nodeName === Shape.POLYLINE ||
        isFillTransparent ||
        isInnerShadow);

    // TODO https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/paint-order

    let originGlobalAlpha: number | null = null;

    if (hasFill) {
      if (!shouldDrawShadowWithStroke) {
        this.applyShadowAndFilterStyleToContext(
          context,
          object,
          hasShadow,
          renderState,
        );
      }

      const updateOpacity = opacity * fillOpacity;

      originGlobalAlpha = updateContextIfNotHitCache(
        context,
        'globalAlpha',
        updateOpacity,
        renderState.currentContext,
      );

      this.fillToContext(context, object, renderState, plugin, runtime);

      if (!shouldDrawShadowWithStroke) {
        this.clearShadowAndFilterStyleForContext(
          context,
          hasShadow,
          hasFilter,
          renderState,
        );
      }
    }
    if (hasStroke) {
      let clearShadowAndFilter = false;
      const updateOpacity = opacity * strokeOpacity;
      const prevOpacity = updateContextIfNotHitCache(
        context,
        'globalAlpha',
        updateOpacity,
        renderState.currentContext,
      );
      originGlobalAlpha = hasFill ? originGlobalAlpha : prevOpacity;

      if (shouldDrawShadowWithStroke) {
        this.applyShadowAndFilterStyleToContext(
          context,
          object,
          hasShadow,
          renderState,
        );
        clearShadowAndFilter = true;

        if (isInnerShadow) {
          const originBlend = context.globalCompositeOperation;
          context.globalCompositeOperation = 'source-atop';

          this.strokeToContext(context, object, renderState, plugin, runtime);

          context.globalCompositeOperation = originBlend;
          this.clearShadowAndFilterStyleForContext(
            context,
            hasShadow,
            hasFilter,
            renderState,
            true,
          );
        }
      }

      this.strokeToContext(context, object, renderState, plugin, runtime);

      if (clearShadowAndFilter) {
        this.clearShadowAndFilterStyleForContext(
          context,
          hasShadow,
          hasFilter,
          renderState,
        );
      }
    }

    // clear
    if (originGlobalAlpha !== null) {
      updateContextIfNotHitCache(
        context,
        'globalAlpha',
        originGlobalAlpha,
        renderState.currentContext,
      );
    }
  }
}
