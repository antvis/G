import { each, isArray } from '@antv/util';
import { IElement } from '../interfaces';
import { Region } from '../types';
import { parseStyle } from './parse';
import getArcParams from './arc-params';
import { mergeRegion, intersectRect } from './util';
import * as ArrowUtil from '../util/arrow';

const SHAPE_ATTRS_MAP = {
  fill: 'fillStyle',
  stroke: 'strokeStyle',
  opacity: 'globalAlpha',
};

export function applyAttrsToContext(context: CanvasRenderingContext2D, element: IElement) {
  const attrs = element.attr();
  for (const k in attrs) {
    let v = attrs[k];
    // 转换一下不与 canvas 兼容的属性名
    const name = SHAPE_ATTRS_MAP[k] ? SHAPE_ATTRS_MAP[k] : k;
    if (name === 'matrix' && v) {
      // 设置矩阵
      context.transform(v[0], v[1], v[3], v[4], v[6], v[7]);
    } else if (name === 'lineDash' && context.setLineDash) {
      // 设置虚线，只支持数组形式，非数组形式不做任何操作
      isArray(v) && context.setLineDash(v);
    } else {
      if (name === 'strokeStyle' || name === 'fillStyle') {
        // 如果存在渐变、pattern 这个开销有些大
        // 可以考虑缓存机制，通过 hasUpdate 来避免一些运算
        v = parseStyle(context, element, v);
      } else if (name === 'globalAlpha') {
        // opacity 效果可以叠加，子元素的 opacity 需要与父元素 opacity 相乘
        v = v * context.globalAlpha;
      }
      context[name] = v;
    }
  }
}

export function drawChildren(context: CanvasRenderingContext2D, children: IElement[], region?: Region) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as IElement;
    if (child.cfg.visible) {
      child.draw(context, region);
    } else {
      child.skipDraw();
    }
  }
}

// 绘制 path
export function drawPath(shape, context, attrs, arcParamsCache) {
  const { path, startArrow, endArrow } = attrs;
  let currentPoint = [0, 0]; // 当前图形
  let startMovePoint = [0, 0]; // 开始 M 的点，可能会有多个
  let distance = {
    dx: 0,
    dy: 0,
  };
  context.beginPath();
  for (let i = 0; i < path.length; i++) {
    const params = path[i];
    const command = params[0];
    if (i === 0 && startArrow && startArrow.d) {
      const tangent = shape.getStartTangent();
      distance = ArrowUtil.getShortenOffset(tangent[0][0], tangent[0][1], tangent[1][0], tangent[1][1], startArrow.d);
    } else if (i === path.length - 2 && path[i + 1][0] === 'Z' && endArrow && endArrow.d) {
      // 为了防止结尾为 Z 的 segment 缩短不起效，需要取最后两个 segment 特殊处理
      const lastPath = path[i + 1];
      if (lastPath[0] === 'Z') {
        const tangent = shape.getEndTangent();
        distance = ArrowUtil.getShortenOffset(tangent[0][0], tangent[0][1], tangent[1][0], tangent[1][1], endArrow.d);
      }
    } else if (i === path.length - 1 && endArrow && endArrow.d) {
      if (path[0] !== 'Z') {
        const tangent = shape.getEndTangent();
        distance = ArrowUtil.getShortenOffset(tangent[0][0], tangent[0][1], tangent[1][0], tangent[1][1], endArrow.d);
      }
    }

    const { dx, dy } = distance;
    // V,H,S,T 都在前面被转换成标准形式
    switch (command) {
      case 'M':
        context.moveTo(params[1] - dx, params[2] - dy);
        startMovePoint = [params[1], params[2]];
        break;
      case 'L':
        context.lineTo(params[1] - dx, params[2] - dy);
        break;
      case 'Q':
        context.quadraticCurveTo(params[1], params[2], params[3] - dx, params[4] - dy);
        break;
      case 'C':
        context.bezierCurveTo(params[1], params[2], params[3], params[4], params[5] - dx, params[6] - dy);
        break;
      case 'A': {
        let arcParams;
        // 为了加速绘制，可以提供参数的缓存，各个图形自己缓存
        if (arcParamsCache) {
          arcParams = arcParamsCache[i];
          if (!arcParams) {
            arcParams = getArcParams(currentPoint, params);
            arcParamsCache[i] = arcParams;
          }
        } else {
          arcParams = getArcParams(currentPoint, params);
        }
        const { cx, cy, rx, ry, startAngle, endAngle, xRotation, sweepFlag } = arcParams;
        // 直接使用椭圆的 api
        if (context.ellipse) {
          context.ellipse(cx, cy, rx, ry, xRotation, startAngle, endAngle, 1 - sweepFlag);
        } else {
          const r = rx > ry ? rx : ry;
          const scaleX = rx > ry ? 1 : rx / ry;
          const scaleY = rx > ry ? ry / rx : 1;
          context.translate(cx, cy);
          context.rotate(xRotation);
          context.scale(scaleX, scaleY);
          context.arc(0, 0, r, startAngle, endAngle, 1 - sweepFlag);
          context.scale(1 / scaleX, 1 / scaleY);
          context.rotate(-xRotation);
          context.translate(-cx, -cy);
        }
        break;
      }
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
      currentPoint = [params[len - 2], params[len - 1]];
    }
  }
}

