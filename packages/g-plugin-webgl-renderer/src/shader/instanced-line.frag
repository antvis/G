#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/uv.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/map.declaration.frag')

varying vec4 v_Dash;
// varying vec2 v_Normal;

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.frag')
  #pragma glslify: import('@antv/g-shader-components/map.frag')

  gl_FragColor = u_StrokeColor;
  #ifdef USE_MAP
      gl_FragColor = u_Color;
  #endif

  // float blur = 1. - smoothstep(0.98, 1., length(v_Normal));
  float u_dash_offset = v_Dash.y;
  float u_dash_array = v_Dash.z;
  float u_dash_ratio = v_Dash.w;
  gl_FragColor.a = gl_FragColor.a
    // * blur
    * u_Opacity * u_StrokeOpacity
    * ceil(mod(v_Dash.x + u_dash_offset, u_dash_array) - (u_dash_array * u_dash_ratio));
}