import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import {
  MeshBasicMaterial,
  TorusGeometry,
  DirectionalLight,
  Mesh,
  FogType,
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

  const torusGeometry = new TorusGeometry(device, {
    tubeRadius: 30,
    ringRadius: 200,
  });
  const basicMaterial = new MeshBasicMaterial(device);

  const torus = new Mesh({
    style: {
      fill: '#b0b0b0',
      opacity: 1,
      geometry: torusGeometry,
      material: basicMaterial,
    },
  });
  torus.setPosition(300, 250);
  canvas.appendChild(torus);

  // add a directional light into scene
  const light = new DirectionalLight({
    style: {
      fill: 'white',
      direction: [-1, 0, 1],
    },
  });
  canvas.appendChild(light);

  const camera = canvas.getCamera();
  camera.setPosition(300, 0, 500);

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

  const torusFolder = gui.addFolder('torus');
  const torusConfig = {
    opacity: 1,
    fill: '#b0b0b0',
  };
  torusFolder.add(torusConfig, 'opacity', 0, 1, 0.1).onChange((opacity) => {
    torus.style.opacity = opacity;
  });
  torusFolder.addColor(torusConfig, 'fill').onChange((color) => {
    torus.style.fill = color;
  });
  torusFolder.open();

  const geometryFolder = gui.addFolder('geometry');
  const geometryConfig = {
    tubeRadius: 30,
    ringRadius: 200,
    segments: 30,
    sides: 20,
  };
  geometryFolder
    .add(geometryConfig, 'tubeRadius', 10, 300)
    .onChange((tubeRadius) => {
      torusGeometry.tubeRadius = tubeRadius;
    });
  geometryFolder
    .add(geometryConfig, 'ringRadius', 10, 300)
    .onChange((ringRadius) => {
      torusGeometry.ringRadius = ringRadius;
    });
  geometryFolder
    .add(geometryConfig, 'segments', 2, 30, 1)
    .onChange((segments) => {
      torusGeometry.segments = segments;
    });
  geometryFolder.add(geometryConfig, 'sides', 2, 30, 1).onChange((sides) => {
    torusGeometry.sides = sides;
  });
  geometryFolder.open();

  const materialFolder = gui.addFolder('material');
  const materialConfig = {
    wireframe: false,
    map: 'none',
    fogType: FogType.NONE,
    fogColor: '#000000',
    fogDensity: 0.5,
    fogStart: 1,
    fogEnd: 1000,
  };
  materialFolder.add(materialConfig, 'wireframe').onChange((enable) => {
    torus.style.material.wireframe = !!enable;
  });
  materialFolder
    .add(materialConfig, 'map', [
      'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*npAsSLPX4A4AAAAAAAAAAAAAARQnAQ',
      'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
      'none',
    ])
    .onChange((mapURL) => {
      if (mapURL === 'none') {
        torus.style.material.map = null;
      } else {
        const map = plugin.loadTexture(mapURL);
        torus.style.material.map = map;
      }
    });
  const fogTypes = [FogType.NONE, FogType.EXP, FogType.EXP2, FogType.LINEAR];
  materialFolder
    .add(materialConfig, 'fogType', fogTypes)
    .onChange((fogType) => {
      // FogType.NONE
      torus.style.material.fogType = fogType;
    });
  materialFolder.addColor(materialConfig, 'fogColor').onChange((fogColor) => {
    torus.style.material.fogColor = fogColor;
  });
  materialFolder
    .add(materialConfig, 'fogDensity', 0, 10)
    .onChange((fogDensity) => {
      torus.style.material.fogDensity = fogDensity;
    });
  materialFolder
    .add(materialConfig, 'fogStart', 0, 1000)
    .onChange((fogStart) => {
      torus.style.material.fogStart = fogStart;
    });
  materialFolder.add(materialConfig, 'fogEnd', 0, 1000).onChange((fogEnd) => {
    torus.style.material.fogEnd = fogEnd;
  });
  materialFolder.open();
})();
