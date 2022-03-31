#pragma glslify: import('@antv/g-shader-components/common.glsl')
#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/point.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/map.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/fog.declaration.frag')

out vec4 outputColor;

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.frag')
  #pragma glslify: import('@antv/g-shader-components/map.point.frag')

  if (u_IsPicking > 0.5) {
    outputColor = vec4(v_PickingResult.xyz, 1.0);
  } else {
    outputColor = u_Color;
    outputColor.a = outputColor.a * u_Opacity;
    vec4 diffuseColor = outputColor;

    vec3 outgoingLight = diffuseColor.rgb;
    
    #pragma glslify: import('@antv/g-shader-components/output.frag')
    #pragma glslify: import('@antv/g-shader-components/fog.frag')
  }
}