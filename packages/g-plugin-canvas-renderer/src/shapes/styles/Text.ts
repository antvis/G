import { TextService, ParsedTextStyleProps, SHAPE } from '@antv/g';
import { inject, singleton } from 'mana-syringe';
import { isNil } from '@antv/util';
import { StyleRenderer } from './interfaces';

@singleton({
  token: { token: StyleRenderer, named: SHAPE.Text },
})
export class TextRenderer implements StyleRenderer {
  @inject(TextService)
  private textService: TextService;

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

    const { font, lines, height, lineHeight } = metrics;

    context.font = font;
    context.lineWidth = lineWidth!;
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
    x: number,
    y: number,
    letterSpacing: number,
    fillOpacity: number | undefined,
    strokeOpacity: number | undefined,
    opacity: number | undefined,
    isStroke = false,
  ): void {
    // letterSpacing of 0 means normal
    if (letterSpacing === 0) {
      if (isStroke) {
        this.strokeText(context, text, x, y, strokeOpacity);
      } else {
        this.fillText(context, text, x, y, fillOpacity, opacity);
      }
      return;
    }
    let currentPosition = x;

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
  }

  private fillText(
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    fillOpacity: number | undefined,
    opacity: number | undefined,
  ) {
    const applyOpacity = !isNil(fillOpacity) && fillOpacity !== 1;
    if (applyOpacity) {
      context.globalAlpha = fillOpacity!;
    }
    context.fillText(text, x, y);
    if (applyOpacity) {
      context.globalAlpha = opacity!;
    }
  }

  private strokeText(
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    strokeOpacity: number | undefined,
  ) {
    const applyOpacity = !isNil(strokeOpacity) && strokeOpacity !== 1;
    if (applyOpacity) {
      context.globalAlpha = strokeOpacity!;
    }
    context.strokeText(text, x, y);
  }
}
