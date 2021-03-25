attribute vec2 a_Extrude;
attribute vec4 a_Color;
attribute float a_Shape;
attribute vec2 a_Size;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;

uniform float u_StrokeWidth : 1;

varying vec4 v_Color;
varying vec4 v_Data;
varying float v_Radius;

#pragma include "instancing.declaration"
#pragma include "project.declaration"
#pragma include "picking"

void main() {
  v_Color = a_Color;
  v_Radius = a_Size.x;

  float antialiasblur = 1.0 / (a_Size.x + u_StrokeWidth);

  vec2 offset = a_Extrude * (a_Size + u_StrokeWidth);

  #pragma include "instancing"

  gl_Position = u_ProjectionMatrix * u_ViewMatrix * modelMatrix * vec4(offset, 0.0, 1.0);

  // project_pixel_size_to_clipspace: [0, 1] -> [-1, 1] and flipY
  gl_Position.xy = project_to_clipspace(gl_Position.xy);

  // construct point coords
  v_Data = vec4(a_Extrude, antialiasblur, a_Shape);

  setPickingColor(a_PickingColor);
}