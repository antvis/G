#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/mesh.both.glsl')

in vec4 v_PickingResult;

layout(location = 0) out vec4 gbuf_color;
layout(location = 1) out vec4 gbuf_picking;

void main(){
  if (u_Visible < 1.0) {
    discard;
  }

  gbuf_picking = vec4(v_PickingResult.rgb, 1.0);

  gbuf_color = u_Color;
  gbuf_color.a = gbuf_color.a * u_Opacity * u_FillOpacity;
}