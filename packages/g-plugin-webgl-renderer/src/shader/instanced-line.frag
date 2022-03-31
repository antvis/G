#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/uv.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/map.declaration.frag')

in vec4 v_Dash;
// in vec2 v_Normal;

out vec4 outputColor;

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.frag')
  #pragma glslify: import('@antv/g-shader-components/map.frag')

  if (u_IsPicking > 0.5) {
    outputColor = vec4(v_PickingResult.xyz, 1.0);
  } else {
    outputColor = u_StrokeColor;
    #ifdef USE_MAP
        outputColor = u_Color;
    #endif

    // float blur = 1. - smoothstep(0.98, 1., length(v_Normal));
    float u_dash_offset = v_Dash.y;
    float u_dash_array = v_Dash.z;
    float u_dash_ratio = v_Dash.w;
    outputColor.a = outputColor.a
      // * blur
      * u_Opacity * u_StrokeOpacity
      * ceil(mod(v_Dash.x + u_dash_offset, u_dash_array) - (u_dash_array * u_dash_ratio));
  }
}