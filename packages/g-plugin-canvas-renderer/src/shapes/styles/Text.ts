import {
  type CSSRGB,
  type CanvasContext,
  type DisplayObject,
  type GlobalRuntime,
  type ParsedTextStyleProps,
  type Rectangle,
  CSSGradientValue,
  Pattern,
} from '@antv/g-lite';
import { isNil } from '@antv/util';
import {
  DefaultRenderer,
  applyFill,
  applyStroke,
  setShadowAndFilter,
} from './Default';
import {
  CanvasRendererPlugin,
  type RenderState,
} from '../../CanvasRendererPlugin';

export class TextRenderer extends DefaultRenderer {
  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedTextStyleProps,
    object: DisplayObject,
    canvasContext: CanvasContext,
    plugin: CanvasRendererPlugin,
    runtime: GlobalRuntime,
  ) {
    // Trigger text geometry calculation.
    object.getBounds();
    const {
      lineWidth = 1,
      textAlign = 'start',
      textBaseline = 'alphabetic',
      lineJoin = 'miter',
      miterLimit = 10,
      letterSpacing = 0,
      stroke,
      fill,
      fillRule,
      fillOpacity = 1,
      strokeOpacity = 1,
      opacity = 1,
      metrics,
      x = 0,
      y = 0,
      dx,
      dy,
      shadowColor,
      shadowBlur,
    } = parsedStyle;

    const { font, lines, height, lineHeight, lineMetrics } = metrics;

    context.font = font;
    context.lineWidth = lineWidth;
    context.textAlign = textAlign === 'middle' ? 'center' : textAlign;

    let formattedTextBaseline = textBaseline;
    if (formattedTextBaseline === 'alphabetic') {
      formattedTextBaseline = 'bottom';
    }

    context.lineJoin = lineJoin;
    if (!isNil(miterLimit)) {
      context.miterLimit = miterLimit;
    }

    let linePositionY = y;
    // handle vertical text baseline
    if (textBaseline === 'middle') {
      linePositionY += -height / 2 - lineHeight / 2;
    } else if (
      textBaseline === 'bottom' ||
      textBaseline === 'alphabetic' ||
      textBaseline === 'ideographic'
    ) {
      linePositionY += -height;
    } else if (textBaseline === 'top' || textBaseline === 'hanging') {
      linePositionY += -lineHeight;
    }

    // account for dx & dy
    const offsetX = x + (dx || 0);
    linePositionY += dy || 0;

    if (lines.length === 1) {
      if (formattedTextBaseline === 'bottom') {
        formattedTextBaseline = 'middle';
        linePositionY -= 0.5 * height;
      } else if (formattedTextBaseline === 'top') {
        formattedTextBaseline = 'middle';
        linePositionY += 0.5 * height;
      }
    }
    context.textBaseline = formattedTextBaseline;

    const hasShadow = !isNil(shadowColor) && shadowBlur > 0;
    setShadowAndFilter(object, context, hasShadow);

    // draw lines line by line
    for (let i = 0; i < lines.length; i++) {
      const linePositionX = lineWidth / 2 + offsetX;
      linePositionY += lineHeight;

      // no need to re-position X, cause we already set text align
      // @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textAlign
      if (!isNil(stroke) && !(stroke as CSSRGB).isNone && lineWidth) {
        this.drawLetterSpacing(
          context,
          object,
          lines[i],
          lineMetrics[i],
          textAlign,
          linePositionX,
          linePositionY,
          letterSpacing,
          fill,
          fillRule,
          fillOpacity,
          stroke,
          strokeOpacity,
          opacity,
          true,
          canvasContext,
          plugin,
          runtime,
        );
      }
      if (!isNil(fill)) {
        this.drawLetterSpacing(
          context,
          object,
          lines[i],
          lineMetrics[i],
          textAlign,
          linePositionX,
          linePositionY,
          letterSpacing,
          fill,
          fillRule,
          fillOpacity,
          stroke,
          strokeOpacity,
          opacity,
          false,
          canvasContext,
          plugin,
          runtime,
        );
      }
    }
  }

  private drawLetterSpacing(
    context: CanvasRenderingContext2D,
    object: DisplayObject,
    text: string,
    lineMetrics: Rectangle,
    textAlign: CanvasTextAlign | 'middle',
    x: number,
    y: number,
    letterSpacing: number,
    fill: CSSRGB | CSSGradientValue[] | Pattern,
    fillRule: 'nonzero' | 'evenodd',
    fillOpacity: number | undefined,
    stroke: CSSRGB | CSSGradientValue[] | Pattern,
    strokeOpacity: number | undefined,
    opacity: number | undefined,
    isStroke: boolean,
    canvasContext: CanvasContext,
    plugin: CanvasRendererPlugin,
    runtime: GlobalRuntime,
  ): void {
    // letterSpacing of 0 means normal, render all texts directly
    if (letterSpacing === 0) {
      if (isStroke) {
        this.strokeText(
          context,
          object,
          text,
          x,
          y,
          stroke,
          strokeOpacity,
          canvasContext,
          plugin,
          runtime,
        );
      } else {
        this.fillText(
          context,
          object,
          text,
          x,
          y,
          fill,
          fillRule,
          fillOpacity,
          opacity,
          canvasContext,
          plugin,
          runtime,
        );
      }
      return;
    }

    // draw text using left align
    const currentTextAlign = context.textAlign;
    context.textAlign = 'left';

    let currentPosition = x;
    if (textAlign === 'center' || textAlign === 'middle') {
      currentPosition = x - lineMetrics.width / 2;
    } else if (textAlign === 'right' || textAlign === 'end') {
      currentPosition = x - lineMetrics.width;
    }

    const stringArray = Array.from(text);
    let previousWidth = context.measureText(text).width;
    let currentWidth = 0;
    for (let i = 0; i < stringArray.length; ++i) {
      const currentChar = stringArray[i];
      if (isStroke) {
        this.strokeText(
          context,
          object,
          currentChar,
          currentPosition,
          y,
          stroke,
          strokeOpacity,
          canvasContext,
          plugin,
          runtime,
        );
      } else {
        this.fillText(
          context,
          object,
          currentChar,
          currentPosition,
          y,
          fill,
          fillRule,
          fillOpacity,
          opacity,
          canvasContext,
          plugin,
          runtime,
        );
      }
      currentWidth = context.measureText(text.substring(i + 1)).width;
      currentPosition += previousWidth - currentWidth + letterSpacing;
      previousWidth = currentWidth;
    }

    context.textAlign = currentTextAlign;
  }

  private fillText(
    context: CanvasRenderingContext2D,
    object: DisplayObject,
    text: string,
    x: number,
    y: number,
    fill: CSSRGB | CSSGradientValue[] | Pattern,
    fillRule: 'nonzero' | 'evenodd',
    fillOpacity: number | undefined,
    opacity: number | undefined,
    canvasContext: CanvasContext,
    plugin: CanvasRendererPlugin,
    runtime: GlobalRuntime,
  ) {
    applyFill(
      context,
      object,
      fill,
      fillRule,
      canvasContext,
      plugin,
      runtime,
      this.imagePool,
      true,
    );

    let currentGlobalAlpha: number;
    const applyOpacity = !isNil(fillOpacity) && fillOpacity !== 1;
    if (applyOpacity) {
      currentGlobalAlpha = context.globalAlpha;
      context.globalAlpha = fillOpacity * opacity;
    }
    context.fillText(text, x, y);
    if (applyOpacity) {
      context.globalAlpha = currentGlobalAlpha;
    }
  }

  private strokeText(
    context: CanvasRenderingContext2D,
    object: DisplayObject,
    text: string,
    x: number,
    y: number,
    stroke: CSSRGB | CSSGradientValue[] | Pattern,
    strokeOpacity: number | undefined,
    canvasContext: CanvasContext,
    plugin: CanvasRendererPlugin,
    runtime: GlobalRuntime,
  ) {
    applyStroke(
      context,
      object,
      stroke,
      canvasContext,
      plugin,
      runtime,
      this.imagePool,
      true,
    );

    let currentGlobalAlpha: number;
    const applyOpacity = !isNil(strokeOpacity) && strokeOpacity !== 1;
    if (applyOpacity) {
      currentGlobalAlpha = context.globalAlpha;
      context.globalAlpha = strokeOpacity!;
    }
    context.strokeText(text, x, y);
    if (applyOpacity) {
      context.globalAlpha = currentGlobalAlpha;
    }
  }

  // ---

  drawToContext(
    context: CanvasRenderingContext2D,
    object: DisplayObject,
    renderState: RenderState,
    plugin: CanvasRendererPlugin,
    runtime: GlobalRuntime,
  ) {
    this.render(
      context,
      object.parsedStyle as ParsedTextStyleProps,
      object,
      object.ownerDocument.defaultView.context,
      plugin,
      runtime,
    );
  }
}
