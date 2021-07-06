attribute vec2 in_position;
attribute vec2 in_startPos;
attribute vec2 in_endPos;
attribute vec2 in_prevPos;
attribute vec2 in_nextPos;
attribute vec4 in_cp;
attribute float in_type;
attribute vec4 in_color;

varying vec2 v_startPos;
varying vec2 v_endPos;

// 两个端点相交处的中线向量，用来计算lineJoin等
varying vec2 v_startMiterVec;
varying vec2 v_endMiterVec;

// 线两个端点的切线向量
varying vec2 v_startVec;
varying vec2 v_endVec;

varying vec4 v_cp;
varying float v_type;
varying vec4 v_color;
varying vec2 v_arcCenter;

uniform vec2 u_Viewport;
uniform float u_lineWidth;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;
#pragma include "instancing.declaration"

vec4 viewCoord(vec3 c) {
  #pragma include "instancing"
  vec4 result = u_ProjectionMatrix * u_ViewMatrix * modelMatrix * vec4(c.xyz, 1.0);
  if (result.w != 0.0) result = result / result.w * u_Viewport.x / u_Viewport.y;
  return result;
}

vec4 viewCoord(vec2 c) {
  return viewCoord(vec3(c, 0.));
}

// https://stackoverflow.com/a/9246451
float distToLine(vec2 pt1, vec2 pt2, vec2 testPt) {
  vec2 lineDir = pt2 - pt1;
  vec2 perpDir = vec2(lineDir.y, -lineDir.x);
  vec2 dirToPt1 = pt1 - testPt;
  return abs(dot(normalize(perpDir), dirToPt1));
}

// w3.org/TR/SVG/implnote.html#ArcConversionEndpointToCenter
vec4 endPointsToParameterization(vec2 a, vec2 b, vec2 flags, float rx, float ry,
                                 float phi) {
  // step.1
  vec2 c = mat2(cos(phi), -sin(phi), sin(phi), cos(phi)) *
           vec2((a.x - b.x) / 2., (a.y - b.y) / 2.);

  // step.2
  vec2 d =
      sqrt((rx * rx * ry * ry - rx * rx * c.y * c.y - ry * ry * c.x * c.x) /
           (rx * rx * c.y * c.y + ry * ry * c.x * c.x)) *
      vec2(rx * c.y / ry, -ry * c.x / rx);
  if (flags.x == flags.y) {
    d = -d;
  }

  // step.3
  vec2 center = mat2(cos(phi), sin(phi), -sin(phi), cos(phi)) * d +
                vec2((a.x + b.x) / 2., (a.y + b.y) / 2.);

  // step.4
  // 用两个端点结合flag来判断，不用计算角度

  return vec4(center, 0., 0.);
}

// 计算椭圆上某点的切线，没有找到现成的实现，采用了转换成标准坐标计算切线再转化回来的方案，可能不够robust
vec2 calculateTangentVecOfEllipse(vec2 center,        // 圆心坐标
                                  float rx, float ry, // 两个半径
                                  float sweep, // 方向，0: 顺时针，1: 逆时针
                                  float phi, // 与x轴夹角
                                  vec2 p     // 在椭圆上的某个点
) {
  // step.1 转换坐标
  mat2 rotateMat = mat2(cos(-phi), sin(-phi), -sin(-phi), cos(-phi));
  vec2 transformedPos = rotateMat * (p - center);
  // step.2 计算切线
  // 正确性存疑：https://mathforums.com/threads/the-tangential-and-normal-vectors-of-an-ellipse.328564/
  vec2 tangent = vec2(rx / ry * transformedPos.y, -ry / rx * transformedPos.x);
  if (sweep == 1.) {
    tangent = -tangent;
  }
  // step.3 切线转化回来
  mat2 invRotateMat = mat2(cos(phi), sin(phi), -sin(phi), cos(phi));
  return invRotateMat * normalize(tangent);
}

