#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.vert')
#pragma glslify: project = require('@antv/g-shader-components/project.vert')
#pragma glslify: billboard = require('@antv/g-shader-components/billboard.vert')

layout(location = POSITION) in vec3 a_Position;
layout(location = EXTRUDE) in vec2 a_Extrude;
// shape, radius, omitStroke, isBillboard
layout(location = PACKED_STYLE3) in vec3 a_StylePacked3;
layout(location = SIZE) in vec4 a_Size;
#ifdef USE_UV
  layout(location = UV) in vec2 a_Uv;
  out vec2 v_Uv;
#endif

out vec2 v_Data;
out vec2 v_Radius;
out vec3 v_StylePacked3;

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.vert')
  #pragma glslify: import('@antv/g-shader-components/uv.vert')

  float strokeWidth;
  if (u_IsPicking > 0.5) {
    strokeWidth = u_IncreasedLineWidthForHitTesting + u_StrokeWidth;
  } else {
    strokeWidth = u_StrokeWidth;
  }

  bool omitStroke = a_StylePacked3.z == 1.0;
  vec2 radius = a_Size.xy + vec2(omitStroke ? 0.0 : strokeWidth / 2.0);
  vec2 offset = (a_Extrude + vec2(1.0) - 2.0 * u_Anchor.xy) * a_Size.xy + a_Extrude * vec2(omitStroke ? 0.0 : strokeWidth / 2.0);

  bool isBillboard = a_Size.z > 0.5;
  if (isBillboard) {
    float rotation = 0.0;
    bool isSizeAttenuation = a_Size.w > 0.5;
    gl_Position = billboard(offset, rotation, isSizeAttenuation, u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix, a_Position);
  } else {
    gl_Position = project(vec4(a_Position.xy + offset, u_ZIndex, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);
  }
  
  v_Radius = radius;
  v_Data = vec2(a_Extrude * radius / radius.y);
  v_StylePacked3 = a_StylePacked3;
}