attribute vec2 a_Tex;
attribute vec2 a_Offset;

uniform vec2 u_SDFMapSize;
uniform float u_FontSize;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;

varying vec2 v_UV;
varying float v_GammaScale;

#pragma include "instancing.declaration"
#pragma include "picking"

void main() {
  v_UV = a_Tex / u_SDFMapSize;

  float fontScale = u_FontSize / 24.;

  #pragma include "instancing"

  gl_Position = u_ProjectionMatrix * u_ViewMatrix * modelMatrix * 
    vec4(a_Offset * fontScale, 0.0, 1.0);

  v_GammaScale = gl_Position.w;

  setPickingColor(a_PickingColor);
}