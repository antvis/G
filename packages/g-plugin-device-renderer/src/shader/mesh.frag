#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/mesh.both.glsl')
#pragma glslify: import('@antv/g-shader-components/uv.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/map.declaration.frag')

out vec4 outputColor;

#define COLOR_SCALE 1. / 255.

void main(){
  if (u_Visible < 0.5) {
    discard;
  }

  if (u_IsPicking > 0.5) {
    vec3 pickingColor = COLOR_SCALE * u_PickingColor;
    if (pickingColor.x == 0.0 && pickingColor.y == 0.0 && pickingColor.z == 0.0) {
      discard;
    }
    outputColor = vec4(pickingColor, 1.0);
  } else {

    vec4 u_Color = u_FillColor;

    #pragma glslify: import('@antv/g-shader-components/map.frag')

    outputColor = u_Color;
    outputColor.a = outputColor.a * u_Opacity * u_FillOpacity;
  }
}