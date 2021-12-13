#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.vert')
#pragma glslify: project = require('@antv/g-shader-components/project.vert')

layout(location = 10) attribute vec2 a_Position;
layout(location = 11) attribute vec2 a_PointA;
layout(location = 12) attribute vec2 a_PointB;
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

  vec2 xBasis = a_PointB - a_PointA;
  vec2 yBasis = normalize(vec2(-xBasis.y, xBasis.x));
  // v_Normal = normalize(yBasis) * sign(a_Position.x - 0.5);

  vec2 point = a_PointA + xBasis * a_Position.x + yBasis * u_StrokeWidth * a_Position.y;
  point = point - a_Anchor.xy * abs(xBasis);

  // round & square
  if (a_Cap > 1.0) {
    point += sign(a_Position.x - 0.5) * normalize(xBasis) * vec2(u_StrokeWidth / 2.0);
  }

  gl_Position = project(vec4(point, 0.0, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);

  v_Dash = vec4(a_Position.x, a_Dash);
}