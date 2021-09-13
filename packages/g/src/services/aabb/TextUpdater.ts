import { vec3 } from 'gl-matrix';
import { inject, injectable } from 'inversify';
import type { GeometryAABBUpdater } from './interfaces';
import type { ParsedTextStyleProps } from '../../display-objects/Text';
import { TextService } from '../text';

@injectable()
export class TextUpdater implements GeometryAABBUpdater<ParsedTextStyleProps> {
  @inject(TextService)
  private textService: TextService;

  update(parsedStyle: ParsedTextStyleProps) {
    const { text = '', textAlign, lineWidth = 0, textBaseline, x = 0, y = 0 } = parsedStyle;

    const metrics = this.textService.measureText(text, parsedStyle);
    parsedStyle.metrics = metrics;
    const { width, height, lineHeight, fontProperties } = metrics;

    // anchor is left-top by default
    const halfExtents = vec3.fromValues(width / 2, height / 2, 0);

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
    // update anchor
    parsedStyle.anchor = anchor;

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

    return {
      width: halfExtents[0] * 2,
      height: halfExtents[1] * 2,
      x,
      y,
      offsetX: lineXOffset,
      offsetY: lineYOffset,
    };
  }
}
