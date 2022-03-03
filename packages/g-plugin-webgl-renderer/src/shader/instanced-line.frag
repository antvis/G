#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/uv.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/map.declaration.frag')

in vec4 v_Dash;
// in vec2 v_Normal;

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.frag')
  #pragma glslify: import('@antv/g-shader-components/map.frag')

  gbuf_color = u_StrokeColor;
  #ifdef USE_MAP
      gbuf_color = u_Color;
  #endif

  // float blur = 1. - smoothstep(0.98, 1., length(v_Normal));
  float u_dash_offset = v_Dash.y;
  float u_dash_array = v_Dash.z;
  float u_dash_ratio = v_Dash.w;
  gbuf_color.a = gbuf_color.a
    // * blur
    * u_Opacity * u_StrokeOpacity
    * ceil(mod(v_Dash.x + u_dash_offset, u_dash_array) - (u_dash_array * u_dash_ratio));
}