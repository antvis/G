import type { DisplayObject, ParsedBaseStyleProps, PathStyleProps, Point } from '@antv/g';
import { mat3, vec2 } from 'gl-matrix';
import { Quad as QuadUtil, Cubic as CubicUtil } from '@antv/g-math';
import { inArc, inBox, inLine, inPolygons } from './utils/math';

function isPointInStroke(
  segments: any[],
  lineWidth: number,
  px: number,
  py: number,
  length: number,
  x: number,
  y: number,
) {
  let isHit = false;
  const halfWidth = lineWidth / 2;
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const { currentPoint, params, prePoint, box } = segment;
    // 如果在前面已经生成过包围盒，直接按照包围盒计算
    if (
      box &&
      !inBox(
        box.x - halfWidth,
        box.y - halfWidth,
        box.width + lineWidth,
        box.height + lineWidth,
        px,
        py,
      )
    ) {
      continue;
    }
    switch (segment.command) {
      // L 和 Z 都是直线， M 不进行拾取
      case 'L':
      case 'Z':
        isHit = inLine(
          prePoint[0],
          prePoint[1],
          currentPoint[0],
          currentPoint[1],
          lineWidth,
          px,
          py,
        );
        break;
      case 'Q':
        const qDistance = QuadUtil.pointDistance(
          prePoint[0],
          prePoint[1],
          params[1],
          params[2],
          params[3],
          params[4],
          px,
          py,
        );
        isHit = qDistance <= lineWidth / 2;
        break;
      case 'C':
        const cDistance = CubicUtil.pointDistance(
          prePoint[0], // 上一段结束位置, 即 C 的起始点
          prePoint[1],
          params[1], // 'C' 的参数，1、2 为第一个控制点，3、4 为第二个控制点，5、6 为结束点
          params[2],
          params[3],
          params[4],
          params[5],
          params[6],
          px,
          py,
          length,
        );
        isHit = cDistance <= lineWidth / 2;
        break;
      case 'A':
        // 计算点到椭圆圆弧的距离，暂时使用近似算法，后面可以改成切割法求最近距离
        const arcParams = segment.arcParams;
        const { cx, cy, rx, ry, startAngle, endAngle, xRotation } = arcParams;
        const r = rx > ry ? rx : ry;
        const scaleX = rx > ry ? 1 : rx / ry;
        const scaleY = rx > ry ? ry / rx : 1;
        // const m = transform(null, [
        //   ['t', -cx, -cy],
        //   ['r', -xRotation],
        //   ['s', 1 / scaleX, 1 / scaleY],
        // ]);

        // FIXME
        const m = mat3.fromTranslation(mat3.create(), [-cx, -cy]);
        mat3.multiply(m, mat3.fromRotation(mat3.create(), -xRotation), m);
        mat3.multiply(m, mat3.fromScaling(mat3.create(), [1 / scaleX, 1 / scaleY]), m);

        let p = vec2.fromValues(px, py);
        p = vec2.transformMat3(p, p, m);

        // isHit = inArc(cx, cy, r, startAngle, endAngle, lineWidth, px, py);

        // console.log(m, p[0], px - cx);
        // isHit = inArc(cx, cy, r, startAngle, endAngle, lineWidth, px, py);
        isHit = inArc(0, 0, r, startAngle, endAngle, lineWidth, p[0], p[1]);
        break;
      default:
        break;
    }
    if (isHit) {
      break;
    }
  }
  return isHit;
}

export function isPointInPath(
  displayObject: DisplayObject<PathStyleProps>,
  position: Point,
  isPointInPath: (displayObject: DisplayObject<PathStyleProps>, position: Point) => boolean,
): boolean {
  const {
    lineWidth,
    stroke,
    fill,
    defX: x = 0,
    defY: y = 0,
    clipPathTargets,
    path,
  } = displayObject.parsedStyle as ParsedBaseStyleProps;
  const hasFill = displayObject.attributes.fill !== 'none' && !!fill;
  const hasStroke = displayObject.attributes.stroke !== 'none' && !!stroke;
  const { segments, hasArc, polylines, polygons, totalLength } = path;

  const isClipPath = !!clipPathTargets?.length;

  let isHit = false;
  if (hasStroke || isClipPath) {
    isHit = isPointInStroke(
      segments,
      lineWidth.value,
      position.x + x,
      position.y + y,
      totalLength,
      x,
      y,
    );
  }
  if (!isHit && (hasFill || isClipPath)) {
    if (hasArc) {
      // 存在曲线时，暂时使用 canvas 的 api 计算，后续可以进行多边形切割
      isHit = isPointInPath(displayObject, position);
    } else {
      // 提取出来的多边形包含闭合的和非闭合的，在这里统一按照多边形处理
      isHit =
        inPolygons(polygons, position.x + x, position.y + y) ||
        inPolygons(polylines, position.x + x, position.y + y);
    }
  }
  return isHit;
}
