import type { ParsedPathStyleProps, Path } from '@antv/g-lite';
import { isDisplayObject, translatePathToString } from '@antv/g-lite';

export function updatePathElementAttribute(
  $el: SVGElement,
  parsedStyle: ParsedPathStyleProps,
) {
  const { d, markerStart, markerEnd, markerStartOffset, markerEndOffset } =
    parsedStyle;

  let startOffsetX = 0;
  let startOffsetY = 0;
  let endOffsetX = 0;
  let endOffsetY = 0;

  let rad = 0;
  let x: number;
  let y: number;

  if (markerStart && isDisplayObject(markerStart) && markerStartOffset) {
    const [p1, p2] = (markerStart.parentNode as Path).getStartTangent();
    x = p1[0] - p2[0];
    y = p1[1] - p2[1];
    rad = Math.atan2(y, x);
    startOffsetX = Math.cos(rad) * (markerStartOffset || 0);
    startOffsetY = Math.sin(rad) * (markerStartOffset || 0);
  }

  if (markerEnd && isDisplayObject(markerEnd) && markerEndOffset) {
    const [p1, p2] = (markerEnd.parentNode as Path).getEndTangent();
    x = p1[0] - p2[0];
    y = p1[1] - p2[1];
    rad = Math.atan2(y, x);
    endOffsetX = Math.cos(rad) * (markerEndOffset || 0);
    endOffsetY = Math.sin(rad) * (markerEndOffset || 0);
  }

  $el.setAttribute(
    'd',
    translatePathToString(
      d.absolutePath,
      startOffsetX,
      startOffsetY,
      endOffsetX,
      endOffsetY,
    ),
  );
}
