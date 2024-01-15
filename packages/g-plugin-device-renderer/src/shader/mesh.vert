#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/batch.declaration.vert')
#pragma glslify: project = require('@antv/g-shader-components/project.vert')
#pragma glslify: billboard = require('@antv/g-shader-components/billboard.vert')

layout(location = POSITION) in vec3 a_Position;
layout(location = PACKED_STYLE3) in vec4 a_StylePacked3;

#ifdef USE_UV
  layout(location = UV) in vec2 a_Uv;
  out vec2 v_Uv;
#endif

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.vert')
  #pragma glslify: import('@antv/g-shader-components/uv.vert')

  bool isBillboard = a_StylePacked3.x > 0.5;
  if (isBillboard) {
    float rotation = a_StylePacked3.y;
    bool isSizeAttenuation = a_StylePacked3.z > 0.5;
    gl_Position = billboard(a_Position.xy, rotation, isSizeAttenuation, u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix, vec3(0.0));
  } else {
    gl_Position = project(vec4(a_Position.xy, u_ZIndex, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);
  }
}