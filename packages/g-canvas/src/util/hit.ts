/**
 * @fileoverview 图形是否被击中
 * @author dxq613@gmail.com
 */

import InStroke from './in-stroke';
import { inBox, distance } from './util';

// 根据椭圆公式计算 x*x/rx*rx + y*y/ry*ry;
function ellipseDistance(xSquare, ySquare, rx, ry) {
  return xSquare / (rx * rx) + ySquare / (ry * ry);
}
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

// 多边形的射线检测
// function isInPolygon(points, x, y) {
//   let crossings = 0;
//   for (let i = 0; i < points.length; i++) {
//     const point = points[i];
//     const px = point[0];
//     const py = point[1];
//     const nextPoint = i == points.length - 1 ? points[0] : points[i + 1];
//     const slope = (nextPoint[1] - py) / (nextPoint[0] - px);
//     const cond = (px <= x) && (x < nextPoint[0]) || (py <= y) && (y < nextPoint[1]);
//     const above = y < slope * (x - px) + py;
//     if (cond && above) {
//       crossings++
//     }
//   }
//   return crossings % 2 !== 0;
// }

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
      isHit = isPointInPath(shape, x, y); // isInPolygon(points, x, y); //
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
    const halfLineWidth = lineWidth / 2;
    const absDistance = distance(cx, cy, x, y);
    // 直接用距离，如果同时存在边和填充时，可以减少两次计算
    if (isFill && isStroke) {
      return absDistance <= r + halfLineWidth;
    }
    if (isFill) {
      return absDistance <= r;
    }
    if (isStroke) {
      return absDistance >= r - halfLineWidth && absDistance <= r + halfLineWidth;
    }
    return false;
  },
  ellipse(shape, x, y) {
    const isFill = shape.isFill();
    const isStroke = shape.isStroke();
    const attrs = shape.attr();
    const lineWidth = shape.getHitLineWidth();
    const halfLineWith = lineWidth / 2;
    const cx = attrs.x;
    const cy = attrs.y;
    const {rx, ry} = attrs;
    const tmpX = (x - cx) * (x - cx);
    const tmpY = (y - cy) * (y - cy);
    // 使用椭圆的公式： x*x/rx*rx + y*y/ry*ry = 1; 
    if (isFill && isStroke) {
      return ellipseDistance(tmpX, tmpY, rx + halfLineWith, ry + halfLineWith) <= 1;
    }
    if (isFill) {
      return ellipseDistance(tmpX, tmpY, rx, ry) <= 1;
    }
    if (isStroke) {
      return ellipseDistance(tmpX, tmpY, rx - halfLineWith, ry - halfLineWith) >= 1 && 
        ellipseDistance(tmpX, tmpY, rx + halfLineWith, ry + halfLineWith) <= 1;
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
      // 仅填充时带有圆角的矩形直接通过图形拾取
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
