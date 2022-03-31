#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/mesh.both.glsl')

out vec4 outputColor;

#define COLOR_SCALE 1. / 255.

void main(){
  if (u_Visible < 0.5) {
    discard;
  }

  if (u_IsPicking > 0.5) {
    outputColor = vec4(COLOR_SCALE * u_PickingColor, 1.0);
  } else {
    outputColor = u_Color;
    outputColor.a = outputColor.a * u_Opacity * u_FillOpacity;
  }
}