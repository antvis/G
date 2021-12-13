# 3D extension for G

Provide some 3D shapes such as Cube, Sphere, support `g-webgl` only.

## Cube

```js
import { Canvas, Group } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import { CubeGeometry, MeshBasicMaterial, Mesh, Plugin } from '@antv/g-plugin-3d';

// create a webgl renderer
const webglRenderer = new Renderer();
webglRenderer.registerPlugin(new Plugin());

// create a canvas
const canvas = new Canvas({
    container: 'container',
    width: 600,
    height: 500,
    renderer: webglRenderer,
});

// create a geometry
const geometry = new CubeGeometry({
    width: 200,
    height: 200,
    depth: 200,
});

// create a material
const material = new MeshBasicMaterial({
    map: 'https://xxx.png',
});

// create a cube mesh
const cube = new Mesh({
    fill: '#1890FF',
    opacity: 1,
    style: {
        geometry,
        material,
    },
});

// append to canvas
canvas.appendChild(cube);

// transform it like other 2D shapes
cube.translate(100, 100, 0);
```
