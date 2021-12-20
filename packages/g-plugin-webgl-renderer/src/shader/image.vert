#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/batch.declaration.vert')
#pragma glslify: project = require('@antv/g-shader-components/project.vert')

layout(location = 10) attribute vec2 a_Size;

#ifdef USE_UV
  layout(location = 11) attribute vec2 a_Uv;
  varying vec2 v_Uv;
#endif

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.vert')

  vec2 offset = (a_Uv - a_Anchor.xy) * a_Size;

  gl_Position = project(vec4(offset, u_ZIndex, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);

  #pragma glslify: import('@antv/g-shader-components/uv.vert')
}