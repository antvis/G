import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import {
  MeshBasicMaterial,
  CubeGeometry,
  Mesh,
  Format,
  TextureDimension,
  TextureUsage,
  Plugin as Plugin3D,
} from '@antv/g-plugin-3d';
import { Plugin as PluginControl } from '@antv/g-plugin-control';
import * as lil from 'lil-gui';
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

  // 1. load texture with URL
  const map = plugin.loadTexture(
    'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_aqoS73Se3sAAAAAAAAAAAAAARQnAQ',
  );

  // 2. or create texture from scratch
  // const map = device.createTexture({
  //   pixelFormat: Format.U8_RGBA_NORM,
  //   width: 1,
  //   height: 1,
  //   depth: 1,
  //   numLevels: 1,
  //   dimension: TextureDimension.TEXTURE_2D,
  //   usage: TextureUsage.SAMPLED,
  // });
  // // load image
  // const image = new window.Image();
  // image.onload = () => {
  //   map.setImageData(image);
  //   canvas.getRenderingService().dirtify();
  // };
  // image.onerror = () => {};
  // image.crossOrigin = 'Anonymous';
  // image.src =
  //   'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_aqoS73Se3sAAAAAAAAAAAAAARQnAQ';

  const cubeGeometry = new CubeGeometry(device, {
    width: 200,
    height: 200,
    depth: 200,
  });
  const basicMaterial = new MeshBasicMaterial(device, {
    // wireframe: true,
    map,
  });

  const cube = new Mesh({
    style: {
      fill: '#1890FF',
      opacity: 1,
      geometry: cubeGeometry,
      material: basicMaterial,
    },
  });

  cube.setPosition(300, 250, 0);

  canvas.appendChild(cube);

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
    // cube.rotate(0, 1, 0);
  });

  // GUI
  const gui = new lil.GUI({ autoPlace: false });
  $wrapper.appendChild(gui.domElement);

  const cubeFolder = gui.addFolder('cube');
  const cubeConfig = {
    opacity: 1,
    fill: '#1890FF',
  };
  cubeFolder.add(cubeConfig, 'opacity', 0, 1, 0.1).onChange((opacity) => {
    cube.style.opacity = opacity;
  });
  cubeFolder.addColor(cubeConfig, 'fill').onChange((color) => {
    cube.style.fill = color;
  });
  cubeFolder.open();

  const geometryFolder = gui.addFolder('geometry');
  const geometryConfig = {
    width: 200,
    height: 200,
    depth: 200,
    widthSegments: 1,
    heightSegments: 1,
    depthSegments: 1,
  };
  geometryFolder.add(geometryConfig, 'width', 50, 300).onChange((width) => {
    cubeGeometry.width = width;
  });
  geometryFolder.add(geometryConfig, 'height', 50, 300).onChange((height) => {
    cubeGeometry.height = height;
  });
  geometryFolder.add(geometryConfig, 'depth', 50, 300).onChange((depth) => {
    cubeGeometry.depth = depth;
  });
  geometryFolder
    .add(geometryConfig, 'widthSegments', 1, 10, 1)
    .onChange((widthSegments) => {
      cubeGeometry.widthSegments = widthSegments;
    });
  geometryFolder
    .add(geometryConfig, 'heightSegments', 1, 10, 1)
    .onChange((heightSegments) => {
      cubeGeometry.heightSegments = heightSegments;
    });
  geometryFolder
    .add(geometryConfig, 'depthSegments', 1, 10, 1)
    .onChange((depthSegments) => {
      cubeGeometry.depthSegments = depthSegments;
    });
  geometryFolder.open();

  const materialFolder = gui.addFolder('material');
  const materialConfig = {
    wireframe: false,
    map: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_aqoS73Se3sAAAAAAAAAAAAAARQnAQ',
  };
  materialFolder.add(materialConfig, 'wireframe').onChange((wireframe) => {
    cube.style.material.wireframe = !!wireframe;
  });
  materialFolder
    .add(materialConfig, 'map', [
      'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*_aqoS73Se3sAAAAAAAAAAAAAARQnAQ',
      'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*8TlCRIsKeUkAAAAAAAAAAAAAARQnAQ',
      'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
      'none',
    ])
    .onChange((mapURL) => {
      if (mapURL === 'none') {
        cube.style.material.map = null;
      } else {
        cube.style.material.map = plugin.loadTexture(mapURL);
      }
    });
  materialFolder.open();
})();
