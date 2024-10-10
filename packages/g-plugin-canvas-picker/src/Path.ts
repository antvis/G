import type {
  DisplayObject,
  GlobalRuntime,
  ParsedPathStyleProps,
  Path,
  PathSegment,
  PathStyleProps,
  Point,
  RenderingPluginContext,
} from '@antv/g-lite';
import {
  getOrCalculatePathTotalLength,
  isFillOrStrokeAffected,
} from '@antv/g-lite';
import { cubicPointDistance, quadPointDistance } from '@antv/g-math';
import { arcToCubic } from '@antv/util';
import { inBox, inLine, inPolygons } from './utils/math';

// TODO: replace it with method in @antv/util
function isPointInStroke(
  segments: PathSegment[],
  lineWidth: number,
  px: number,
  py: number,
  length: number,
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
        if (isHit) {
          return true;
        }
        break;
      case 'Q':
        const qDistance = quadPointDistance(
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
        if (isHit) {
          return true;
        }
        break;
      case 'C':
        const cDistance = cubicPointDistance(
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
        if (isHit) {
          return true;
        }
        break;
      case 'A':
        // cache conversion result
        if (!segment.cubicParams) {
          segment.cubicParams = arcToCubic(
            prePoint[0],
            prePoint[1],
            params[1],
            params[2],
            params[3],
            params[4],
            params[5],
            params[6],
            params[7],
            undefined,
          ) as [number, number, number, number, number, number];
        }

        const args = segment.cubicParams;

        // fixArc
        let prePointInCubic = prePoint;
        for (let i = 0; i < args.length; i += 6) {
          const cDistance = cubicPointDistance(
            prePointInCubic[0], // 上一段结束位置, 即 C 的起始点
            prePointInCubic[1],
            args[i],
            args[i + 1],
            args[i + 2],
            args[i + 3],
            args[i + 4],
            args[i + 5],
            px,
            py,
            length,
          );
          prePointInCubic = [args[i + 4], args[i + 5]];
          isHit = cDistance <= lineWidth / 2;

          if (isHit) {
            return true;
          }
        }
        break;
      default:
        break;
    }
  }
  return isHit;
}

export function isPointInPath(
  displayObject: DisplayObject<PathStyleProps>,
  position: Point,
  isClipPath: boolean,
  isPointInPath: (
    displayObject: DisplayObject<PathStyleProps>,
    position: Point,
  ) => boolean,
  renderingPluginContext: RenderingPluginContext,
  runtime: GlobalRuntime,
): boolean {
  const {
    lineWidth = 1,
    increasedLineWidthForHitTesting = 0,
    stroke,
    fill,
    d,
    pointerEvents = 'auto',
  } = displayObject.parsedStyle as ParsedPathStyleProps;

  const { segments, hasArc, polylines, polygons } = d;
  const [hasFill, hasStroke] = isFillOrStrokeAffected(
    pointerEvents,
    // Only a closed path can be filled.
    polygons?.length && fill,
    stroke,
  );

  const totalLength = getOrCalculatePathTotalLength(displayObject as Path);

  let isHit = false;

  if (hasFill || isClipPath) {
    if (hasArc) {
      // 存在曲线时，暂时使用 canvas 的 api 计算，后续可以进行多边形切割
      isHit = isPointInPath(displayObject, position);
    } else {
      // 提取出来的多边形包含闭合的和非闭合的，在这里统一按照多边形处理
      isHit =
        inPolygons(polygons, position.x, position.y) ||
        inPolygons(polylines, position.x, position.y);
    }
    return isHit;
  }
  if (hasStroke || isClipPath) {
    isHit = isPointInStroke(
      segments,
      lineWidth + increasedLineWidthForHitTesting,
      position.x,
      position.y,
      totalLength,
    );
  }

  return isHit;
}
