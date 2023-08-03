#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/batch.declaration.vert')

#pragma glslify: import('@antv/g-shader-components/text.both.glsl')
#pragma glslify: project = require('@antv/g-shader-components/project.vert')

layout(location = TEX) in vec2 a_Tex;
layout(location = OFFSET) in vec2 a_Offset;

out vec2 v_Uv;
out float v_GammaScale;

bool isPerspectiveMatrix(mat4 m) {
  return m[ 2 ][ 3 ] == - 1.0;
}

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.vert')

  v_Uv = a_Tex / u_SDFMapSize;
  float fontScale = u_FontSize / 24.;

  bool isBillboard = a_StylePacked2.y > 0.5;
  float sizeAttenuation = a_StylePacked2.z;
  vec2 bufferOffset = vec2(0.7, 2.0);
  vec2 offset = a_Offset * fontScale + bufferOffset;

  if (isBillboard) {
    float rotation =  a_StylePacked2.w;
    #pragma glslify: import('@antv/g-shader-components/billboard.vert')
    v_GammaScale = 1.0;
  } else {
    gl_Position = project(vec4((a_Offset) * fontScale + bufferOffset, u_ZIndex, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);
    v_GammaScale = gl_Position.w;
  }
}