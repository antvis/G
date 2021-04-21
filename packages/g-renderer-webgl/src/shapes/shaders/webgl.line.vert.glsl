attribute vec3 a_Pos;
attribute vec3 a_Prev;
attribute vec3 a_Next;
attribute vec3 a_Far;
attribute float a_Flags;
attribute vec3 a_StrokeColor;
attribute float a_StrokeOpacity;
attribute float a_StrokeWidth;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;
uniform vec2 u_Viewport;
uniform float u_MiterLimit : 10;
uniform float u_Antialiasing : 0;

varying vec4 v_StrokeColorVar;
varying vec4 v_Subpos;  /* px, py, length - px, width */
varying vec4 v_Info;  /* near mode, far mode, offset */
varying vec4 v_Angles; /* near angle cos, sin, far angle cos, sin */

#pragma include "instancing.declaration"
#pragma include "project.declaration"
#pragma include "picking"

float u_PixelWidth = 1.0 / u_Viewport.x;
float u_Aspect = u_Viewport.x / u_Viewport.y;
const float PI = 3.14159265358979323846264;

vec4 viewCoord(vec3 c) {
  #pragma include "instancing"

  vec4 result = u_ProjectionMatrix * u_ViewMatrix * modelMatrix * vec4(c.xyz, 1.0);
  if (result.w != 0.0) {
    result = result / result.w;
  }

  result.xy = project_to_clipspace(result.xy);
  return result;
}

float atan2(float y, float x) {
  if (x > 0.0)  return atan(y / x);
  if (x < 0.0 && y >= 0.0)  return atan(y / x) + PI;
  if (x < 0.0)  return atan(y / x) - PI;
  return sign(y) * 0.5 * PI;
}

