attribute vec2 a_extrude;
attribute vec4 a_color;
attribute float a_shape;
attribute vec2 a_position;
attribute float a_size;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

uniform float u_stroke_width : 1;
uniform float u_device_pixel_ratio;
uniform vec2 u_viewport;

varying vec4 v_color;
varying vec4 v_data;
varying float v_radius;

#pragma include "picking"

void main() {
  v_color = a_color;
  v_radius = a_size;

  float antialiasblur = 1.0 / (a_size + u_stroke_width);

  vec2 offset = a_extrude * (a_size + u_stroke_width);
  gl_Position = vec4(a_position + offset, 0.0, 1.0);
  gl_Position.xy = (gl_Position.xy / u_viewport * 2.0 * 2.0 - 1.) * vec2(1, -1);

  // construct point coords
  v_data = vec4(a_extrude, antialiasblur, a_shape);

  setPickingColor(a_PickingColor);
}