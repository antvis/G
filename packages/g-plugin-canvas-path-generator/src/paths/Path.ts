import type { ParsedPathStyleProps } from '@antv/g';

export function generatePath(context: CanvasRenderingContext2D, parsedStyle: ParsedPathStyleProps) {
  const { curve, zCommandIndexes } = parsedStyle.path;
  const path = [...curve];
  zCommandIndexes.forEach((zIndex, index) => {
    // @ts-ignore
    path.splice(zIndex + index, 1, ['Z']);
  });

  for (let i = 0; i < path.length; i++) {
    const params = path[i]; // eg. M 100 200
    const command = params[0];
    // V,H,S,T 都在前面被转换成标准形式
    switch (command) {
      case 'M':
        context.moveTo(params[1], params[2]);
        break;
      case 'C':
        context.bezierCurveTo(params[1], params[2], params[3], params[4], params[5], params[6]);
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
