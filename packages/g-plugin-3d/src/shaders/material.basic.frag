#pragma glslify: import('@antv/g-shader-components/common.glsl')
#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/material.basic.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/uv.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/map.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/wireframe.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/fog.declaration.frag')

out vec4 outputColor;

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.frag')
  #pragma glslify: import('@antv/g-shader-components/map.frag')

  if (u_IsPicking > 0.5) {
    if (u_PickingColor.x == 0.0 && u_PickingColor.y == 0.0 && u_PickingColor.z == 0.0) {
      discard;
    }
    outputColor = vec4(u_PickingColor, 1.0);
  } else {
    outputColor = u_Color;
    outputColor.a = outputColor.a * u_Opacity;
    vec4 diffuseColor = outputColor;

    ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
    reflectedLight.indirectDiffuse += vec3( 1.0 );
    reflectedLight.indirectDiffuse *= outputColor.rgb;

    vec3 outgoingLight = reflectedLight.indirectDiffuse;
    
    #pragma glslify: import('@antv/g-shader-components/output.frag')
    #pragma glslify: import('@antv/g-shader-components/wireframe.frag')
    #pragma glslify: import('@antv/g-shader-components/fog.frag')
  }
}