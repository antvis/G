import type { ParsedPathStyleProps } from '@antv/g';

export function generatePath(context: CanvasRenderingContext2D, parsedStyle: ParsedPathStyleProps) {
  const { defX: x = 0, defY: y = 0 } = parsedStyle;

  const { curve, zCommandIndexes } = parsedStyle.path;
  const path = [...curve];
  zCommandIndexes.forEach((zIndex, index) => {
    path.splice(zIndex + index, 1, ['Z']);
  });

  for (let i = 0; i < path.length; i++) {
    const params = path[i]; // eg. M 100 200
    const command = params[0];
    // V,H,S,T 都在前面被转换成标准形式
    switch (command) {
      case 'M':
        context.moveTo(params[1]! - x, params[2]! - y);
        break;
      case 'C':
        context.bezierCurveTo(
          params[1]! - x,
          params[2]! - y,
          params[3]! - x,
          params[4]! - y,
          params[5]! - x,
          params[6]! - y,
        );
        break;
      case 'Z':
        context.closePath();
        break;
      default:
        break;
    }
  }
}
