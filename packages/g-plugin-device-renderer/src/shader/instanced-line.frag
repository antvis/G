#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/uv.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/map.declaration.frag')

in vec4 v_Dash;
in vec2 v_Distance;

out vec4 outputColor;
float epsilon = 0.000001;

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.frag')
  #pragma glslify: import('@antv/g-shader-components/map.frag')

  if (u_IsPicking > 0.5) {
    if (u_PickingColor.x == 0.0 && u_PickingColor.y == 0.0 && u_PickingColor.z == 0.0) {
      discard;
    }
    outputColor = vec4(u_PickingColor, 1.0);
  } else {
    outputColor = u_StrokeColor;
    #ifdef USE_MAP
      outputColor = u_Color;
    #endif

    float blur;
    if (v_Distance.y < 1.0) {
      blur = smoothstep(0.0, v_Distance.y, 1.0 - abs(v_Distance.x));
    } else {
      blur = 1.0 / v_Distance.y;
    }
    float u_dash_offset = v_Dash.y;
    float u_dash_array = v_Dash.z;
    float u_dash_ratio = v_Dash.w;

    outputColor.a = outputColor.a
      * max(blur, 0.5)
      * u_Opacity * u_StrokeOpacity
      * (u_dash_array < 1.0 ? (ceil((u_dash_array * u_dash_ratio) - mod(v_Dash.x + u_dash_offset, u_dash_array))) : 1.0);

    if (outputColor.a < epsilon) {
      discard;
    }
  }
}