#pragma glslify: import('./chunks/scene.both.glsl')

#pragma glslify: import('./chunks/batch.declaration.frag')
#pragma glslify: import('./chunks/uv.declaration.frag')
#pragma glslify: import('./chunks/map.declaration.frag')

void main() {
    #pragma glslify: import('./chunks/batch.frag')
    #pragma glslify: import('./chunks/map.frag')

    gl_FragColor = u_Color;
    gl_FragColor.a = gl_FragColor.a * u_Opacity;
}