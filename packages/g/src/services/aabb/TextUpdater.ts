import { inject, singleton } from 'mana-syringe';
import type { DisplayObject, ParsedTextStyleProps } from '../../display-objects';
import { Shape } from '../../types';
import { isNil } from '../../utils';
import { TextService } from '../TextService';
import { GeometryAABBUpdater } from './interfaces';

@singleton({ token: { token: GeometryAABBUpdater, named: Shape.TEXT } })
export class TextUpdater implements GeometryAABBUpdater<ParsedTextStyleProps> {
  @inject(TextService)
  private textService: TextService;

  private isReadyToMeasure(parsedStyle: ParsedTextStyleProps, object: DisplayObject) {
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
    const { text, textAlign, lineWidth, textBaseline, dx, dy } = parsedStyle;
    const { offscreenCanvas } = object?.ownerDocument?.defaultView?.getConfig() || {};

    if (!this.isReadyToMeasure(parsedStyle, object)) {
      // if (!text || !textAlign || !textBaseline ||) {
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
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        offsetX: 0,
        offsetY: 0,
      };
    }

    const metrics = this.textService.measureText(text, parsedStyle, offscreenCanvas);
    parsedStyle.metrics = metrics;

    const { width, height, lineHeight, fontProperties } = metrics;

    // anchor is left-top by default
    const halfExtents = [width / 2, height / 2, 0];

    // default 'left'
    let anchor: [number, number] = [0, 1];
    let lineXOffset = 0;
    if (textAlign === 'center') {
      lineXOffset = lineWidth / 2;
      anchor = [0.5, 1];
    } else if (textAlign === 'right' || textAlign === 'end') {
      lineXOffset = lineWidth;
      anchor = [1, 1];
    }

    let lineYOffset = 0;
    if (textBaseline === 'middle') {
      // eslint-disable-next-line prefer-destructuring
      lineYOffset = halfExtents[1];
    } else if (textBaseline === 'top' || textBaseline === 'hanging') {
      lineYOffset = halfExtents[1] * 2;
    } else if (textBaseline === 'alphabetic') {
      lineYOffset = lineHeight - fontProperties.ascent;
    } else if (textBaseline === 'bottom' || textBaseline === 'ideographic') {
      lineYOffset = 0;
    }
    // TODO: ideographic & bottom

    if (dx) {
      lineXOffset += dx;
    }
    if (dy) {
      lineYOffset += dy;
    }

    // update anchor
    parsedStyle.anchor = [anchor[0], anchor[1], 0];
    // console.log(parsedStyle.anchor);

    // if (!parsedStyle.transformOrigin) {
    //   parsedStyle.transformOrigin = [
    //     // new CSSUnitValue(anchor[0] * 100, '%'),
    //     // new CSSUnitValue(anchor[1] * 100, '%'),
    //     new CSSUnitValue(0, '%'),
    //     new CSSUnitValue(0, '%'),
    //     new CSSUnitValue(0, '%'),
    //   ];
    // }

    return {
      width: halfExtents[0] * 2,
      height: halfExtents[1] * 2,
      offsetX: lineXOffset,
      offsetY: lineYOffset,
    };
  }
}
