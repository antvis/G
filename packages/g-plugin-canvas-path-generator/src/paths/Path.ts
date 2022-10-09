import type { ParsedPathStyleProps, Path } from '@antv/g-lite';
import { DisplayObject } from '@antv/g-lite';

export function generatePath(context: CanvasRenderingContext2D, parsedStyle: ParsedPathStyleProps) {
  const {
    defX = 0,
    defY = 0,
    markerStart,
    markerEnd,
    markerStartOffset,
    markerEndOffset,
  } = parsedStyle;
  const { curve, zCommandIndexes } = parsedStyle.path;
  const path = [...curve];
  zCommandIndexes.forEach((zIndex, index) => {
    // @ts-ignore
    path.splice(zIndex + index + 1, 0, ['Z']);
  });

  // @ts-ignore
  const isClosed = path.length && path[path.length - 1][0] === 'Z';

  let startOffsetX = 0;
  let startOffsetY = 0;
  let endOffsetX = 0;
  let endOffsetY = 0;

  let rad = 0;
  let x: number;
  let y: number;

  if (markerStart && markerStart instanceof DisplayObject && markerStartOffset) {
    const [p1, p2] = (markerStart.parentNode as Path).getStartTangent();
    x = p1[0] - p2[0];
    y = p1[1] - p2[1];

    rad = Math.atan2(y, x);
    startOffsetX = Math.cos(rad) * (markerStartOffset || 0);
    startOffsetY = Math.sin(rad) * (markerStartOffset || 0);
  }

  if (markerEnd && markerEnd instanceof DisplayObject && markerEndOffset) {
    const [p1, p2] = (markerEnd.parentNode as Path).getEndTangent();
    x = p1[0] - p2[0];
    y = p1[1] - p2[1];
    rad = Math.atan2(y, x);
    endOffsetX = Math.cos(rad) * (markerEndOffset || 0);
    endOffsetY = Math.sin(rad) * (markerEndOffset || 0);
  }

  for (let i = 0; i < path.length; i++) {
    const params = path[i];
    const command = params[0];
    switch (command) {
      case 'M':
        context.moveTo(params[1] - defX + startOffsetX, params[2] - defY + startOffsetY);
        break;
      case 'C':
        // the last C command
        const offsetX = i === path.length - (isClosed ? 2 : 1) ? endOffsetX : 0;
        const offsetY = i === path.length - (isClosed ? 2 : 1) ? endOffsetY : 0;

        context.bezierCurveTo(
          params[1] - defX,
          params[2] - defY,
          params[3] - defX,
          params[4] - defY,
          params[5] - defX + offsetX,
          params[6] - defY + offsetY,
        );
        break;
      // @ts-ignore
      case 'Z':
        context.closePath();
        break;
      default:
        break;
    }
  }
}
