#pragma glslify: import('@antv/g-shader-components/common.glsl')
#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/material.both.glsl')

#pragma glslify: import('@antv/g-shader-components/batch.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/uv.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/map.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/wireframe.declaration.frag')
#pragma glslify: import('@antv/g-shader-components/fog.declaration.frag')

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.frag')
  #pragma glslify: import('@antv/g-shader-components/map.frag')

  gl_FragColor = u_Color;
  gl_FragColor.a = gl_FragColor.a * u_Opacity;
  vec4 diffuseColor = gl_FragColor;

  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  reflectedLight.indirectDiffuse += vec3( 1.0 );
  reflectedLight.indirectDiffuse *= gl_FragColor.rgb;

  vec3 outgoingLight = reflectedLight.indirectDiffuse;
  
  #pragma glslify: import('@antv/g-shader-components/output.frag')
  #pragma glslify: import('@antv/g-shader-components/wireframe.frag')
  #pragma glslify: import('@antv/g-shader-components/fog.frag')
}