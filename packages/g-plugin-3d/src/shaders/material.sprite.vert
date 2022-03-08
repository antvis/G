#pragma glslify:import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify:import('@antv/g-shader-components/material.sprite.glsl')

#pragma glslify:import('@antv/g-shader-components/batch.declaration.vert')
#pragma glslify:project=require('@antv/g-shader-components/project.vert')

layout(location=POSITION)in vec3 a_Position;

void main(){
  #pragma glslify:import('@antv/g-shader-components/batch.vert')
  
  gl_Position=project(vec4(a_Position,1.),u_ProjectionMatrix,u_ViewMatrix,u_ModelMatrix);
  gl_PointSize=20.;
}