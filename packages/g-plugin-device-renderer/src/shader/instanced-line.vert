#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.vert')
#pragma glslify: project = require('@antv/g-shader-components/project.vert')

layout(location = POSITION) in vec3 a_Position;
layout(location = POINTA) in vec3 a_PointA;
layout(location = POINTB) in vec3 a_PointB;
layout(location = CAP) in float a_Cap;
#ifdef USE_UV
  layout(location = UV) in vec2 a_Uv;
  out vec2 v_Uv;
#endif
layout(location = DASH) in vec4 a_Dash;

out vec4 v_Dash;
out vec2 v_Distance;

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.vert')
  #pragma glslify: import('@antv/g-shader-components/uv.vert')

  float strokeWidth;
  if (u_IsPicking > 0.5) {
    strokeWidth = u_IncreasedLineWidthForHitTesting + u_StrokeWidth;
  } else {
    strokeWidth = u_StrokeWidth;
  }
  float clampedStrokeWidth = max(strokeWidth, 1.0);

  bool isSizeAttenuation = a_Dash.w > 0.5;
  if (isSizeAttenuation) {
    vec4 clip0 = project(vec4(a_PointA, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);
    vec4 clip1 = project(vec4(a_PointB, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);
    // screen space
    vec2 screen0 = u_Viewport * (0.5 * clip0.xy / clip0.w + 0.5);
    vec2 screen1 = u_Viewport * (0.5 * clip1.xy / clip1.w + 0.5);
    vec2 xBasis = normalize(screen1 - screen0);
    vec2 yBasis = vec2(-xBasis.y, xBasis.x);
    vec2 pt0 = screen0 + clampedStrokeWidth * (a_Position.x * xBasis + a_Position.y * yBasis);
    vec2 pt1 = screen1 + clampedStrokeWidth * (a_Position.x * xBasis + a_Position.y * yBasis);
    vec2 pt = mix(pt0, pt1, a_Position.z);
    vec4 clip = mix(clip0, clip1, a_Position.z);
    gl_Position = vec4(clip.w * (2.0 * pt / u_Viewport - 1.0), clip.z, clip.w);
  } else {
    vec2 xBasis = a_PointB.xy - a_PointA.xy;
    vec2 yBasis = normalize(vec2(-xBasis.y, xBasis.x));

    vec2 point = a_PointA.xy + xBasis * a_Position.x + yBasis * clampedStrokeWidth * a_Position.y;
    point = point - u_Anchor.xy * abs(xBasis);

    // round & square
    if (a_Cap > 1.0) {
      point += sign(a_Position.x - 0.5) * normalize(xBasis) * vec2(clampedStrokeWidth / 2.0);
    }
    gl_Position = project(vec4(point, u_ZIndex, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);
  }

  float antialiasblur = 1.0 / strokeWidth;
  v_Distance = vec2(a_Position.y * 2.0, antialiasblur);
  v_Dash = vec4(a_Position.x, a_Dash.xyz);
}