// https://www.shadertoy.com/view/XdVBWd
// Exact BBox to a quadratic bezier
// cubic bezier的包围盒，为了提升效率
// return: 左下和右上点的坐标：vec4(min.x, min.y, max.x, max.y)
vec4 bboxBezier(in vec2 p0, in vec2 p1, in vec2 p2, in vec2 p3) {
  // extremes
  vec2 mi = min(p0, p3);
  vec2 ma = max(p0, p3);

  vec2 k0 = -1.0 * p0 + 1.0 * p1;
  vec2 k1 = 1.0 * p0 - 2.0 * p1 + 1.0 * p2;
  vec2 k2 = -1.0 * p0 + 3.0 * p1 - 3.0 * p2 + 1.0 * p3;

  vec2 h = k1 * k1 - k0 * k2;

  if (h.x > 0.0) {
    h.x = sqrt(h.x);
    // float t = (-k1.x - h.x)/k2.x;
    float t = k0.x / (-k1.x - h.x);
    if (t > 0.0 && t < 1.0) {
      float s = 1.0 - t;
      float q = s * s * s * p0.x + 3.0 * s * s * t * p1.x +
                3.0 * s * t * t * p2.x + t * t * t * p3.x;
      mi.x = min(mi.x, q);
      ma.x = max(ma.x, q);
    }
    // t = (-k1.x + h.x)/k2.x;
    t = k0.x / (-k1.x + h.x);
    if (t > 0.0 && t < 1.0) {
      float s = 1.0 - t;
      float q = s * s * s * p0.x + 3.0 * s * s * t * p1.x +
                3.0 * s * t * t * p2.x + t * t * t * p3.x;
      mi.x = min(mi.x, q);
      ma.x = max(ma.x, q);
    }
  }

  if (h.y > 0.0) {
    h.y = sqrt(h.y);
    // float t = (-k1.y - h.y)/k2.y;
    float t = k0.y / (-k1.y - h.y);
    if (t > 0.0 && t < 1.0) {
      float s = 1.0 - t;
      float q = s * s * s * p0.y + 3.0 * s * s * t * p1.y +
                3.0 * s * t * t * p2.y + t * t * t * p3.y;
      mi.y = min(mi.y, q);
      ma.y = max(ma.y, q);
    }
    // t = (-k1.y + h.y)/k2.y;
    t = k0.y / (-k1.y + h.y);
    if (t > 0.0 && t < 1.0) {
      float s = 1.0 - t;
      float q = s * s * s * p0.y + 3.0 * s * s * t * p1.y +
                3.0 * s * t * t * p2.y + t * t * t * p3.y;
      mi.y = min(mi.y, q);
      ma.y = max(ma.y, q);
    }
  }

  return vec4(mi, ma);
}

mat3 getTransformMatrix(vec2 startPos, vec2 endPos, float lineWidth) {
  vec2 centerPos = (startPos + endPos) / 2.;
  vec2 delta = endPos - startPos;
  float len = length(delta);
  float phi = atan(delta.y / delta.x);

  mat3 scale = mat3(len, 0, 0, 0, lineWidth, 0, 0, 0, 1);

  mat3 rotate = mat3(cos(phi), sin(phi), 0, -sin(phi), cos(phi), 0, 0, 0, 1);

  mat3 translate = mat3(1, 0, 0, 0, 1, 0, centerPos.x, centerPos.y, 1);
  // mat3 translate = mat3(1, 0, 0, 0, 1, 0, startPos.x, startPos.y, 1);
  // mat3 translate = mat3(1, 0, 0, 0, 1, 0, endPos.x, endPos.y, 1);

  return translate * rotate * scale;
}

vec2 getMitterVec(vec2 prevDir, vec2 currDir) {
  if (prevDir == vec2(0., 0.) || currDir == vec2(0., 0.)) {
    return vec2(0., 0.);
  }
  vec2 normal1 = vec2(-prevDir.y, prevDir.x);
  vec2 normal2 = vec2(-currDir.y, currDir.x);
  vec2 normal = normalize(normal1 + normal2);
  vec2 vec = normal * 1. / abs(dot(normal, normal1));
  return -vec; // 逆时针向外的向量
}

