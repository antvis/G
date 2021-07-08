varying vec2 v_startPos;
varying vec2 v_endPos;
varying vec2 v_startMiterVec;
varying vec2 v_endMiterVec;
varying vec2 v_startVec;
varying vec2 v_endVec;
varying vec4 v_cp;
varying float v_type;
varying vec4 v_color;
varying vec2 v_arcCenter;

#define PI 3.14159265359

uniform float u_lineJoin; // 0: miter; 1: round; 2: bevel;
uniform float u_lineCap;  // 0: none; 1: butt; 2: round;
uniform float u_lineWidth;

// cubic bezier distance
// https://www.shadertoy.com/view/stjGDd

float length2(in vec2 v) { return dot(v, v); }

float sdSegmentSq(in vec2 p, in vec2 a, in vec2 b) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length2(pa - ba * h);
}

float sdSegment(in vec2 p, in vec2 a, in vec2 b) {
  return sqrt(sdSegmentSq(p, a, b));
}

// slow, do not use in production. Can probably do better than
// tesselation in linear segments.
// TODO: 这里采用了分段，找最近的点近似作为投影到曲线上的点，后续考虑二分查找
vec2 udCubicBezier(vec2 p0, vec2 p1, vec2 p2, in vec2 p3, vec2 pos) {
  const int kNum = 50;
  vec2 res = vec2(1e10, 0.0);
  vec2 a = p0;
  for (int i = 1; i < kNum; i++) {
    float t = float(i) / float(kNum - 1);
    float s = 1.0 - t;
    vec2 b = p0 * s * s * s + p1 * 3.0 * s * s * t + p2 * 3.0 * s * t * t +
             p3 * t * t * t;
    float d = sdSegmentSq(pos, a, b);
    if (d < res.x)
      res = vec2(d, t);
    a = b;
  }

  return vec2(sqrt(res.x), res.y);
}

// reference paper: http://hhoppe.com/ravg.pdf
// distance vector to origin(0, 0)
float det(vec2 a, vec2 b) { return a.x * b.y - b.x * a.y; }

vec2 get_distance_vector(vec2 b0, vec2 b1, vec2 b2) {
  float a = det(b0, b2), b = 2.0 * det(b1, b0), d = 2.0 * det(b2, b1);
  float f = b * d - a * a;
  vec2 d21 = b2 - b1, d10 = b1 - b0, d20 = b2 - b0;
  vec2 gf = 2.0 * (b * d21 + d * d10 + a * d20);
  gf = vec2(gf.y, -gf.x);
  vec2 pp = -f * gf / dot(gf, gf);
  vec2 d0p = b0 - pp;
  float ap = det(d0p, d20), bp = 2.0 * det(d10, d0p);
  float t = clamp((ap + bp) / (2.0 * a + b + d), 0.0, 1.0);
  return mix(mix(b0, b1, t), mix(b1, b2, t), t);
}

float msign(in float x) { return (x < 0.0) ? -1.0 : 1.0; }

float sdEllipse(vec2 p, in vec2 ab) {
  // if( ab.x==ab.y ) return length(p)-ab.x;

  p = abs(p);
  if (p.x > p.y) {
    p = p.yx;
    ab = ab.yx;
  }

  float l = ab.y * ab.y - ab.x * ab.x;

  float m = ab.x * p.x / l;
  float n = ab.y * p.y / l;
  float m2 = m * m;
  float n2 = n * n;

  float c = (m2 + n2 - 1.0) / 3.0;
  float c3 = c * c * c;

  float d = c3 + m2 * n2;
  float q = d + m2 * n2;
  float g = m + m * n2;

  float co;

  if (d < 0.0) {
    float h = acos(q / c3) / 3.0;
    float s = cos(h) + 2.0;
    float t = sin(h) * sqrt(3.0);
    float rx = sqrt(m2 - c * (s + t));
    float ry = sqrt(m2 - c * (s - t));
    co = ry + sign(l) * rx + abs(g) / (rx * ry);
  } else {
    float h = 2.0 * m * n * sqrt(d);
    float s = msign(q + h) * pow(abs(q + h), 1.0 / 3.0);
    float t = msign(q - h) * pow(abs(q - h), 1.0 / 3.0);
    float rx = -(s + t) - c * 4.0 + 2.0 * m2;
    float ry = (s - t) * sqrt(3.0);
    float rm = sqrt(rx * rx + ry * ry);
    co = ry / sqrt(rm - rx) + 2.0 * g / rm;
  }
  co = (co - m) / 2.0;

  float si = sqrt(max(1.0 - co * co, 0.0));

  vec2 r = ab * vec2(co, si);

  return length(r - p) * msign(p.y - r.y);
}

