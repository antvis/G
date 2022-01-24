#pragma glslify: import('@antv/g-shader-components/common.glsl')
#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/material.phong.glsl')
#pragma glslify: import('@antv/g-shader-components/light.both.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.vert')
#pragma glslify: project = require('@antv/g-shader-components/project.vert')

layout(location = POSITION) attribute vec3 a_Position;
layout(location = NORMAL) attribute vec3 a_Normal;

#ifdef USE_UV
  layout(location = UV) attribute vec2 a_Uv;
  varying vec2 v_Uv;
#endif

#ifdef USE_WIREFRAME
  layout(location = BARYCENTRIC) attribute vec3 a_Barycentric;
  varying vec3 v_Barycentric;
#endif

varying vec3 v_ViewPosition;
varying vec3 v_Normal;

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