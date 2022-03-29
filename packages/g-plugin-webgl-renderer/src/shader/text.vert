#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/text.both.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.vert')
#pragma glslify: project = require('@antv/g-shader-components/project.vert')

layout(location = TEX) in vec2 a_Tex;
layout(location = OFFSET) in vec2 a_Offset;

out vec2 v_UV;
out float v_GammaScale;

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.vert')

  v_UV = a_Tex / u_SDFMapSize;

  float fontScale = u_FontSize / 24.;

  gl_Position = project(vec4(a_Offset * fontScale, u_ZIndex, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);
  v_GammaScale = gl_Position.w;

  setPickingColor(a_PickingColor.xyz);
}