#pragma glslify: import('./chunks/scene.both.glsl')
#pragma glslify: import('./chunks/text.both.glsl')

#pragma glslify: import('./chunks/batch.declaration.vert')
#pragma glslify: project = require('./chunks/project.vert')

layout(location = 10) attribute vec2 a_Tex;
layout(location = 11) attribute vec2 a_Offset;

varying vec2 v_UV;
varying float v_GammaScale;

void main() {
    #pragma glslify: import('./chunks/batch.vert')

    v_UV = a_Tex / u_SDFMapSize;

    float fontScale = u_FontSize / 24.;

    gl_Position = project(vec4(a_Offset * fontScale, -u_ZIndex, 1.0), u_ProjectionMatrix, u_ViewMatrix, u_ModelMatrix);
    v_GammaScale = gl_Position.w;
}