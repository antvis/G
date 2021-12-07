#pragma glslify: import('./chunks/scene.both.glsl')
#pragma glslify: import('./chunks/batch.declaration.vert')
#pragma glslify: project = require('./chunks/project.vert')

layout(location = 10) attribute vec2 a_Size;

#ifdef USE_UV
    layout(location = 11) attribute vec2 a_Uv;
    varying vec2 v_Uv;
#endif

void main() {
    #pragma glslify: import('./chunks/batch.vert')

    vec2 offset = (a_Uv - a_Anchor.xy) * a_Size;

    gl_Position = project(vec4(offset, 0.0, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);

    #pragma glslify: import('./chunks/uv.vert')
}