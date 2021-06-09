attribute vec2 a_Size;

uniform vec2 u_Anchor;
uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;

#pragma include "instancing.declaration"
#pragma include "picking"
#pragma include "uv.declaration"

void main() {
  #pragma include "uv"

  vec2 offset = (a_Uv - u_Anchor) * a_Size;

  #pragma include "instancing"
  gl_Position = u_ProjectionMatrix * u_ViewMatrix * modelMatrix * vec4(offset, 0.0, 1.0);

  setPickingColor(a_PickingColor);
}