void main() {
  // vec4 startPos = viewCoord(in_startPos);
  // vec4 endPos = viewCoord(in_endPos);
  // vec4 prevPos = viewCoord(in_prevPos);
  // vec4 nextPos = viewCoord(in_nextPos);

  vec4 startPos = vec4(in_startPos, 0., 1.);
  vec4 endPos = vec4(in_endPos, 0., 1.);
  vec4 prevPos = vec4(in_prevPos, 0., 1.);
  vec4 nextPos = vec4(in_nextPos, 0., 1.);

  vec2 prevDir = normalize(startPos.xy - prevPos.xy);
  vec2 startVec = vec2(0., 0.);
  vec2 endVec = vec2(0., 0.);
  vec2 nextDir = normalize(nextPos.xy - endPos.xy);
  if (in_type == 0.) {
    startVec = normalize(endPos.xy - startPos.xy);
    endVec = startVec;
  } else if (in_type == 1.) {
    startVec = normalize(in_cp.xy - startPos.xy);
    endVec = normalize(endPos.xy - in_cp.xy);
  } else if (in_type == 2.) {
    vec2 flags = vec2(floor(in_cp.w / 2.), mod(in_cp.w, 2.));
    // vec2 flags = vec2(1., 1.);
    float rx = in_cp.x;
    float ry = in_cp.y;
    float phi = in_cp.z;
    vec4 params =
        endPointsToParameterization(startPos.xy, endPos.xy, flags, rx, ry, phi);

    v_arcCenter = params.xy;
    startVec = calculateTangentVecOfEllipse(v_arcCenter, rx, ry, flags.y, phi,
                                            startPos.xy);
    endVec = calculateTangentVecOfEllipse(v_arcCenter, rx, ry, flags.y, phi,
                                          endPos.xy);
  } else if (in_type == 3.) {
    startVec = normalize(in_cp.xy - startPos.xy);
    endVec = normalize(endPos.xy - in_cp.zw);
  }

  vec2 v1 = getMitterVec(prevDir, startVec) * u_lineWidth / 2.;
  vec2 v2 = getMitterVec(endVec, nextDir) * u_lineWidth / 2.;
  vec2 dir = normalize(endPos.xy - startPos.xy);
  vec2 startOffset =
      (v1 == vec2(0., 0.) ? -u_lineWidth / 2. : dot(v1, dir)) * dir;
  vec2 endOffset = (v2 == vec2(0., 0.) ? u_lineWidth / 2. : dot(v2, dir)) * dir;
  float width = u_lineWidth;

  // TODO:
  // 曲线的width其实可以减半，有效率提升，但是逻辑会更加复杂，需要判断方向和调整transform
  if (in_type == 1.) {
    // curve, larger width
    // 考虑控制点，设定空间（会影响效率）
    startOffset =
        (min(0., dot(vec2(in_cp.xy - startPos.xy), dir)) - width / 2.) * dir;
    endOffset =
        (max(0., dot(vec2(in_cp.xy - endPos.xy), dir)) + width / 2.) * dir;
    width = u_lineWidth + 2. * distToLine(startPos.xy, endPos.xy, in_cp.xy);
  } else if (in_type == 2.) {
    // arc, larger width
    // TODO: 这里有半径的话，可以更小一点，四倍半径太粗暴了
    width = max(in_cp.x, in_cp.y) * 4.;
    startOffset = -width / 2. * dir;
    endOffset = width / 2. * dir;
  } else if (in_type == 3.) {
    // cubic curve, 计算包围盒
    vec4 bbox = bboxBezier(startPos.xy, in_cp.xy, in_cp.zw, endPos.xy);
    // TODO: 由于目前的transform比较死，所以大致模仿一下，后续重构
    width = distance(bbox.xy, bbox.zw);
    startOffset = -width * dir;
    endOffset = width * dir;
  }

  // TODO: 计算transform不能统一计算，可能还是要分情况，不然空间浪费太大
  mat3 transformMatrix = getTransformMatrix(startPos.xy + startOffset,
                                            endPos.xy + endOffset, width);
  vec2 pos = (transformMatrix * vec3(in_position, 1.)).xy;

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = pos.xy / u_Viewport;
  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;
  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1., -1.), 0., 1.);

  // gl_Position = vec4(in_position * vec2(200., 2.) / u_Viewport, 0., 1.);

  v_startPos = startPos.xy;
  v_endPos = endPos.xy;
  v_startMiterVec = v1;
  v_endMiterVec = v2;
  v_startVec = startVec;
  v_endVec = endVec;
  v_cp = in_cp;
  v_type = in_type;
  v_color = in_color;
}