import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import {
  MeshPhongMaterial,
  CylinderGeometry,
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

  const cylinderGeometry = new CylinderGeometry(device, {
    radius: 100,
    height: 200,
  });
  const basicMaterial = new MeshPhongMaterial(device);

  const cylinder = new Mesh({
    style: {
      fill: 'white',
      opacity: 1,
      geometry: cylinderGeometry,
      material: basicMaterial,
    },
  });
  cylinder.setPosition(300, 250);
  canvas.appendChild(cylinder);

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
    cylinder.setOrigin(0, 0, 0);
    cylinder.rotate(0, 0.2, 0);
  });

  // GUI
  const gui = new lil.GUI({ autoPlace: false });
  $wrapper.appendChild(gui.domElement);

  const cylinderFolder = gui.addFolder('cylinder');
  const cylinderConfig = {
    opacity: 1,
    fill: '#fff',
  };
  cylinderFolder
    .add(cylinderConfig, 'opacity', 0, 1, 0.1)
    .onChange((opacity) => {
      cylinder.style.opacity = opacity;
    });
  cylinderFolder.addColor(cylinderConfig, 'fill').onChange((color) => {
    cylinder.style.fill = color;
  });
  cylinderFolder.open();

  const geometryFolder = gui.addFolder('geometry');
  const geometryConfig = {
    radius: 100,
    height: 200,
    heightSegments: 5,
    capSegments: 20,
  };
  geometryFolder.add(geometryConfig, 'radius', 10, 300).onChange((radius) => {
    cylinderGeometry.radius = radius;
  });
  geometryFolder.add(geometryConfig, 'height', 10, 300).onChange((height) => {
    cylinderGeometry.height = height;
  });
  geometryFolder
    .add(geometryConfig, 'heightSegments', 2, 30, 1)
    .onChange((heightSegments) => {
      cylinderGeometry.heightSegments = heightSegments;
    });
  geometryFolder
    .add(geometryConfig, 'capSegments', 2, 30, 1)
    .onChange((capSegments) => {
      cylinderGeometry.capSegments = capSegments;
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
    cylinder.style.material.wireframe = !!enable;
  });
  materialFolder
    .add(materialConfig, 'map', [
      'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*npAsSLPX4A4AAAAAAAAAAAAAARQnAQ',
      'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
      'none',
    ])
    .onChange((mapURL) => {
      if (mapURL === 'none') {
        cylinder.style.material.map = null;
      } else {
        const map = plugin.loadTexture(mapURL);
        cylinder.style.material.map = map;
      }
    });
  const fogTypes = [FogType.NONE, FogType.EXP, FogType.EXP2, FogType.LINEAR];
  materialFolder
    .add(materialConfig, 'fogType', fogTypes)
    .onChange((fogType) => {
      // FogType.NONE
      cylinder.style.material.fogType = fogType;
    });
  materialFolder.addColor(materialConfig, 'fogColor').onChange((fogColor) => {
    cylinder.style.material.fogColor = fogColor;
  });
  materialFolder
    .add(materialConfig, 'fogDensity', 0, 10)
    .onChange((fogDensity) => {
      cylinder.style.material.fogDensity = fogDensity;
    });
  materialFolder
    .add(materialConfig, 'fogStart', 0, 1000)
    .onChange((fogStart) => {
      cylinder.style.material.fogStart = fogStart;
    });
  materialFolder.add(materialConfig, 'fogEnd', 0, 1000).onChange((fogEnd) => {
    cylinder.style.material.fogEnd = fogEnd;
  });
  materialFolder.open();
})();
