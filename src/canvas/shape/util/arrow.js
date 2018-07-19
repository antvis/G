const PI = Math.PI;
const sin = Math.sin;
const cos = Math.cos;
const atan2 = Math.atan2;
const DEFAULT_LENGTH = 10;
const DEFAULT_ANGLE = PI / 3;

function _addArrow(ctx, attrs, x1, y1, x2, y2) {
  let leftX;
  let leftY;
  let rightX;
  let rightY;
  let offsetX;
  let offsetY;
  let angle;

  if (!attrs.fill) { // 闭合的不绘制箭头
    const arrowLength = attrs.arrowLength || DEFAULT_LENGTH;
    const arrowAngle = attrs.arrowAngle ? (attrs.arrowAngle * PI) / 180 : DEFAULT_ANGLE; // 转换为弧
    // Calculate angle
    angle = atan2((y2 - y1), (x2 - x1));
    // Adjust angle correctly
    angle -= PI;
    // Calculate offset to place arrow at edge of path
    offsetX = (attrs.lineWidth * cos(angle));
    offsetY = (attrs.lineWidth * sin(angle));

    // Calculate coordinates for left half of arrow
    leftX = x2 + (arrowLength * cos(angle + (arrowAngle / 2)));
    leftY = y2 + (arrowLength * sin(angle + (arrowAngle / 2)));
    // Calculate coordinates for right half of arrow
    rightX = x2 + (arrowLength * cos(angle - (arrowAngle / 2)));
    rightY = y2 + (arrowLength * sin(angle - (arrowAngle / 2)));
    ctx.beginPath();
    // Draw left half of arrow
    ctx.moveTo(leftX - offsetX, leftY - offsetY);
    ctx.lineTo(x2 - offsetX, y2 - offsetY);
    // Draw right half of arrow
    ctx.lineTo(rightX - offsetX, rightY - offsetY);

    // Visually connect arrow to path
    ctx.moveTo(x2 - offsetX, y2 - offsetY);
    ctx.lineTo(x2 + offsetX, y2 + offsetY);
    // Move back to end of path
    ctx.moveTo(x2, y2);
    ctx.stroke();
  }
}

function _addMarker(ctx, attrs, x1, y1, x2, y2, shape) {
  const marker = shape.__attrs;
  if (!marker.x) {
    marker.x = x2;
  }
  if (!marker.y) {
    marker.y = y2;
  }
  if (!marker.r) {
    marker.r = attrs.lineWidth;
  }

  let deg = 0;
  const x = x2 - x1;
  const y = y2 - y1;
  const tan = Math.atan(x / y);
  if (y === 0 && x < 0) {
    deg = Math.PI;
  } else if (x > 0 && y > 0) {
    deg = Math.PI / 2 - tan;
  } else if (x < 0 && y < 0) {
    deg = -Math.PI / 2 - tan;
  } else if (x >= 0 && y < 0) {
    deg = -tan - Math.PI / 2;
  } else if (x <= 0 && y > 0) {
    deg = Math.PI / 2 - tan;
  }
  ctx.save();
  ctx.beginPath();
  ctx.translate(marker.x, marker.y);
  ctx.rotate(deg);
  ctx.translate(-marker.x, -marker.y);
  shape.createPath(ctx);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = shape.attr('fill') || ctx.strokeStyle;
  ctx.fill();
  ctx.restore();
}

module.exports = {
  addStartArrow(ctx, attrs, x1, y1, x2, y2) {
    if (typeof attrs.startArrow === 'object') {
      _addMarker(ctx, attrs, x1, y1, x2, y2, attrs.startArrow);
    } else if (attrs.startArrow) {
      _addArrow(ctx, attrs, x1, y1, x2, y2);
    }
  },
  addEndArrow(ctx, attrs, x1, y1, x2, y2) {
    if (typeof attrs.endArrow === 'object') {
      _addMarker(ctx, attrs, x1, y1, x2, y2, attrs.endArrow);
    } else if (attrs.endArrow) {
      _addArrow(ctx, attrs, x1, y1, x2, y2);
    }
  }
};
