import type { ParsedBaseStyleProps } from '@antv/g';

export function generatePath(context: CanvasRenderingContext2D, parsedStyle: ParsedBaseStyleProps) {
  let { defX: x = 0, defY: y = 0 } = parsedStyle;

  const { curve, zCommandIndexes } = parsedStyle.path!;
  const path = curve;
  zCommandIndexes.forEach((zIndex, index) => {
    path.splice(zIndex + index, 0, ['Z']);
  });

  let currentPoint: [number, number] = [-x, -y]; // 当前图形
  let startMovePoint: [number, number] = [-x, -y]; // 开始 M 的点，可能会有多个

  for (let i = 0; i < path.length; i++) {
    const params = path[i]; // eg. M 100 200
    const command = params[0];
    // V,H,S,T 都在前面被转换成标准形式
    switch (command) {
      case 'M':
        context.moveTo(params[1]! - x, params[2]! - y);
        startMovePoint = [params[1]! - x, params[2]! - y];
        break;
      // case 'L':
      //   context.lineTo(params[1]! - x, params[2]! - y);
      //   break;
      // case 'Q':
      //   context.quadraticCurveTo(params[1]! - x, params[2]! - y, params[3]! - x, params[4]! - y);
      //   break;
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
      // case 'A': {
      //   let arcParams: ArcParams;
      //   // 为了加速绘制，可以提供参数的缓存，各个图形自己缓存
      //   if (arcParamsCache) {
      //     arcParams = arcParamsCache[i];
      //     if (!arcParams) {
      //       arcParams = getArcParams(currentPoint, params, x, y);
      //       arcParamsCache[i] = arcParams;
      //     }
      //   } else {
      //     arcParams = getArcParams(currentPoint, params, x, y);
      //   }
      //   const { cx, cy, rx, ry, startAngle, endAngle, xRotation, sweepFlag } = arcParams;
      //   // 直接使用椭圆的 api
      //   if (context.ellipse) {
      //     context.ellipse(cx, cy, rx, ry, xRotation, startAngle, endAngle, !!(1 - sweepFlag));
      //   } else {
      //     // 如果不支持，则使用圆来绘制，进行变形
      //     const r = rx > ry ? rx : ry;
      //     const scaleX = rx > ry ? 1 : rx / ry;
      //     const scaleY = rx > ry ? ry / rx : 1;
      //     context.translate(cx, cy);
      //     context.rotate(xRotation);
      //     context.scale(scaleX, scaleY);
      //     context.arc(0, 0, r, startAngle, endAngle, !!(1 - sweepFlag));
      //     context.scale(1 / scaleX, 1 / scaleY);
      //     context.rotate(-xRotation);
      //     context.translate(-cx, -cy);
      //   }
      //   break;
      // }
      case 'Z':
        context.closePath();
        break;
      default:
        break;
    }

    // 有了 Z 后，当前节点从开始 M 的点开始
    if (command === 'Z') {
      currentPoint = startMovePoint;
    } else {
      const len = params.length;
      currentPoint = [(params[len - 2] as number) - x, (params[len - 1] as number) - y];
    }
  }
}
