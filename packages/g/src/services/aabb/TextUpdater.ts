import { vec3 } from 'gl-matrix';
import { inject, injectable } from 'inversify';
import type { GeometryAABBUpdater } from '.';
import type { AABB } from '../../shapes';
import type { TextStyleProps } from '../../shapes-export';
import { TextService } from '../text';

@injectable()
export class TextUpdater implements GeometryAABBUpdater<TextStyleProps> {
  dependencies = [
    'text',
    'font',
    'fontSize',
    'fontFamily',
    'fontStyle',
    'fontWeight',
    'fontVariant',
    'lineHeight',
    'letterSpacing',
    'lineWidth',
    'padding',
    'wordWrap',
    'wordWrapWidth',
    'leading',
    'textBaseline',
    'textAlign',
    'whiteSpace:',
  ];

  @inject(TextService)
  private textService: TextService;

  update(attributes: TextStyleProps, aabb: AABB) {
    const { text = '', textAlign, lineWidth = 0, textBaseline } = attributes;

    const { width, height, lineHeight, fontProperties } = this.textService.measureText(
      text,
      attributes,
    );

    // anchor is left-top by default
    const halfExtents = vec3.fromValues(width / 2, height / 2, 0);

    // default 'left'
    let anchor = [0, 1];
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

    const center = vec3.fromValues(
      (1 - anchor[0] * 2) * halfExtents[0] + lineXOffset,
      (1 - anchor[1] * 2) * halfExtents[1] + lineYOffset,
      0,
    );
    aabb.update(center, halfExtents);
  }
}
