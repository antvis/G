attribute vec2 a_Extrude;
attribute vec4 a_Color;
attribute vec2 a_Size;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;

uniform float u_StrokeWidth : 1;
uniform float u_Shape : 0;
uniform vec2 u_Anchor: [0, 0];

varying vec4 v_Color;
varying vec4 v_Data;
varying vec2 v_Radius;

#pragma include "instancing.declaration"
#pragma include "picking"

void main() {
  v_Color = a_Color;
  v_Radius = a_Size;

  float antialiasblur = 1.0 / (a_Size.x + u_StrokeWidth);

  vec2 offset = (a_Extrude + u_Anchor) * a_Size;

  #pragma include "instancing"

  gl_Position = u_ProjectionMatrix * u_ViewMatrix * modelMatrix * vec4(offset, 0.0, 1.0);

  // construct point coords
  v_Data = vec4(a_Extrude, antialiasblur, u_Shape);

  setPickingColor(a_PickingColor);
}