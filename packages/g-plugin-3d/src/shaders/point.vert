#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/point.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.vert')
#pragma glslify: project = require('@antv/g-shader-components/project.vert')

layout(location = POSITION) in vec3 a_Position;

#ifdef USE_UV
  layout(location = UV) in vec2 a_Uv;
  out vec2 v_Uv;
#endif

#ifdef USE_WIREFRAME
  layout(location = BARYCENTRIC) in vec3 a_Barycentric;
  out vec3 v_Barycentric;
#endif

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.vert')

  gl_PointSize = u_Size;
  gl_Position = project(vec4(a_Position, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);

  #pragma glslify: import('@antv/g-shader-components/uv.vert')
  #pragma glslify: import('@antv/g-shader-components/wireframe.vert')
}