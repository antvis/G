import type { ParsedPathStyleProps } from '@antv/g';

export function generatePath(context: CanvasRenderingContext2D, parsedStyle: ParsedPathStyleProps) {
  const { defX = 0, defY = 0 } = parsedStyle;
  const { curve, zCommandIndexes } = parsedStyle.path;
  const path = [...curve];
  zCommandIndexes.forEach((zIndex, index) => {
    // @ts-ignore
    path.splice(zIndex + index, 1, ['Z']);
  });

  for (let i = 0; i < path.length; i++) {
    const params = path[i];
    const command = params[0];
    switch (command) {
      case 'M':
        context.moveTo(params[1] - defX, params[2] - defY);
        break;
      case 'C':
        context.bezierCurveTo(
          params[1] - defX,
          params[2] - defY,
          params[3] - defX,
          params[4] - defY,
          params[5] - defX,
          params[6] - defY,
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
