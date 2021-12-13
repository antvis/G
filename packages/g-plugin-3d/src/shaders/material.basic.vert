#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/batch.declaration.vert')
#pragma glslify: project = require('@antv/g-shader-components/project.vert')

layout(location = 10) attribute vec3 a_Position;
layout(location = 11) attribute vec3 a_Normal;

#ifdef USE_UV
  layout(location = 12) attribute vec2 a_Uv;
  varying vec2 v_Uv;
#endif

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.vert')

  gl_Position = project(vec4(a_Position, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);

  #pragma glslify: import('@antv/g-shader-components/uv.vert')
}