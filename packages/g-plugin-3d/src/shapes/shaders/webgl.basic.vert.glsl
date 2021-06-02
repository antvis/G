attribute vec3 a_Position;
attribute vec3 a_Normal;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;
uniform vec4 u_Color;

varying vec4 v_Color;

#pragma include "uv.declaration"

#pragma include "instancing.declaration"
#pragma include "picking"

void main() {
  v_Color = u_Color;

  #pragma include "instancing"

  gl_Position = u_ProjectionMatrix * u_ViewMatrix * modelMatrix * vec4(a_Position, 1.0);

  #pragma include "uv"

  setPickingColor(a_PickingColor);
}