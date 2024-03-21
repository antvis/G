import type { CSSRGB } from '../css';
import type { ParsedBaseStyleProps } from '../types';

export function isFillOrStrokeAffected(
  pointerEvents: ParsedBaseStyleProps['pointerEvents'] = 'auto',
  fill: ParsedBaseStyleProps['fill'],
  stroke: ParsedBaseStyleProps['stroke'],
): [boolean, boolean] {
  // account for pointerEvents
  // @see https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events

  let hasFill = false;
  let hasStroke = false;
  const isFillOtherThanNone = !!fill && !(fill as CSSRGB).isNone;
  const isStrokeOtherThanNone = !!stroke && !(stroke as CSSRGB).isNone;
  if (
    pointerEvents === 'visiblepainted' ||
    pointerEvents === 'painted' ||
    pointerEvents === 'auto'
  ) {
    hasFill = isFillOtherThanNone;
    hasStroke = isStrokeOtherThanNone;
  } else if (pointerEvents === 'visiblefill' || pointerEvents === 'fill') {
    hasFill = true;
  } else if (pointerEvents === 'visiblestroke' || pointerEvents === 'stroke') {
    hasStroke = true;
  } else if (pointerEvents === 'visible' || pointerEvents === 'all') {
    // The values of the fill and stroke do not affect event processing.
    hasFill = true;
    hasStroke = true;
  }

  return [hasFill, hasStroke];
}
