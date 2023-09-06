import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import {
  MeshBasicMaterial,
  BufferGeometry,
  Mesh,
  VertexStepMode,
  Format,
  VertexAttributeBufferIndex,
  VertexAttributeLocation,
  Plugin as Plugin3D,
} from '@antv/g-plugin-3d';
import { Plugin as PluginControl } from '@antv/g-plugin-control';
import Stats from 'stats.js';

// create a renderer
const renderer = new Renderer();
renderer.registerPlugin(new Plugin3D());
renderer.registerPlugin(new PluginControl());

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
});

(async () => {
  // wait for canvas' initialization complete
  await canvas.ready;

  // use GPU device
  const plugin = renderer.getPlugin('device-renderer');
  const device = plugin.getDevice();

  // create buffer geometry
  const bufferGeometry = new BufferGeometry(device);
  bufferGeometry.setVertexBuffer({
    bufferIndex: VertexAttributeBufferIndex.POSITION,
    byteStride: 4 * 3,
    stepMode: VertexStepMode.VERTEX,
    attributes: [
      {
        format: Format.F32_RGB,
        bufferByteOffset: 4 * 0,
        location: VertexAttributeLocation.POSITION,
      },
    ],
    // use 6 vertices
    data: Float32Array.from([
      -100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, -100.0, 100.0, 100.0,
      -100.0, 100.0, -100.0, -100.0, 100.0, -100.0, 100.0, 100.0,
    ]),
  });
  // draw 6 vertices
  bufferGeometry.vertexCount = 6;
  // start from...
  // bufferGeometry.primitiveStart = 0;

  const basicMaterial = new MeshBasicMaterial(device);

  const mesh = new Mesh({
    style: {
      fill: '#1890FF',
      opacity: 1,
      geometry: bufferGeometry,
      material: basicMaterial,
    },
  });
  mesh.setPosition(300, 250, 0);
  canvas.appendChild(mesh);

  // stats
  const stats = new Stats();
  stats.showPanel(0);
  const $stats = stats.dom;
  $stats.style.position = 'absolute';
  $stats.style.left = '0px';
  $stats.style.top = '0px';
  const $wrapper = document.getElementById('container');
  $wrapper.appendChild($stats);
  canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
    if (stats) {
      stats.update();
    }
  });
})();
