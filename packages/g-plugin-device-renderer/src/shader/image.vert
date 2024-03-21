#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/batch.declaration.vert')
#pragma glslify: project = require('@antv/g-shader-components/project.vert')
#pragma glslify: billboard = require('@antv/g-shader-components/billboard.vert')

layout(location = POSITION) in vec3 a_Position;
layout(location = SIZE) in vec2 a_Size;
layout(location = PACKED_STYLE3) in vec4 a_StylePacked3;

#ifdef USE_UV
  layout(location = UV) in vec2 a_Uv;
  out vec2 v_Uv;
#endif

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.vert')

  vec2 offset = (a_Uv - u_Anchor.xy) * a_Size;

  bool isBillboard = a_StylePacked3.x > 0.5;
  if (isBillboard) {
    float rotation = a_StylePacked3.y;
    bool isSizeAttenuation = a_StylePacked3.z > 0.5;
    gl_Position = billboard(offset, rotation, isSizeAttenuation, u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix, a_Position);
  } else {
    gl_Position = project(vec4(a_Position.xy + offset, u_ZIndex, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);
  }

  #pragma glslify: import('@antv/g-shader-components/uv.vert')
}