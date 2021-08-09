# 3D extension for G

Provide some 3D shapes such as Cube, Sphere, support `g-webgl` only.

## Cube

```js
import { Canvas, Group } from '@antv/g';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Cube, Plugin } from '@antv/g-plugin-3d';

// create a webgl renderer
const webglRenderer = new WebGLRenderer();
webglRenderer.registerPlugin(new Plugin());

// create a canvas
const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: webglRenderer,
});

// create a cube
const cube = new Cube({
    style: {
        width: 200,
        height: 200,
        depth: 200,
        fill: '#1890FF',
    },
});
```
