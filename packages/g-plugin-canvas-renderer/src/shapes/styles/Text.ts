import type {
  CSSRGB,
  CanvasContext,
  DisplayObject,
  GlobalRuntime,
  ParsedTextStyleProps,
  Rectangle,
} from '@antv/g-lite';
import { isNil } from '@antv/util';
import { setShadowAndFilter } from './Default';
import type { StyleRenderer } from './interfaces';
import { CanvasRendererPlugin } from '../../CanvasRendererPlugin';

export class TextRenderer implements StyleRenderer {
  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedTextStyleProps,
    object: DisplayObject,
    canvasContext: CanvasContext,
    plugin: CanvasRendererPlugin,
    runtime: GlobalRuntime,
  ) {
    const {
      lineWidth,
      textAlign,
      textBaseline,
      lineJoin,
      miterLimit,
      letterSpacing,
      stroke,
      fill,
      fillOpacity,
      strokeOpacity,
      opacity,
      metrics,
      x = 0,
      y = 0,
      dx,
      dy,
      shadowColor,
      shadowBlur,
    } = parsedStyle as ParsedTextStyleProps;

    const { font, lines, height, lineHeight, lineMetrics } = metrics;

    context.font = font;
    context.lineWidth = lineWidth;
    context.textAlign = textAlign === 'middle' ? 'center' : textAlign;

    let formattedTextBaseline = textBaseline;
    if (
      // formattedTextBaseline === 'bottom' ||
      !runtime.enableCSSParsing &&
      formattedTextBaseline === 'alphabetic'
    ) {
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
          lines[i],
          lineMetrics[i],
          textAlign,
          linePositionX,
          linePositionY,
          letterSpacing,
          fillOpacity,
          strokeOpacity,
          opacity,
          true,
        );
      }
      if (!isNil(fill)) {
        this.drawLetterSpacing(
          context,
          lines[i],
          lineMetrics[i],
          textAlign,
          linePositionX,
          linePositionY,
          letterSpacing,
          fillOpacity,
          strokeOpacity,
          opacity,
        );
      }
    }
  }

  private drawLetterSpacing(
    context: CanvasRenderingContext2D,
    text: string,
    lineMetrics: Rectangle,
    textAlign: CanvasTextAlign | 'middle',
    x: number,
    y: number,
    letterSpacing: number,
    fillOpacity: number | undefined,
    strokeOpacity: number | undefined,
    opacity: number | undefined,
    isStroke = false,
  ): void {
    // letterSpacing of 0 means normal, render all texts directly
    if (letterSpacing === 0) {
      if (isStroke) {
        this.strokeText(context, text, x, y, strokeOpacity);
      } else {
        this.fillText(context, text, x, y, fillOpacity, opacity);
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
          currentChar,
          currentPosition,
          y,
          strokeOpacity,
        );
      } else {
        this.fillText(
          context,
          currentChar,
          currentPosition,
          y,
          fillOpacity,
          opacity,
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
    text: string,
    x: number,
    y: number,
    fillOpacity: number | undefined,
    opacity: number | undefined,
  ) {
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
    text: string,
    x: number,
    y: number,
    strokeOpacity: number | undefined,
  ) {
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
}
