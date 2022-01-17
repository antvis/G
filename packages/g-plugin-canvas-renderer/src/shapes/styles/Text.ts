import { TextService, ParsedTextStyleProps, SHAPE, Rectangle } from '@antv/g';
import { inject, singleton } from 'mana-syringe';
import { isNil } from '@antv/util';
import { StyleRenderer } from './interfaces';

@singleton({
  token: { token: StyleRenderer, named: SHAPE.Text },
})
export class TextRenderer implements StyleRenderer {
  @inject(TextService)
  private textService: TextService;

  hash(parsedStyle: any): string {
    return '';
  }

  render(context: CanvasRenderingContext2D, parsedStyle: ParsedTextStyleProps) {
    const {
      text = '',
      lineWidth = 0,
      textAlign,
      textBaseline,
      lineJoin,
      miterLimit = 0,
      padding = 0,
      letterSpacing = 0,
      stroke,
      fill,
      fillOpacity,
      strokeOpacity,
      opacity,
      metrics,
    } = parsedStyle;

    const { font, lines, height, lineHeight, lineMetrics } = metrics;

    context.font = font;
    context.lineWidth = lineWidth!;
    context.textAlign = textAlign;
    context.textBaseline = textBaseline!;
    context.lineJoin = lineJoin!;
    context.miterLimit = miterLimit;

    let linePositionY = 0;
    // handle vertical text baseline
    if (textBaseline === 'middle') {
      linePositionY = -height / 2 - lineHeight / 2;
    } else if (
      textBaseline === 'bottom' ||
      textBaseline === 'alphabetic' ||
      textBaseline === 'ideographic'
    ) {
      linePositionY = -height;
    } else if (textBaseline === 'top' || textBaseline === 'hanging') {
      linePositionY = -lineHeight;
    }

    // draw lines line by line
    for (let i = 0; i < lines.length; i++) {
      let linePositionX = lineWidth / 2;
      linePositionY += lineHeight;

      // no need to re-position X, cause we already set text align
      // @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textAlign
      if (!isNil(stroke) && lineWidth) {
        this.drawLetterSpacing(
          context,
          lines[i],
          lineMetrics[i],
          textAlign,
          linePositionX + padding,
          linePositionY + padding,
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
          linePositionX + padding,
          linePositionY + padding,
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
    textAlign: 'start' | 'center' | 'end' | 'left' | 'right',
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
    if (textAlign === 'center') {
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
        this.strokeText(context, currentChar, currentPosition, y, strokeOpacity);
      } else {
        this.fillText(context, currentChar, currentPosition, y, fillOpacity, opacity);
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
