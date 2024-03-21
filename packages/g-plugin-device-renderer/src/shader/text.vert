#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/batch.declaration.vert')

#pragma glslify: import('@antv/g-shader-components/text.both.glsl')
#pragma glslify: project = require('@antv/g-shader-components/project.vert')
#pragma glslify: billboard = require('@antv/g-shader-components/billboard.vert')

layout(location = POSITION) in vec3 a_Position;
layout(location = TEX) in vec2 a_Tex;
layout(location = OFFSET) in vec2 a_Offset;

out vec2 v_Uv;

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.vert')

  v_Uv = a_Tex / u_SDFMapSize;
  float fontScale = u_FontSize / 24.;

  vec2 bufferOffset = vec2(0.7, 2.0);
  vec2 offset = a_Offset * fontScale + + bufferOffset;

  bool isBillboard = a_StylePacked2.y > 0.5;
  if (isBillboard) {
    float rotation =  a_StylePacked2.w;
    bool isSizeAttenuation = a_StylePacked2.z > 0.5;
    gl_Position = billboard(offset, rotation, isSizeAttenuation, u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix, a_Position );
  } else {
    gl_Position = project(vec4(a_Position.xy + offset, u_ZIndex, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);
  }
}