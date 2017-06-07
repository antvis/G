var Vector2 = require('@ali/g-matrix').Vector2;

var THETA = Math.PI / 6;

function calculatePoints(vector, end, lineWidth) {
  var angle = (new Vector2(1, 0)).angleTo(vector);
  var downAngle = angle - THETA;
  var upAngle = angle + THETA;
  var length = 6 + lineWidth * 3;
  return [
    {
      x: end.x - length * Math.cos(downAngle),
      y: end.y - length * Math.sin(downAngle)
    },
    end,
    {
      x: end.x - length * Math.cos(upAngle),
      y: end.y - length * Math.sin(upAngle)
    }
  ];
}

function arrow(context, points) {
  context.moveTo(points[0].x, points[0].y);
  context.lineTo(points[1].x, points[1].y);
  context.lineTo(points[2].x, points[2].y);
}

function makeArrow(context, vector, end, lineWidth) {
  arrow(context, calculatePoints(vector, end, lineWidth));
}

function getEndPoint(vector, end, lineWidth) {
  var miterLimit = lineWidth / Math.sin(THETA);
  vector.setLength(miterLimit / 2);
  end.sub(vector);
  return end;
}

module.exports = {
  makeArrow: makeArrow,
  getEndPoint: getEndPoint
};
