#pragma glslify: import('@antv/g-shader-components/scene.both.glsl')
#pragma glslify: import('@antv/g-shader-components/batch.declaration.vert')

#pragma glslify: import('@antv/g-shader-components/text.both.glsl')
#pragma glslify: project = require('@antv/g-shader-components/project.vert')

layout(location = TEX) in vec2 a_Tex;
layout(location = OFFSET) in vec2 a_Offset;

out vec2 v_Uv;
out float v_GammaScale;

bool isPerspectiveMatrix(mat4 m) {
  return m[ 2 ][ 3 ] == - 1.0;
}

void main() {
  #pragma glslify: import('@antv/g-shader-components/batch.vert')

  v_Uv = a_Tex / u_SDFMapSize;
  float fontScale = u_FontSize / 24.;

  float isBillboard = a_StylePacked2.y;
  float sizeAttenuation = a_StylePacked2.z;
  if (isBillboard > 0.5) {
    vec4 mvPosition = u_ViewMatrix * u_ModelMatrix * vec4( 0.0, 0.0, u_ZIndex, 1.0 );
    vec2 scale;
    scale.x = length( vec3( u_ModelMatrix[ 0 ].x, u_ModelMatrix[ 0 ].y, u_ModelMatrix[ 0 ].z ) );
    scale.y = length( vec3( u_ModelMatrix[ 1 ].x, u_ModelMatrix[ 1 ].y, u_ModelMatrix[ 1 ].z ) );

    if (sizeAttenuation < 0.5) {
      bool isPerspective = isPerspectiveMatrix( u_ProjectionMatrix );
      if ( isPerspective ) scale *= - mvPosition.z;
    }

    vec2 alignedPosition = a_Offset * fontScale * scale;

    float rotation = 0.0;
    vec2 rotatedPosition;
    rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
    rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;

    mvPosition.xy += rotatedPosition;

    gl_Position = u_ProjectionMatrix * mvPosition;
    v_GammaScale = 1.0;
  } else {
    gl_Position = project(vec4(a_Offset * fontScale, u_ZIndex, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);
    v_GammaScale = gl_Position.w;
  }
}