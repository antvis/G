import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import {
  PointMaterial,
  BufferGeometry,
  Mesh,
  VertexStepMode,
  Format,
  VertexAttributeBufferIndex,
  VertexAttributeLocation,
  Plugin as Plugin3D,
  PrimitiveTopology,
} from '@antv/g-plugin-3d';
import { Plugin as PluginControl } from '@antv/g-plugin-control';
import Stats from 'stats.js';
import * as lil from 'lil-gui';

/**
 * ported from @see https://threejs.org/examples/#webgl_points_sprites
 */

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
  background: 'black',
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
      -100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, -100.0, 100.0, -100.0,
      -100.0, 100.0,
    ]),
  });
  // draw 4 vertices
  bufferGeometry.vertexCount = 4;
  // use GL_POINT instead of GL_TRIANGLES
  bufferGeometry.drawMode = PrimitiveTopology.POINTS;

  // load texture with URL
  const map = plugin.loadTexture(
    'https://threejs.org/examples/textures/sprites/snowflake1.png',
  );
  const pointMaterial = new PointMaterial(device, {
    size: 100,
    map,
    depthTest: false,
  });

  const mesh = new Mesh({
    style: {
      fill: '#1890FF',
      opacity: 1,
      geometry: bufferGeometry,
      material: pointMaterial,
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

  // GUI
  const gui = new lil.GUI({ autoPlace: false });
  $wrapper.appendChild(gui.domElement);

  const pointFolder = gui.addFolder('point');
  const pointConfig = {
    size: 100,
    vertexNum: 4,
  };
  pointFolder.add(pointConfig, 'size', 1, 100, 1).onChange((size) => {
    pointMaterial.size = size;
  });
  pointFolder.add(pointConfig, 'vertexNum', 0, 4, 1).onChange((vertexNum) => {
    bufferGeometry.vertexCount = vertexNum;
  });
  pointFolder.open();
})();
