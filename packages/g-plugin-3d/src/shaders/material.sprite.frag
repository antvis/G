#pragma glslify:import('@antv/g-shader-components/common.glsl')
#pragma glslify:import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify:import('@antv/g-shader-components/material.sprite.glsl')

#pragma glslify:import('@antv/g-shader-components/batch.declaration.frag')
#pragma glslify:import('@antv/g-shader-components/map.declaration.frag')
#pragma glslify:import('@antv/g-shader-components/fog.declaration.frag')

void main(){
  #pragma glslify:import('@antv/g-shader-components/batch.frag')
  #pragma glslify:import('@antv/g-shader-components/map.frag')
  
  gbuf_color=u_Color;
  gbuf_color.a=gbuf_color.a*u_Opacity;
  vec4 diffuseColor=gbuf_color;
  
  ReflectedLight reflectedLight=ReflectedLight(vec3(0.),vec3(0.),vec3(0.),vec3(0.));
  reflectedLight.indirectDiffuse+=vec3(1.);
  reflectedLight.indirectDiffuse*=gbuf_color.rgb;
  
  vec3 outgoingLight=reflectedLight.indirectDiffuse;
  
  #pragma glslify:import('@antv/g-shader-components/output.frag')
  #pragma glslify:import('@antv/g-shader-components/fog.frag')
}