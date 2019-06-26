/**
 * @fileoverview 图形是否被击中
 * @author dxq613@gmail.com
 */

import InStroke from './in-stroke';
import { inBox, distance } from './util';
// 全局设置一个唯一离屏的 ctx，用于计算 isPointInPath
let offScreenCtx = null;
function getOffScreenContext() {
  if (!offScreenCtx) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    offScreenCtx = canvas.getContext('2d');
  }
  return offScreenCtx;
}

function isPointInPath(shape, x, y) {
  const ctx = getOffScreenContext();
  shape.createPath(ctx);
  return ctx.isPointInPath(x, y);
}

const HitUtil = {
  line(shape, x, y) {
    const lineWidth = shape.getHitLineWidth();
    // 没有设置 stroke 不能被拾取, 没有线宽不能被拾取
    if (!shape.isStroke() || !lineWidth) {
      return false;
    }
    const { x1, y1, x2, y2 } = shape.attr();
    return InStroke.line(x1, y1, x2, y2, lineWidth, x, y);
  },
  polyline(shape, x, y) {
    const lineWidth = shape.getHitLineWidth();
    // 没有设置 stroke 不能被拾取, 没有线宽不能被拾取
    if (!shape.isStroke() || !lineWidth) {
      return false;
    }
    const { points } = shape.attr();
    return InStroke.polyline(points, lineWidth, x, y);
  },
  polygon(shape, x, y) {
    const isFill = shape.isFill();
    const isStroke = shape.isStroke();
    const { points } = shape.attr();
    let isHit = false;
    if (isStroke) {
      const lineWidth = shape.getHitLineWidth();
      isHit = InStroke.polygon(points, lineWidth, x, y);
    }
    if (!isHit && isFill) {
      isHit = isPointInPath(shape, x, y);
    }
    return isHit;
  },
  circle(shape, x, y) {
    const isFill = shape.isFill();
    const isStroke = shape.isStroke();
    const attrs = shape.attr();
    const cx = attrs.x;
    const cy = attrs.y;
    const r = attrs.r;
    const lineWidth = shape.getHitLineWidth();
    if (isFill && isStroke) {
      return distance(cx, cy, x, y) <= r + lineWidth / 2;
    }
    if (isFill) {
      return distance(cx, cy, x, y) <= r;
    }

    if (isStroke) {

    }
    return false;
  },
  rect(shape, x, y) {
    const isFill = shape.isFill();
    const isStroke = shape.isStroke();
    const attrs = shape.attr();
    const minX = attrs.x;
    const minY = attrs.y;
    const width = attrs.width;
    const height = attrs.height;
    const radius = attrs.radius;
    const lineWidth = shape.getHitLineWidth();
    // 无圆角时的策略
    if (!radius) {
      const halfWidth = lineWidth / 2;
      // 同时填充和带有边框
      if (isFill && isStroke) {
        return inBox(minX - halfWidth, minY - halfWidth, width + halfWidth, height + halfWidth, x, y);
      }
      // 仅填充
      if (isFill) {
        return inBox(minX, minY, width, height, x, y);
      }
      if (isStroke) {
        return InStroke.rect(minX, minY, width, height, lineWidth, x, y);
      }
    } else {
      let isHit = false;
      if (isStroke) {
        isHit = InStroke.rectWithRadius(minX, minY, width, height, radius, lineWidth, x, y);
      }
      if (!isHit && isFill) {
        isHit = isPointInPath(shape, x, y);
      }
      return isHit;
    }
  },
  isHitShape(shape, x, y) {
    const type = shape.get('type');
    if (HitUtil[type]) {
      return HitUtil[type](shape, x, y);
    }
    return false;
  },
};

export default HitUtil;
