#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/mesh.both.glsl')

layout(location = 0) attribute vec2 a_Position;

varying vec4 v_PickingResult;
#define COLOR_SCALE 1. / 255.
void setPickingColor(vec3 pickingColor) {
  v_PickingResult.rgb = pickingColor * COLOR_SCALE;
}

void main() {
  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(a_Position, u_ZIndex, 1.0);

  setPickingColor(u_PickingColor.xyz);
}