#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/mesh.both.glsl')

varying vec4 v_PickingResult;

void main(){
  if (u_Visible < 1.0) {
    discard;
  }

  gbuf_picking = vec4(v_PickingResult.rgb, 1.0);

  gl_FragColor = u_Color;
  gl_FragColor.a = gl_FragColor.a * u_Opacity * u_FillOpacity;
}