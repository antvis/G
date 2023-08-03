#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/batch.declaration.vert')
#pragma glslify: project = require('@antv/g-shader-components/project.vert')

layout(location = POSITION) in vec4 a_Size;

#ifdef USE_UV
  layout(location = UV) in vec2 a_Uv;
  out vec2 v_Uv;
#endif

bool isPerspectiveMatrix(mat4 m) {
	return m[ 2 ][ 3 ] == - 1.0;
}

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.vert')

  vec2 offset = (a_Uv - u_Anchor.xy) * a_Size.xy;

  bool isPerspective = isPerspectiveMatrix(u_ProjectionMatrix);

  bool isBillboard = a_Size.z > 0.5;
  if (isBillboard) {
    float rotation = a_Size.w;
    #pragma glslify: import('@antv/g-shader-components/billboard.vert')
  } else {
    gl_Position = project(vec4(offset, u_ZIndex, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);
  }

  #pragma glslify: import('@antv/g-shader-components/uv.vert')
}