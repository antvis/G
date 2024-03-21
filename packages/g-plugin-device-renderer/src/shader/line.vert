#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.vert')
#pragma glslify: project = require('@antv/g-shader-components/project.vert')
#pragma glslify: billboard = require('@antv/g-shader-components/billboard.vert')

layout(location = PREV) in vec3 a_Prev;
layout(location = POINT1) in vec3 a_Point1;
layout(location = POINT2) in vec3 a_Point2;
layout(location = NEXT) in vec3 a_Next;
layout(location = VERTEX_JOINT) in float a_VertexJoint;
layout(location = VERTEX_NUM) in float a_VertexNum;
layout(location = TRAVEL) in float a_Travel;
#ifdef USE_UV
  layout(location = UV) in vec2 a_Uv;
  out vec2 v_Uv;
#endif
layout(location = DASH) in vec4 a_Dash;
out vec4 v_Dash;

const float FILL = 1.0;
const float BEVEL = 4.0;
const float MITER = 8.0;
const float ROUND = 12.0;
const float JOINT_CAP_BUTT = 16.0;
const float JOINT_CAP_SQUARE = 18.0;
const float JOINT_CAP_ROUND = 20.0;
const float FILL_EXPAND = 24.0;
const float CAP_BUTT = 1.0;
const float CAP_SQUARE = 2.0;
const float CAP_ROUND = 3.0;
const float CAP_BUTT2 = 4.0;

const float u_Expand = 1.0;
const float u_MiterLimit = 5.0;
const float u_ScaleMode = 1.0;
const float u_Alignment = 0.5;

out vec4 v_Distance;
out vec4 v_Arc;
out float v_Type;
out float v_Travel;
out float v_ScalingFactor;

vec2 doBisect(
  vec2 norm, float len, vec2 norm2, float len2, float dy, float inner
) {
  vec2 bisect = (norm + norm2) / 2.0;
  bisect /= dot(norm, bisect);
  vec2 shift = dy * bisect;
  if (inner > 0.5) {
    if (len < len2) {
      if (abs(dy * (bisect.x * norm.y - bisect.y * norm.x)) > len) {
        return dy * norm;
      }
    } else {
      if (abs(dy * (bisect.x * norm2.y - bisect.y * norm2.x)) > len2) {
        return dy * norm;
      }
    }
  }
  return dy * bisect;
}

