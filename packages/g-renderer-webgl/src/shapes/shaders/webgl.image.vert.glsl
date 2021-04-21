attribute vec2 a_Extrude;
attribute vec2 a_Size;

varying vec2 v_UV;

uniform vec2 u_Anchor;
uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;

#pragma include "instancing.declaration"
#pragma include "project.declaration"

void main() {
  v_UV = a_Extrude;

  vec2 offset = (a_Extrude - u_Anchor) * a_Size;

  #pragma include "instancing"

  gl_Position = u_ProjectionMatrix * u_ViewMatrix * modelMatrix * vec4(offset, 0.0, 1.0);

  // project_pixel_size_to_clipspace: [0, 1] -> [-1, 1] and flipY
  gl_Position.xy = project_to_clipspace(gl_Position.xy);
}