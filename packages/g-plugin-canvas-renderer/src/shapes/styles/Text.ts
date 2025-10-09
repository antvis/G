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
      textDecorationLine,
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

    // Draw text decoration lines
    if (textDecorationLine && textDecorationLine !== 'none') {
      this.drawTextDecorations(
        context,
        parsedStyle,
        object,
        lines,
        lineHeight,
        offsetX,
        y + (dy || 0),
        canvasContext,
        plugin,
        runtime,
      );
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

  /**
   * Draw text decoration lines (underline, overline, line-through)
   */
  private drawTextDecorations(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedTextStyleProps,
    object: DisplayObject,
    lines: string[],
    lineHeight: number,
    offsetX: number,
    baseY: number,
    canvasContext: CanvasContext,
    plugin: CanvasRendererPlugin,
    runtime: GlobalRuntime,
  ) {
    const {
      textDecorationLine,
      textDecorationColor,
      textDecorationStyle,
      textDecorationThickness = 1,
      textAlign = 'start',
      lineWidth = 1,
      metrics,
    } = parsedStyle;

    if (!textDecorationLine || textDecorationLine === 'none') {
      return;
    }

    const { lineMetrics } = metrics;
    const decorations = textDecorationLine.split(' ');

    // Set decoration style
    context.lineWidth = textDecorationThickness;

    if (textDecorationColor) {
      context.strokeStyle = `rgba(${textDecorationColor.r}, ${textDecorationColor.g}, ${textDecorationColor.b}, ${textDecorationColor.alpha})`;
    }

    // Set line style based on textDecorationStyle
    switch (textDecorationStyle) {
      case 'dashed':
        context.setLineDash([5, 5]);
        break;
      case 'dotted':
        context.setLineDash([2, 2]);
        break;
      case 'wavy':
        // For wavy, we'll use a simple approximation with bezier curves
        // A full implementation would be more complex
        context.setLineDash([]);
        break;
      default:
        context.setLineDash([]);
        break;
    }

    let linePositionY = baseY;

    // Adjust for text baseline
    const { textBaseline = 'alphabetic' } = parsedStyle;
    if (textBaseline === 'middle') {
      linePositionY += -metrics.height / 2 - lineHeight / 2;
    } else if (
      textBaseline === 'bottom' ||
      textBaseline === 'alphabetic' ||
      textBaseline === 'ideographic'
    ) {
      linePositionY += -metrics.height;
    } else if (textBaseline === 'top' || textBaseline === 'hanging') {
      linePositionY += -lineHeight;
    }

    // Draw each decoration for each line
    for (let i = 0; i < lines.length; i++) {
      linePositionY += lineHeight;

      const lineMetric = lineMetrics[i];
      if (!lineMetric) continue;

      const lineWidthOffset = lineWidth / 2;
      let startX = offsetX;
      let endX = offsetX + lineMetric.width;

      // Adjust for text alignment
      if (textAlign === 'center' || textAlign === 'middle') {
        startX = offsetX - lineMetric.width / 2;
        endX = offsetX + lineMetric.width / 2;
      } else if (textAlign === 'right' || textAlign === 'end') {
        startX = offsetX - lineMetric.width;
        endX = offsetX;
      }

      // Add lineWidth offset
      startX += lineWidthOffset;
      endX += lineWidthOffset;

      // Draw each type of decoration
      for (const decoration of decorations) {
        let decorationY = linePositionY;

        switch (decoration) {
          case 'underline':
            decorationY += 2; // Small offset below baseline
            break;
          case 'overline':
            decorationY -= lineHeight - 2; // Small offset above line
            break;
          case 'line-through':
            decorationY -= lineHeight / 2; // Middle of line
            break;
          default:
            continue; // Unknown decoration type
        }

        if (textDecorationStyle === 'wavy') {
          this.drawWavyLine(context, startX, endX, decorationY);
        } else {
          context.beginPath();
          context.moveTo(startX, decorationY);
          context.lineTo(endX, decorationY);
          context.stroke();
        }
      }
    }

    // Reset line dash
    context.setLineDash([]);
  }

  /**
   * Draw a wavy line as an approximation of the wavy text decoration style
   */
  private drawWavyLine(
    context: CanvasRenderingContext2D,
    startX: number,
    endX: number,
    y: number,
  ) {
    const amplitude = 1; // Height of the wave
    const frequency = 0.1; // Frequency of the wave

    context.beginPath();
    context.moveTo(startX, y);

    for (let x = startX; x <= endX; x += 1) {
      const waveY = y + amplitude * Math.sin(frequency * (x - startX));
      context.lineTo(x, waveY);
    }

    context.stroke();
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