// 刷新图形元素(Shape 或者 Group)
export function refreshElement(element, changeType) {
  const canvas = element.get('canvas');
  // 只有存在于 canvas 上时生效
  if (canvas) {
    if (changeType === 'remove') {
      // 一旦 remove，则无法在 element 上拿到包围盒
      // destroy 后所有属性都拿不到，所以需要暂存一下
      // 这是一段 hack 的代码
      element._cacheCanvasBBox = element.get('cacheCanvasBBox');
    }
    // 防止反复刷新
    if (!element.get('hasChanged')) {
      // 本来只有局部渲染模式下，才需要记录更新的元素队列
      // if (canvas.get('localRefresh')) {
      //   canvas.refreshElement(element, changeType, canvas);
      // }
      // 但对于 https://github.com/antvis/g/issues/422 的场景，全局渲染的模式下也需要记录更新的元素队列
      canvas.refreshElement(element, changeType, canvas);
      if (canvas.get('autoDraw')) {
        canvas.draw();
      }
      element.set('hasChanged', true);
    }
  }
}

export function getRefreshRegion(element) {
  let region;
  if (!element.destroyed) {
    const cacheBox = element.get('cacheCanvasBBox');
    const validCache = cacheBox && !!(cacheBox.width && cacheBox.height);
    const bbox = element.getCanvasBBox();
    const validBBox = bbox && !!(bbox.width && bbox.height);
    // 是否是有效 bbox 判定，一些 NaN 或者 宽高为 0 的情况过滤掉
    if (validCache && validBBox) {
      region = mergeRegion(cacheBox, bbox);
    } else if (validCache) {
      region = cacheBox;
    } else if (validBBox) {
      region = bbox;
    }
  } else {
    // 因为元素已经销毁所以无法获取到缓存的包围盒
    region = element['_cacheCanvasBBox'];
  }
  return region;
}

export function getMergedRegion(elements): Region {
  if (!elements.length) {
    return null;
  }
  const minXArr = [];
  const minYArr = [];
  const maxXArr = [];
  const maxYArr = [];
  each(elements, (el: IElement) => {
    const region = getRefreshRegion(el);
    if (region) {
      minXArr.push(region.minX);
      minYArr.push(region.minY);
      maxXArr.push(region.maxX);
      maxYArr.push(region.maxY);
    }
  });
  return {
    minX: Math.min.apply(null, minXArr),
    minY: Math.min.apply(null, minYArr),
    maxX: Math.max.apply(null, maxXArr),
    maxY: Math.max.apply(null, maxYArr),
  };
}

export function mergeView(region, viewRegion) {
  if (!region || !viewRegion) {
    return null;
  }
  // 不相交，则直接返回 null
  if (!intersectRect(region, viewRegion)) {
    return null;
  }
  return {
    minX: Math.max(region.minX, viewRegion.minX),
    minY: Math.max(region.minY, viewRegion.minY),
    maxX: Math.min(region.maxX, viewRegion.maxX),
    maxY: Math.min(region.maxY, viewRegion.maxY),
  };
}
