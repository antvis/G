#pragma glslify: import('@antv/g-shader-components/common.glsl')
#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/material.phong.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.vert')
#pragma glslify: project = require('@antv/g-shader-components/project.vert')

layout(location = POSITION) in vec3 a_Position;
layout(location = NORMAL) in vec3 a_Normal;

#ifdef USE_UV
  layout(location = UV) in vec2 a_Uv;
  out vec2 v_Uv;
#endif

#ifdef USE_WIREFRAME
  layout(location = BARYCENTRIC) in vec3 a_Barycentric;
  out vec3 v_Barycentric;
#endif

out vec3 v_ViewPosition;
out vec3 v_Normal;

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.vert')

  vec4 position = vec4(a_Position, 1.0);

  gl_Position = project(position, u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);

  vec4 mvPosition = u_ViewMatrix * u_ModelMatrix * position;
  v_ViewPosition = - mvPosition.xyz;

  // v_ViewPosition = vec3(mvPosition) / mvPosition.w;

  mat3 normalWorld = mat3(transposeMat3(inverseMat3(mat3(u_ViewMatrix * u_ModelMatrix))));
  v_Normal = normalize(normalWorld * a_Normal);

  #pragma glslify: import('@antv/g-shader-components/uv.vert')
  #pragma glslify: import('@antv/g-shader-components/wireframe.vert')
}