#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/mesh.both.glsl')

in vec4 v_PickingResult;

out vec4 outputColor;

void main(){
  if (u_Visible < 0.5) {
    discard;
  }

  if (u_IsPicking > 0.5) {
    outputColor = vec4(v_PickingResult.xyz, 1.0);
    return;
  }

  outputColor = u_Color;
  outputColor.a = outputColor.a * u_Opacity * u_FillOpacity;
}