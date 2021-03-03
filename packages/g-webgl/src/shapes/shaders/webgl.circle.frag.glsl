uniform float u_blur : 0;
uniform float u_opacity : 1;
uniform float u_stroke_width : 1;
uniform vec4 u_stroke_color : [0, 0, 0, 0];
uniform float u_stroke_opacity : 1;

varying vec4 v_color;
varying vec4 v_data;
varying float v_radius;

#pragma include "sdf_2d"
#pragma include "picking"

void main() {
  int shape = int(floor(v_data.w + 0.5));

  float antialiasblur = v_data.z;
  float antialiased_blur = -max(u_blur, antialiasblur);
  float r = v_radius / (v_radius + u_stroke_width);

  float outer_df;
  float inner_df;
  // 'circle', 'triangle', 'square', 'pentagon', 'hexagon', 'octogon', 'hexagram', 'rhombus', 'vesica'
  if (shape == 0) {
    outer_df = sdCircle(v_data.xy, 1.0);
    inner_df = sdCircle(v_data.xy, r);
  // } else if (shape == 1) {
  //   outer_df = sdEllipsoidApproximated();
  //   inner_df = sdEllipsoidApproximated();
  }

  float opacity_t = smoothstep(0.0, antialiased_blur, outer_df);

  float color_t = u_stroke_width < 0.01 ? 0.0 : smoothstep(
    antialiased_blur,
    0.0,
    inner_df
  );
  vec4 strokeColor = u_stroke_color == vec4(0) ? v_color : u_stroke_color;

  gl_FragColor = mix(vec4(v_color.rgb, v_color.a * u_opacity), strokeColor * u_stroke_opacity, color_t);
  gl_FragColor.a = gl_FragColor.a * opacity_t;

  gl_FragColor = filterColor(gl_FragColor);
}