float distToQuadraticBezierCurve(vec2 p, vec2 b0, vec2 b1, vec2 b2) {
  return length(get_distance_vector(b0 - p, b1 - p, b2 - p));
}

void main() {
  float inMainPath = 0.;
  float inLineCap = 0.;
  float inLineJoin = 0.;

  vec2 p = gl_FragCoord.xy;
  vec4 pathColor = v_color;
  float halfWidth = u_lineWidth / 2.;

  // 到两个端点的向量
  vec2 pa = (p - v_startPos);
  vec2 pb = (p - v_endPos);

  // 两个端点的切线向量，向内，所以反转一下endVec
  vec2 startVec = v_startVec;
  vec2 endVec = -v_endVec;

  vec2 startVecNormal = vec2(-startVec.y, startVec.x);
  vec2 endVecNormal = vec2(-endVec.y, endVec.x);

  // 是否在端点的延伸区域，用于lineCap和lineJoin的实现
  // 每个形状的计算不同，但是计算lineCap和lineJoin的逻辑相同
  bool inStartEndArea = false;
  bool inEndEndArea = false;

  // 计算端点区域
  float distA = dot(pa, startVec);
  float distB = dot(pb, endVec);

  inStartEndArea = distA < 0. && distA > -halfWidth &&
                   abs(dot(pa, startVecNormal)) < halfWidth;
  inEndEndArea = distB < 0. && distB > -halfWidth &&
                 abs(dot(pb, endVecNormal)) < halfWidth;

  // 考虑mainPath
  if (v_type == 0.) {
    vec2 lineVec = v_endPos - v_startPos;
    bool inStartMainLine = dot(pa, lineVec) >= 0.;
    bool inEndMainLine = dot(pb, -lineVec) >= 0.;

    inMainPath = (inStartMainLine && inEndMainLine) ? 1. : 0.;

  } else if (v_type == 1.) {
    bool endArea = inStartEndArea || inEndEndArea;

    float dist = distToQuadraticBezierCurve(p, v_startPos, v_cp.xy, v_endPos);
    if (!endArea && dist < halfWidth) {
      inMainPath = 1.;
    }
  } else if (v_type == 2.) {
    vec2 flags = vec2(floor(v_cp.w / 2.), mod(v_cp.w, 2.));
    float rx = v_cp.x;
    float ry = v_cp.y;
    float phi = v_cp.z;
    vec2 center = v_arcCenter;

    // TODO:
    // 这个判断是不对的，不是与切线正交，会有扇形的残余，后边写了个补救的方法，但是不够优雅
    // NOTE: 根据center和两个端点，可以剔除不需要的圆弧
    vec3 cross1 = cross(vec3(v_startPos - center, 0.), vec3(p - center, 0.));
    vec3 cross2 = cross(vec3(p - center, 0.), vec3(v_endPos - center, 0.));

    // 根据flag判断保留弧线的四种情况
    // fa=0, fs=0 --- cross1 < 0 && cross2 < 0
    // fa=0, fs=1 --- cross1 > 0 && cross2 > 0
    // fa=1, fs=0 --- !(cross1 < 0 && cross2 < 0)
    // fa=1, fs=1 --- !(cross1 > 0 && cross2 > 0)
    bool inArcFan =
        (flags == vec2(0., 0.) && (cross1.z < 0. && cross2.z < 0.) ||
         flags == vec2(0., 1.) && (cross1.z > 0. && cross2.z > 0.) ||
         flags == vec2(1., 0.) && !(cross1.z > 0. && cross2.z > 0.) ||
         flags == vec2(1., 1.) && !(cross1.z < 0. && cross2.z < 0.));

    // NOTE:
    // 又是极其不优雅的判断，为了解决之前根据圆心判断的问题，这个判断还是一种近似的方式，不够robust，但是目前没想到更好的方法
    bool inStartInnerEndArea =
        distA > 0. && abs(dot(pa, startVecNormal)) < halfWidth;
    bool inEndInnerEndArea =
        distB > 0. && abs(dot(pb, endVecNormal)) < halfWidth;

    // 在圆心扫过的arc里，但是端点的内外要特判，写法虽然可耻但有用
    inArcFan = !(inStartEndArea || inEndEndArea) &&
               (inArcFan || (inStartInnerEndArea || inEndInnerEndArea));

    mat2 rotateMat = mat2(cos(-phi), sin(-phi), -sin(-phi), cos(-phi));
    vec2 transformedPos = rotateMat * (p - center);
    float dist = abs(sdEllipse(transformedPos, vec2(rx, ry)));
    if (inArcFan && dist < halfWidth) {
      inMainPath = 1.;
    }
  } else if (v_type == 3.) {
    // cubic
    vec2 res = udCubicBezier(v_startPos, v_cp.xy, v_cp.zw, v_endPos, p);
    float dist = res.x;

    bool endArea = inStartEndArea || inEndEndArea;

    if (!endArea && dist < halfWidth) {
      inMainPath = 1.;
    }
  }

  if (v_startMiterVec == vec2(0., 0.)) {
    // 端点，考虑lineCap
    if (inStartEndArea) {
      if (u_lineCap == 1.) {
        // butt
        inLineCap = 1.;
      } else if (u_lineCap == 2.) {
        // round
        if (distance(p, v_startPos) < u_lineWidth / 2.) {
          inLineCap = 1.;
        }
      }
    }
  } else {
    // 考虑lineJoin
    vec2 startMiterNormal = vec2(-v_startMiterVec.y, v_startMiterVec.x);
    bool insideStartMiter = dot((p - v_startPos), startMiterNormal) > 0.;

    // 在有lineJoin的情况下，需要切除Join部分mainPath的重叠区域，这个影响了mainPath，需要discard

    // NOTE: magic number
    // 因为曲线的关系，线过宽的时候，投影长度会超过halfWidth，要多一点点，之所以判断投影小于halfWidth是为了该判断不影响曲线端点的其它部分，目前没有想到更好的判断方案
    // 我太难了55
    float discardThreshold = 1.1 * halfWidth;
    if (abs(dot(pa, startVecNormal)) < discardThreshold && !insideStartMiter) {
      discard;
    }

    if (inStartEndArea) {
      if (u_lineJoin == 0.) {
        // miter
        if (insideStartMiter) {
          inLineJoin = 1.;
        }
      } else if (u_lineJoin == 1.) {
        // round
        if (distance(p, v_startPos) < halfWidth) {
          inLineJoin = 1.;
        }
      } else if (u_lineJoin == 2.) {
        // bevel
        vec2 startBevelCenter =
            v_startPos + abs(dot(startVecNormal, normalize(v_startMiterVec))) *
                             halfWidth * normalize(v_startMiterVec);
        if (dot((p - startBevelCenter), (v_startPos - startBevelCenter)) > 0.) {
          inLineJoin = 1.;
        }
      }
    }
  }

  if (v_endMiterVec == vec2(0., 0.)) {
    // 端点，考虑lineCap
    if (inEndEndArea) {
      if (u_lineCap == 1.) {
        // butt
        inLineCap = 1.;
      } else if (u_lineCap == 2.) {
        // round
        if (distance(p, v_endPos) < u_lineWidth / 2.) {
          inLineCap = 1.;
        }
      }
    }
  } else {
    // 考虑lineJoin
    vec2 endMiterNormal = vec2(-v_endMiterVec.y, v_endMiterVec.x);
    bool insideEndMiter = dot((p - v_endPos), endMiterNormal) < 0.;

    // 在有lineJoin的情况下，需要切除Join部分mainPath的重叠区域，这个影响了mainPath，需要discard

    // NOTE: magic number
    // 因为曲线的关系，线过宽的时候，投影长度会超过halfWidth，要多一点点，之所以判断投影小于halfWidth是为了该判断不影响曲线端点的其它部分，目前没有想到更好的判断方案
    // 我太难了55
    float discardThreshold = 1.1 * halfWidth;
    if (abs(dot(pb, endVecNormal)) < discardThreshold && !insideEndMiter) {
      discard;
    }

    if (inEndEndArea) {
      if (u_lineJoin == 0.) {
        // miter
        if (insideEndMiter) {
          inLineJoin = 1.;
        }
      } else if (u_lineJoin == 1.) {
        // round
        if (distance(p, v_endPos) < halfWidth) {
          inLineJoin = 1.;
        }
      } else if (u_lineJoin == 2.) {
        // bevel
        vec2 endBevelCenter =
            v_endPos + abs(dot(endVecNormal, normalize(v_endMiterVec))) *
                           u_lineWidth / 2. * normalize(v_endMiterVec);
        if (dot((p - endBevelCenter), (v_endPos - endBevelCenter)) > 0.) {
          inLineJoin = 1.;
        }
      }
    }
  }

  gl_FragColor = v_color;


  // if ((inMainPath + inLineJoin + inLineCap) > 0.) {
  //   gl_FragColor = v_color;
  // } else {
  //   discard;
  // }
}