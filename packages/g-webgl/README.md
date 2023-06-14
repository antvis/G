# @antv/g-webgl

This is a renderer implemented with WebGL2/1.

```js
import { Renderer as WebGLRenderer } from '@antv/g-webgl';

const webglRenderer = new WebGLRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: webglRenderer,
});
```

## Options

### targets

We can pass in a specific target(s), which will get downgraded automatically.

```js
new Renderer({
  targets: ['webgl2', 'webgl1'],
});
```

### onContextLost

https://www.khronos.org/webgl/wiki/HandlingContextLost

```js
new Renderer({
  onContextLost: () => {},
});
```
