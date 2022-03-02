attribute vec3 a_Position;

out vec3 v_Position;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;

#pragma include "instancing.declaration"

void main() {
  v_Position = a_Position;

  #pragma include "instancing"

  gl_Position = u_ProjectionMatrix * u_ViewMatrix * modelMatrix * vec4(a_Position, 1.0);
}