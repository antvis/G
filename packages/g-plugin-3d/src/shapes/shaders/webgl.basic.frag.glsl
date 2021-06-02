varying vec4 v_Color;

#pragma include "uv.declaration"
#pragma include "map.declaration"

void main() {
  vec4 diffuseColor = v_Color;

  #pragma include "map"

  gl_FragColor = diffuseColor;
}