void main() {
  /* If any vertex has been deliberately set to a negative opacity,
   * skip doing computations on it. */
  if (a_StrokeOpacity < 0.0) {
    gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
    return;
  }

  /* convert coordinates.  We have four values, since we need to
   * calculate the angles between the lines formed by prev-pos and
   * pos-next, and between pos-next and next-far, plus know the angle
   *   (prev)---(pos)---(next)---(far) => A---B---C---D */
  vec4 A = viewCoord(a_Prev);
  vec4 B = viewCoord(a_Pos);
  vec4 C = viewCoord(a_Next);
  vec4 D = viewCoord(a_Far);
  // calculate line segment vector and angle
  vec2 deltaCB = C.xy - B.xy;
  if (deltaCB == vec2(0.0, 0.0)) {
    gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
    return;
  }

  float angleCB = atan2(deltaCB.y, deltaCB.x * u_Aspect);
  v_StrokeColorVar = vec4(a_StrokeColor, a_StrokeOpacity);
  // extract values from our flags field
  int vertex = int(mod(a_Flags, 4.0));
  int nearMode = int(mod(floor(a_Flags / 4.0), 8.0));
  int farMode = int(mod(floor(a_Flags / 32.0), 8.0));
  // we use 11 bits of the flags for the offset, where -1023 to 1023
  // maps to -1 to 1.  The 11 bits are a signed value, so simply
  // selecting the bits will result in an unsigned values that may be
  // greater than 1, in which case we have to subtract appropriately.
  float offset = mod(floor(a_Flags / 256.0), 2048.0) / 1023.0;
  if (offset > 1.0) {
    offset -= 2048.0 / 1023.0;
  }
  // by default, offset by the width and don't extend lines.  Later,
  // calculate line extensions based on end cap and end join modes
  float yOffset = a_StrokeWidth + u_Antialiasing;
  if (vertex == 0 || vertex == 2) {
    yOffset *= -1.0;
  }
  yOffset += a_StrokeWidth * offset;
  float xOffset = 0.0;
  // end caps
  if (nearMode == 0) {
    xOffset = u_Antialiasing;
  } else if (nearMode == 1 || nearMode == 2) {
    xOffset = a_StrokeWidth + u_Antialiasing;
  }
  
  // If joining lines, calculate the angles in screen space formed by
  // the near end (A-B-C) and far end (B-C-D), and determine how much
  // space is needed for the particular join.
  //   This could be changed: if the lines are not a uniform width and
  // offset, then the functional join angle is not simply half the
  // angle between the two lines, but rather half the angle of the
  // inside edge of the the two lines.
  float cosABC = 1.0, sinABC = 0.0, cosBCD = 1.0, sinBCD = 0.0;  // of half angles
  // handle near end
  if (nearMode >= 4) {
    float angleBA = atan2(B.y - A.y, (B.x - A.x) * u_Aspect);
    if (A.xy == B.xy)  angleBA = angleCB;
    float angleABC = angleCB - angleBA;
    // ensure angle is in the range [-PI, PI], then take the half angle
    angleABC = (mod(angleABC + 3.0 * PI, 2.0 * PI) - PI) / 2.0;
    cosABC = cos(angleABC);  sinABC = sin(angleABC);
    // if this angle is close to flat, pass-through the join
    if (nearMode >= 4 && cosABC > 0.999999) {
      nearMode = 3;
    }
    // miter, miter-clip
    if (nearMode == 4 || nearMode == 7) {
      if (cosABC < 0.000001 || 1.0 / cosABC > u_MiterLimit) {
        if (nearMode == 4) {
          nearMode = 5;
        } else {
          xOffset = u_MiterLimit * a_StrokeWidth * (1.0 - offset * sign(sinABC)) + u_Antialiasing;
        }
      } else {
        // we add an extra 1.0 to the xOffset to make sure that fragment
        // shader is doing the clipping
        xOffset = abs(sinABC / cosABC) * a_StrokeWidth * (1.0 - offset * sign(sinABC)) + u_Antialiasing + 1.0;
        nearMode = 4;
      }
    }
    // bevel or round join
    if (nearMode == 5 || nearMode == 6) {
      xOffset = a_StrokeWidth * (1.0 - offset * sign(sinABC)) + u_Antialiasing;
    }
  }

  // handle far end
  if (farMode >= 4) {
    float angleDC = atan2(D.y - C.y, (D.x - C.x) * u_Aspect);
    if (D.xy == C.xy)  angleDC = angleCB;
    float angleBCD = angleDC - angleCB;
    // ensure angle is in the range [-PI, PI], then take the half angle
    angleBCD = (mod(angleBCD + 3.0 * PI, 2.0 * PI) - PI) / 2.0;
    cosBCD = cos(angleBCD);  sinBCD = sin(angleBCD);
    // if this angle is close to flat, pass-through the join
    if (farMode >= 4 && cosBCD > 0.999999) {
      farMode = 3;
    }
    // miter, miter-clip
    if (farMode == 4 || farMode == 7) {
      if (cosBCD < 0.000001 || 1.0 / cosBCD > u_MiterLimit) {
        if (farMode == 4)  farMode = 5;
      } else {
        farMode = 4;
      }
    }
  }

  // compute the location of a vertex to include everything that might
  // need to be rendered
  xOffset *= -1.0;
  gl_Position = vec4(
    B.x + (xOffset * cos(angleCB) - yOffset * sin(angleCB)) * u_PixelWidth,
    B.y + (xOffset * sin(angleCB) + yOffset * cos(angleCB)) * u_PixelWidth * u_Aspect,
    B.z, 1.0);
  // store other values needed to determine which pixels to plot.
  float lineLength = length(vec2(deltaCB.x, deltaCB.y / u_Aspect)) / u_PixelWidth;

  if (vertex == 0 || vertex == 1) {
    v_Subpos = vec4(xOffset, yOffset, lineLength - xOffset, a_StrokeWidth);
    v_Info = vec4(float(nearMode), float(farMode), offset, 0.0);
    v_Angles = vec4(cosABC, sinABC, cosBCD, sinBCD);
  } else {
    v_Subpos = vec4(lineLength - xOffset, -yOffset, xOffset, a_StrokeWidth);
    v_Info = vec4(float(farMode), float(nearMode), -offset, 0.0);
    v_Angles = vec4(cosBCD, -sinBCD, cosABC, -sinABC);
  }
}