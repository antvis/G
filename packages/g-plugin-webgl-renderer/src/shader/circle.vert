#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.vert')
#pragma glslify: project = require('@antv/g-shader-components/project.vert')

layout(location = 10) attribute vec2 a_Extrude;
layout(location = 11) attribute vec4 a_StylePacked3;
layout(location = 12) attribute vec2 a_Size;
#ifdef USE_UV
  layout(location = 13) attribute vec2 a_Uv;
  varying vec2 v_Uv;
#endif

varying vec4 v_Data;
varying vec2 v_Radius;
varying vec4 v_StylePacked3;

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.vert')
  #pragma glslify: import('@antv/g-shader-components/uv.vert')

  float antialiasblur = 1.0 / (a_Size.x + u_StrokeWidth);

  vec2 offset = (a_Extrude + vec2(1.0) - 2.0 * a_Anchor.xy) * a_Size;

  int shape = int(floor(a_StylePacked3.x + 0.5));
  if (shape == 2) {
    offset = offset - vec2(u_StrokeWidth / 2.0);
  }

  gl_Position = project(vec4(offset, -u_ZIndex, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);
  
  v_Radius = a_Size;
  v_Data = vec4(a_Extrude, antialiasblur, a_StylePacked3.x);
  v_StylePacked3 = a_StylePacked3;
}