vec2 clip2ScreenSpace(vec4 clip) {
  return u_Viewport * (0.5 * clip.xy / clip.w + 0.5);
}

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.vert')
  #pragma glslify: import('@antv/g-shader-components/uv.vert')

  v_Dash = a_Dash;

  vec2 pointA;
  vec2 pointB;
  vec4 clip0;
  vec4 clip1;

  float compressed = a_Dash.w;
  float is_billboard = floor(compressed / 4.0);
  compressed -= is_billboard * 4.0;
  float is_size_attenuation = floor(compressed / 2.0);
  compressed -= is_size_attenuation * 2.0;
  float is_3d_polyline = compressed;

  bool isBillboard = is_billboard > 0.5;
  bool isSizeAttenuation = is_size_attenuation > 0.5;
  bool is3DPolyline = is_3d_polyline > 0.5;
  if (isBillboard) {
    clip0 = billboard(a_Point1.xy, 0.0, isSizeAttenuation, u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix, vec3(0.0));
    clip1 = billboard(a_Point2.xy, 0.0, isSizeAttenuation, u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix, vec3(0.0));
  } else if (is3DPolyline) {
    clip0 = project(vec4(a_Point1, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);
    clip1 = project(vec4(a_Point2, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);
  }

  if (isBillboard || is3DPolyline) {
    pointA = clip2ScreenSpace(clip0);
    pointB = clip2ScreenSpace(clip1);
  } else {
    pointA = (u_ModelMatrix * vec4(a_Point1, 1.0)).xy;
    pointB = (u_ModelMatrix * vec4(a_Point2, 1.0)).xy;
  }

  vec2 xBasis = pointB - pointA;
  float len = length(xBasis);
  vec2 forward = xBasis / len;
  vec2 norm = vec2(forward.y, -forward.x);

  float type = a_VertexJoint;

  float lineWidth;
  if (u_IsPicking > 0.5) {
    lineWidth = u_IncreasedLineWidthForHitTesting + u_StrokeWidth;
  } else {
    lineWidth = u_StrokeWidth;
  }

  if (u_ScaleMode > 2.5) {
    lineWidth *= length(u_ModelMatrix * vec4(1.0, 0.0, 0.0, 0.0));
  } else if (u_ScaleMode > 1.5) {
    lineWidth *= length(u_ModelMatrix * vec4(0.0, 1.0, 0.0, 0.0));
  } else if (u_ScaleMode > 0.5) {
    vec2 avgDiag = (u_ModelMatrix * vec4(1.0, 1.0, 0.0, 0.0)).xy;
    lineWidth *= sqrt(dot(avgDiag, avgDiag) * 0.5);
  }
  float capType = floor(type / 32.0);
  type -= capType * 32.0;
  v_Arc = vec4(0.0);
  lineWidth *= 0.5;
  float lineAlignment = 2.0 * u_Alignment - 1.0;

  vec2 pos;

  if (capType == CAP_ROUND) {
    if (a_VertexNum < 3.5) {
      gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
      return;
    }
    type = JOINT_CAP_ROUND;
    capType = 0.0;
  }

  if (type >= BEVEL) {
    float dy = lineWidth + u_Expand;
    float inner = 0.0;
    if (a_VertexNum >= 1.5) {
      dy = -dy;
      inner = 1.0;
    }

    vec2 base, next, xBasis2, bisect;
    float flag = 0.0;
    float sign2 = 1.0;
    if (a_VertexNum < 0.5 || a_VertexNum > 2.5 && a_VertexNum < 3.5) {
      if (isBillboard) {
        next = clip2ScreenSpace(billboard(a_Prev.xy, 0.0, isSizeAttenuation, u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix, vec3(0.0)));
      } else if (is3DPolyline) {
        next = clip2ScreenSpace(project(vec4(a_Prev, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix));
      } else {
        next = (u_ModelMatrix * vec4(a_Prev, 1.0)).xy;
      }

      base = pointA;
      flag = type - floor(type / 2.0) * 2.0;
      sign2 = -1.0;
    } else {
      if (isBillboard) {
        next = clip2ScreenSpace(billboard(a_Next.xy, 0.0, isSizeAttenuation, u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix, vec3(0.0)));
      } else if (is3DPolyline) {
        next = clip2ScreenSpace(project(vec4(a_Next, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix));
      } else {
        next = (u_ModelMatrix * vec4(a_Next, 1.0)).xy;
      }
      
      base = pointB;
      if (type >= MITER && type < MITER + 3.5) {
        flag = step(MITER + 1.5, type);
        // check miter limit here?
      }
    }
    xBasis2 = next - base;
    float len2 = length(xBasis2);
    vec2 norm2 = vec2(xBasis2.y, -xBasis2.x) / len2;
    float D = norm.x * norm2.y - norm.y * norm2.x;
    if (D < 0.0) {
      inner = 1.0 - inner;
    }
    norm2 *= sign2;

    if (abs(lineAlignment) > 0.01) {
      float shift = lineWidth * lineAlignment;
      pointA += norm * shift;
      pointB += norm * shift;
      if (abs(D) < 0.01) {
        base += norm * shift;
      } else {
        base += doBisect(norm, len, norm2, len2, shift, 0.0);
      }
    }

    float collinear = step(0.0, dot(norm, norm2));
    v_Type = 0.0;
    float dy2 = -1000.0;
    float dy3 = -1000.0;
    if (abs(D) < 0.01 && collinear < 0.5) {
      if (type >= ROUND && type < ROUND + 1.5) {
        type = JOINT_CAP_ROUND;
      }
      // TODO: BUTT here too
    }

    if (a_VertexNum < 3.5) {
      if (abs(D) < 0.01) {
        pos = dy * norm;
      } else {
        if (flag < 0.5 && inner < 0.5) {
          pos = dy * norm;
        } else {
          pos = doBisect(norm, len, norm2, len2, dy, inner);
        }
      }
      if (capType >= CAP_BUTT && capType < CAP_ROUND) {
        float extra = step(CAP_SQUARE, capType) * lineWidth;
        vec2 back = -forward;
        if (a_VertexNum < 0.5 || a_VertexNum > 2.5) {
          pos += back * (u_Expand + extra);
          dy2 = u_Expand;
        } else {
          dy2 = dot(pos + base - pointA, back) - extra;
        }
      }
      if (type >= JOINT_CAP_BUTT && type < JOINT_CAP_SQUARE + 0.5) {
        float extra = step(JOINT_CAP_SQUARE, type) * lineWidth;
        if (a_VertexNum < 0.5 || a_VertexNum > 2.5) {
          dy3 = dot(pos + base - pointB, forward) - extra;
        } else {
          pos += forward * (u_Expand + extra);
          dy3 = u_Expand;
          if (capType >= CAP_BUTT) {
            dy2 -= u_Expand + extra;
          }
        }
      }
    } else if (type >= JOINT_CAP_ROUND && type < JOINT_CAP_ROUND + 1.5) {
      if (inner > 0.5) {
        dy = -dy;
        inner = 0.0;
      }
      vec2 d2 = abs(dy) * forward;
      if (a_VertexNum < 4.5) {
        dy = -dy;
        pos = dy * norm;
      } else if (a_VertexNum < 5.5) {
        pos = dy * norm;
      } else if (a_VertexNum < 6.5) {
        pos = dy * norm + d2;
        v_Arc.x = abs(dy);
      } else {
        dy = -dy;
        pos = dy * norm + d2;
        v_Arc.x = abs(dy);
      }
      dy2 = 0.0;
      v_Arc.y = dy;
      v_Arc.z = 0.0;
      v_Arc.w = lineWidth;
      v_Type = 3.0;
    } else if (abs(D) < 0.01) {
      pos = dy * norm;
    } else {
      if (type >= ROUND && type < ROUND + 1.5) {
        if (inner > 0.5) {
          dy = -dy;
          inner = 0.0;
        }
        if (a_VertexNum < 4.5) {
          pos = doBisect(norm, len, norm2, len2, -dy, 1.0);
        } else if (a_VertexNum < 5.5) {
          pos = dy * norm;
        } else if (a_VertexNum > 7.5) {
          pos = dy * norm2;
        } else {
          pos = doBisect(norm, len, norm2, len2, dy, 0.0);
          float d2 = abs(dy);
          if (length(pos) > abs(dy) * 1.5) {
            if (a_VertexNum < 6.5) {
              pos.x = dy * norm.x - d2 * norm.y;
              pos.y = dy * norm.y + d2 * norm.x;
            } else {
              pos.x = dy * norm2.x + d2 * norm2.y;
              pos.y = dy * norm2.y - d2 * norm2.x;
            }
          }
        }
        vec2 norm3 = normalize(norm + norm2);
        float sign = step(0.0, dy) * 2.0 - 1.0;
        v_Arc.x = sign * dot(pos, norm3);
        v_Arc.y = pos.x * norm3.y - pos.y * norm3.x;
        v_Arc.z = dot(norm, norm3) * lineWidth;
        v_Arc.w = lineWidth;
        dy = -sign * dot(pos, norm);
        dy2 = -sign * dot(pos, norm2);
        dy3 = v_Arc.z - v_Arc.x;
        v_Type = 3.0;
      } else {
        float hit = 0.0;
        if (type >= BEVEL && type < BEVEL + 1.5) {
          if (dot(norm, norm2) > 0.0) {
            type = MITER;
          }
        }
        if (type >= MITER && type < MITER + 3.5) {
          if (inner > 0.5) {
            dy = -dy;
            inner = 0.0;
          }
          float sign = step(0.0, dy) * 2.0 - 1.0;
          pos = doBisect(norm, len, norm2, len2, dy, 0.0);
          if (length(pos) > abs(dy) * u_MiterLimit) {
            type = BEVEL;
          } else {
            if (a_VertexNum < 4.5) {
              dy = -dy;
              pos = doBisect(norm, len, norm2, len2, dy, 1.0);
            } else if (a_VertexNum < 5.5) {
              pos = dy * norm;
            } else if (a_VertexNum > 6.5) {
              pos = dy * norm2;
            }
            v_Type = 1.0;
            dy = -sign * dot(pos, norm);
            dy2 = -sign * dot(pos, norm2);
            hit = 1.0;
          }
        }
        if (type >= BEVEL && type < BEVEL + 1.5) {
          if (inner > 0.5) {
            dy = -dy;
            inner = 0.0;
          }
          float d2 = abs(dy);
          vec2 pos3 = vec2(dy * norm.x - d2 * norm.y, dy * norm.y + d2 * norm.x);
          vec2 pos4 = vec2(dy * norm2.x + d2 * norm2.y, dy * norm2.y - d2 * norm2.x);
          if (a_VertexNum < 4.5) {
            pos = doBisect(norm, len, norm2, len2, -dy, 1.0);
          } else if (a_VertexNum < 5.5) {
            pos = dy * norm;
          } else if (a_VertexNum > 7.5) {
            pos = dy * norm2;
          } else {
            if (a_VertexNum < 6.5) {
              pos = pos3;
            } else {
              pos = pos4;
            }
          }
          vec2 norm3 = normalize(norm + norm2);
          float sign = step(0.0, dy) * 2.0 - 1.0;
          dy = -sign * dot(pos, norm);
          dy2 = -sign * dot(pos, norm2);
          dy3 = (-sign * dot(pos, norm3)) + lineWidth;
          v_Type = 4.0;
          hit = 1.0;
        }
        if (hit < 0.5) {
          gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
          return;
        }
      }
    }
    pos += base;
    v_Distance = vec4(dy, dy2, dy3, lineWidth) * u_DevicePixelRatio;
    v_Arc = v_Arc * u_DevicePixelRatio;
    v_Travel = a_Travel + dot(pos - pointA, vec2(-norm.y, norm.x));
  }

  v_ScalingFactor = sqrt(u_ModelMatrix[0][0] * u_ModelMatrix[0][0] + u_ModelMatrix[0][1] * u_ModelMatrix[0][1] + u_ModelMatrix[0][2] * u_ModelMatrix[0][2]);

  if (isBillboard || is3DPolyline) {
    vec4 clip = mix(clip0, clip1, 0.5);
    gl_Position = vec4(clip.w * (2.0 * pos / u_Viewport - 1.0), clip.z, clip.w);
  } else {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * vec4(pos, u_ZIndex, 1.0);
  }
}