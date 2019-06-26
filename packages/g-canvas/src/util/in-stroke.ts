import * as vec2 from '@antv/gl-matrix/lib/gl-matrix/vec2';
import { inBox, distance } from './util';

function point2LinteDistance(x1: number, y1: number, x2: number, y2: number, x: number, y: number) {
  const d = [ x2 - x1, y2 - y1 ];
    // 如果端点相等，则判定点到点的距离
  if (vec2.exactEquals(d, [ 0, 0 ])) {
    return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
  }

  const u = [ -d[1], d[0] ];
  vec2.normalize(u, u);
  const a = [ x - x1, y - y1 ];
  return Math.abs(vec2.dot(a, u));
}

function inLine(x1: number, y1: number, x2: number, y2: number, lineWidth: number, x: number, y: number) {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  const halfWidth = lineWidth / 2;
  // 因为目前的方案是计算点到直线的距离，而有可能会在延长线上，所以要先判断是否在包围盒内
  // 这种方案会在水平或者竖直的情况下载线的延长线上有半 lineWidth 的误差
  if (!(x >= minX - halfWidth &&
    x <= maxX + halfWidth &&
    y >= minY - halfWidth &&
    y <= maxY + halfWidth)) {
    // 如果使用 util 方法，
    // 反复加减
    // inBox(
    //   minX - halfWidth, minY - halfWidth,
    //   maxX + halfWidth - minX, maxY + halfWidth - minY,
    //   x, y)
    return false;
  }

  return point2LinteDistance(x1, y1, x2, y2, x, y) <= lineWidth / 2;
}

function inPolyline(points: any[], x: number, y: number, lineWidth: number, isClose: boolean) {
  const l = points.length - 1;
  if (l < 1) {
    return false;
  }
  for (let i = 0; i < l; i++) {
    const x1 = points[i][0];
    const y1 = points[i][1];
    const x2 = points[i + 1][0];
    const y2 = points[i + 1][1];

    if (inLine(x1, y1, x2, y2, lineWidth, x, y)) {
      return true;
    }
  }

  // 如果封闭，则计算起始点和结束点的边
  if (isClose) {
    const first = points[0];
    const last = points[points.length - 1];
    if (inLine(first[0], first[1], last[0], last[1], lineWidth, x, y)) {
      return true;
    }
  }

  return false;
}

const StrokeUtil = {
  line: inLine,
  rect(minX: number, minY: number, width: number, height: number, lineWidth: number, x: number, y: number) {
    const halfWidth = lineWidth / 2;
    // 将四个边看做矩形来检测，比边的检测算法要快
    return inBox(minX - halfWidth, minY - halfWidth, width, lineWidth, x, y) || // 上边
      inBox(minX + width - halfWidth, minY - halfWidth, lineWidth, height, x, y) || // 右边
      inBox(minX + halfWidth, minY + height - halfWidth, width, lineWidth, x, y) || // 下边
      inBox(minX - halfWidth, minY + halfWidth, lineWidth, height, x, y); // 左边
  },
  // tslint 提示超过 120 个字符，只能把 :number 声明去掉了
  rectWithRadius(minX, minY, width, height, radius, lineWidth, x, y) {
    const halfWidth = lineWidth / 2;
    return StrokeUtil.line(minX + radius, minY, minX + width - radius, minY, lineWidth, x, y) ||
      StrokeUtil.line(minX + width, minY + radius, minX + width, minY + height - radius, lineWidth, x, y) ||
      StrokeUtil.line(minX + width - radius, minY + height, minX + radius, minY + height, lineWidth, x, y) ||
      StrokeUtil.line(minX, minY + height - radius, minX, minY + radius, lineWidth, x, y) ||
      StrokeUtil.arc(minX + width - radius, minY + radius, radius, 1.5 * Math.PI, 2 * Math.PI, lineWidth, x, y) ||
      StrokeUtil.arc(minX + width - radius, minY + height - radius, radius, 0, 0.5 * Math.PI, lineWidth, x, y) ||
      StrokeUtil.arc(minX + radius, minY + height - radius, radius, 0.5 * Math.PI, Math.PI, lineWidth, x, y) ||
      StrokeUtil.arc(minX + radius, minY + radius, radius, Math.PI, 1.5 * Math.PI, lineWidth, x, y);
  },
  circle(cx: number, cy: number, r: number, lineWidth: number, x: number, y: number) {
    const dis = distance(cx, cy, x, y);
    const halfWidth = lineWidth / 2;
    return dis >= r - halfWidth && dis <= r + halfWidth;
  },
  // tslint 提示超过 120 个字符，只能把 :number 声明去掉了
  arc(cx, cy, r, startAngle, endAngle, lineWidth, x, y) {
    const angle = Math.atan2(y - cy, x - cx) % (Math.PI * 2); // 转换到 0 - 2 * Math.PI 之间
    if (angle < startAngle || angle > endAngle) {
      return false;
    }
    const point = {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
    return distance(point.x, point.y, x, y) <= lineWidth / 2;
  },
  polyline(points: any[], lineWidth: number, x: number, y: number) {
    return inPolyline(points, x, y, lineWidth, false);
  },
  polygon(points: any[], lineWidth: number, x: number, y: number) {
    return inPolyline(points, x, y, lineWidth, true);
  },

};

export default StrokeUtil;
