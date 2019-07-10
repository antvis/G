/**
 * @fileoverview 计算包围盒
 * @author dxq613@gmail.com
 */

function getBBoxByArray(xArr, yArr, lineWidth) {
  const minX = Math.min.apply(null, xArr);
  const minY = Math.min.apply(null, yArr);
  const maxX = Math.max.apply(null, xArr);
  const maxY = Math.max.apply(null, yArr);
  const halfWidth = lineWidth / 2;
  return {
    minX: minX - halfWidth,
    minY: minY - halfWidth,
    maxX: maxX + halfWidth,
    maxY: maxY + halfWidth,
  };
}

const BoxUtil = {
  line(attrs, lineWidth) {
    const { x1, y1, x2, y2 } = attrs;
    const halfWidth = lineWidth / 2;
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    return {
      minX: minX - halfWidth,
      minY: minY - halfWidth,
      maxX: maxX + halfWidth,
      maxY: maxY + halfWidth,
    };
  },
  rect(attrs, lineWidth) {
    const { x, y, width, height } = attrs;
    const halfWidth = lineWidth / 2;
    return {
      minX: x - halfWidth,
      minY: y - halfWidth,
      maxX: x + width + halfWidth,
      maxY: y + height + halfWidth,
    };
  },
  ellipse(attrs, lineWidth) {
    const { x, y, rx, ry } = attrs;
    const halfWidth = lineWidth / 2 + rx;
    const halfHeight = lineWidth / 2 + ry;
    return {
      minX: x - halfWidth,
      minY: y - halfHeight,
      maxX: x + halfWidth,
      maxY: y + halfHeight,
    };
  },
  circle(attrs, lineWidth) {
    const { x, y, r } = attrs;
    const halfWidth = lineWidth / 2 + r;
    return {
      minX: x - halfWidth,
      minY: y - halfWidth,
      maxX: x + halfWidth,
      maxY: y + halfWidth,
    };
  },
  polygon(attrs, lineWidth) {
    const points = attrs.points;
    const xArr = [];
    const yArr = [];
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      xArr.push(point[0]);
      yArr.push(point[1]);
    }
    return getBBoxByArray(xArr, yArr, lineWidth);
  },
  polyline(attrs, lineWidth) {
    return BoxUtil.polygon(attrs, lineWidth);
  },
  image(attrs, lineWidth) {
    return BoxUtil.rect(attrs, 0); // 图片不计算边框
  },
  // 使用同 circle 一致的包围盒计算方式
  marker(attrs, lineWidth) {
    return BoxUtil.circle(attrs, lineWidth);
  },
  /**
   * 使用快速方法计算 path 的包围盒，根据起点、结束点、控制点计算
   * 精准的包围盒在上层 util 中提供
   * @param {object} attrs     图形属性
   * @param {number} lineWidth 线宽度
   */
  path(attrs, lineWidth) {
    const path = attrs.path;
    const halfWidth = lineWidth / 2;
    const xArr = [];
    const yArr = [];
    for (let i = 0; i < path.length; i++) {
      const params = path[i];
      const command = params[0];
      // 圆弧的计算使用特别方法
      if (command === 'A') {
        // TO DO
      } else if (command !== 'Z') {
        // 使用模糊的包围盒计算方案，可以显著提升过滤图形的速度
        for (let j = 1; j < params.length - 2; j++) {
          xArr.push(params[j]);
          yArr.push(params[j + 1]);
        }
      }
    }
    return getBBoxByArray(xArr, yArr, lineWidth);
  },
  getBBox(type, attrs, lineWidth) {
    const bbox = BoxUtil[type](attrs, lineWidth);
    bbox.width = bbox.maxX - bbox.minX;
    bbox.height = bbox.maxY - bbox.minY;
    bbox.x = bbox.minX;
    bbox.y = bbox.minY;
    return bbox;
  },
};

export default BoxUtil;
