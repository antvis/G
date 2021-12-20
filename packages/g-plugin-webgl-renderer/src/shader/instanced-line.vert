#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.vert')
#pragma glslify: project = require('@antv/g-shader-components/project.vert')

layout(location = 10) attribute vec3 a_Position;
layout(location = 11) attribute vec3 a_PointA;
layout(location = 12) attribute vec3 a_PointB;
layout(location = 13) attribute float a_Cap;
#ifdef USE_UV
  layout(location = 14) attribute vec2 a_Uv;
  varying vec2 v_Uv;
#endif
layout(location = 15) attribute vec3 a_Dash;

varying vec4 v_Dash;
// varying vec2 v_Normal;

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.vert')
  #pragma glslify: import('@antv/g-shader-components/uv.vert')

  // vec2 xBasis = a_PointB.xy - a_PointA.xy;
  // vec2 yBasis = normalize(vec2(-xBasis.y, xBasis.x));

  // vec2 point = a_PointA.xy + xBasis * a_Position.x + yBasis * u_StrokeWidth * a_Position.y;
  // point = point - a_Anchor.xy * abs(xBasis);

  // // round & square
  // if (a_Cap > 1.0) {
  //   point += sign(a_Position.x - 0.5) * normalize(xBasis) * vec2(u_StrokeWidth / 2.0);
  // }

  // gl_Position = project(vec4(point, u_ZIndex, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);

  // clip space
  vec4 clip0 = project(vec4(a_PointA, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);
  vec4 clip1 = project(vec4(a_PointB, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);
  // screen space
  vec2 screen0 = u_Viewport * (0.5 * clip0.xy / clip0.w + 0.5);
  vec2 screen1 = u_Viewport * (0.5 * clip1.xy / clip1.w + 0.5);
  vec2 xBasis = normalize(screen1 - screen0);
  vec2 yBasis = vec2(-xBasis.y, xBasis.x);
  vec2 pt0 = screen0 + u_StrokeWidth * (a_Position.x * xBasis + a_Position.y * yBasis);
  vec2 pt1 = screen1 + u_StrokeWidth * (a_Position.x * xBasis + a_Position.y * yBasis);
  vec2 pt = mix(pt0, pt1, a_Position.z);
  vec4 clip = mix(clip0, clip1, a_Position.z);
  gl_Position = vec4(clip.w * (2.0 * pt / u_Viewport - 1.0), clip.z, clip.w);

  v_Dash = vec4(a_Position.x, a_Dash);
}