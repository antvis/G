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

  #ifdef USE_FOG
    gl_FragColor.rgb = addFog(gl_FragColor.rgb);
  #endif

  #ifdef USE_WIREFRAME
    vec3 u_WireframeLineColor = vec3(0.);
    vec3 wireframeAoColor = vec3(1.);
    vec3 color;
    // draw wireframe with ao
    color = mix(gl_FragColor.xyz, u_WireframeLineColor, (1.0 - edgeFactor()));
    gl_FragColor.xyz = color;
  #endif
}