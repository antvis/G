import { isNil } from '@antv/util';
import type {
  DisplayObject,
  ParsedTextStyleProps,
} from '../../display-objects';
import { GlobalRuntime } from '../../global-runtime';
import type { GeometryAABBUpdater } from './interfaces';
export class TextUpdater implements GeometryAABBUpdater<ParsedTextStyleProps> {
  constructor(private globalRuntime: GlobalRuntime) {}

  private isReadyToMeasure(
    parsedStyle: ParsedTextStyleProps,
    object: DisplayObject,
  ) {
    const {
      text,
      textAlign,
      textBaseline,
      fontSize,
      fontStyle,
      fontWeight,
      fontVariant,
      lineWidth,
    } = parsedStyle;

    return (
      text &&
      fontSize &&
      fontStyle &&
      fontWeight &&
      fontVariant &&
      textAlign &&
      textBaseline &&
      !isNil(lineWidth)
    );
  }

  update(parsedStyle: ParsedTextStyleProps, object: DisplayObject) {
    const {
      text,
      textAlign,
      lineWidth,
      textBaseline,
      dx,
      dy,
      x = 0,
      y = 0,
    } = parsedStyle;
    if (!this.isReadyToMeasure(parsedStyle, object)) {
      parsedStyle.metrics = {
        font: '',
        width: 0,
        height: 0,
        lines: [],
        lineWidths: [],
        lineHeight: 0,
        maxLineWidth: 0,
        fontProperties: {
          ascent: 0,
          descent: 0,
          fontSize: 0,
        },
        lineMetrics: [],
      };
      return {
        hwidth: 0,
        hheight: 0,
        cx: 0,
        cy: 0,
      };
    }

    const { offscreenCanvas } =
      object?.ownerDocument?.defaultView?.getConfig() || {};
    const metrics = this.globalRuntime.textService.measureText(
      text,
      parsedStyle,
      offscreenCanvas,
    );
    parsedStyle.metrics = metrics;

    const { width, height, lineHeight, fontProperties } = metrics;

    const hwidth = width / 2;
    const hheight = height / 2;

    // default 'left'
    let lineXOffset = x + hwidth;
    if (textAlign === 'center' || textAlign === 'middle') {
      lineXOffset += lineWidth / 2 - hwidth;
    } else if (textAlign === 'right' || textAlign === 'end') {
      lineXOffset += lineWidth - hwidth * 2;
    }

    let lineYOffset = y - hheight;
    if (textBaseline === 'middle') {
      // eslint-disable-next-line prefer-destructuring
      lineYOffset += hheight;
    } else if (textBaseline === 'top' || textBaseline === 'hanging') {
      lineYOffset += hheight * 2;
    } else if (textBaseline === 'alphabetic') {
      // prevent calling getImageData for ascent metrics
      lineYOffset += this.globalRuntime.enableCSSParsing
        ? lineHeight - fontProperties.ascent
        : 0;
    } else if (textBaseline === 'bottom' || textBaseline === 'ideographic') {
      lineYOffset += 0;
    }
    // TODO: ideographic & bottom

    if (dx) {
      lineXOffset += dx;
    }
    if (dy) {
      lineYOffset += dy;
    }

    return {
      cx: lineXOffset,
      cy: lineYOffset,
      hwidth,
      hheight,
    };
  }
}
