uniform float u_Opacity : 1;

#pragma include "uv.declaration"
#pragma include "map.declaration"
#pragma include "picking"

void main() {
  vec4 diffuseColor = vec4(1.);

  #pragma include "map"

  gl_FragColor = diffuseColor;
  gl_FragColor.a = gl_FragColor.a * u_Opacity;
  gl_FragColor = filterColor(gl_FragColor);
}
