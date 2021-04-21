uniform float u_Blur : 0;
uniform float u_Opacity : 1;
uniform float u_StrokeWidth : 1;
uniform vec4 u_StrokeColor : [0, 0, 0, 0];
uniform float u_StrokeOpacity : 1;
uniform float u_RectRadius : 0;

varying vec4 v_Color;
varying vec4 v_Data;
varying vec2 v_Radius;

#pragma include "sdf_2d"
#pragma include "picking"

void main() {
  int shape = int(floor(v_Data.w + 0.5));

  float antialiasblur = v_Data.z;
  float antialiased_blur = -max(u_Blur, antialiasblur);
  vec2 r = v_Radius / (v_Radius + u_StrokeWidth);

  float outer_df;
  float inner_df;
  // 'circle', 'ellipse', 'rect'
  if (shape == 0) {
    outer_df = sdCircle(v_Data.xy, 1.0);
    inner_df = sdCircle(v_Data.xy, r.x);
  } else if (shape == 1) {
    outer_df = sdEllipsoidApproximated(v_Data.xy, vec2(1.0));
    inner_df = sdEllipsoidApproximated(v_Data.xy, r);
  } else if (shape == 2) {
    outer_df = sdRoundedBox(v_Data.xy, vec2(1.0), u_RectRadius / v_Radius);
    inner_df = sdRoundedBox(v_Data.xy, r, u_RectRadius / v_Radius);
  }

  float opacity_t = smoothstep(0.0, antialiased_blur, outer_df);

  float color_t = u_StrokeWidth < 0.01 ? 0.0 : smoothstep(
    antialiased_blur,
    0.0,
    inner_df
  );
  vec4 strokeColor = u_StrokeColor == vec4(0) ? v_Color : u_StrokeColor;

  gl_FragColor = mix(vec4(v_Color.rgb, v_Color.a * u_Opacity), strokeColor * u_StrokeOpacity, color_t);
  gl_FragColor.a = gl_FragColor.a * opacity_t;

  gl_FragColor = filterColor(gl_FragColor);
}