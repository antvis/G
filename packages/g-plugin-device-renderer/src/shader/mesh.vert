#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.vert')
#pragma glslify: project = require('@antv/g-shader-components/project.vert')

layout(location = POSITION) in vec2 a_Position;
#ifdef USE_UV
  layout(location = UV) in vec2 a_Uv;
  out vec2 v_Uv;
#endif

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.vert')
  #pragma glslify: import('@antv/g-shader-components/uv.vert')

  gl_Position = project(vec4(a_Position, u_ZIndex, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);
}