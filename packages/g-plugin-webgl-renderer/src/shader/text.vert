#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/text.both.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.vert')
#pragma glslify: project = require('@antv/g-shader-components/project.vert')

layout(location = 10) attribute vec2 a_Tex;
layout(location = 11) attribute vec2 a_Offset;

varying vec2 v_UV;
varying float v_GammaScale;

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.vert')

  v_UV = a_Tex / u_SDFMapSize;

  float fontScale = u_FontSize / 24.;

  gl_Position = project(vec4(a_Offset * fontScale, -u_ZIndex, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);
  v_GammaScale = gl_Position.w;
}