#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/mesh.both.glsl')

layout(location = POSITION) in vec2 a_Position;

void main() {
  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(a_Position, u_ZIndex, 1.0);
}