# @antv/g-shader-components

基于 glslify 提供 chunks

```js
// main.frag
#pragma glslify: import('./common.glsl')

void main() {
  gl_FragColor = vec4(color, 1.0);
}
```
