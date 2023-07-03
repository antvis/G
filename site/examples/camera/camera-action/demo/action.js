import { Canvas, CanvasEvent, Circle, Group, Text } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();
const canvaskitRenderer = new CanvaskitRenderer({
  wasmDir: '/',
  fonts: [
    {
      name: 'sans-serif',
      url: 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/file/A*064aSK2LUPEAAAAAAAAAAAAADmJ7AQ/NotoSansCJKsc-VF.ttf',
    },
  ],
});
const webgpuRenderer = new WebGPURenderer({
  shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

// get camera
const camera = canvas.getCamera();

canvas.addEventListener(CanvasEvent.READY, () => {
  const solarSystem = new Group({
    id: 'solarSystem',
  });
  const earthOrbit = new Group({
    id: 'earthOrbit',
  });
  const moonOrbit = new Group({
    id: 'moonOrbit',
  });

  const sun = new Circle({
    id: 'sun',
    style: {
      r: 100,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    },
  });
  const sunLabel = new Text({
    style: {
      fontSize: 30,
      text: 'Sun',
      fill: 'white',
      textAlign: 'center',
      textBaseline: 'middle',
    },
  });
  sun.appendChild(sunLabel);
  const earth = new Circle({
    id: 'earth',
    style: {
      r: 50,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    },
  });
  const earthLabel = new Text({
    style: {
      fontSize: 20,
      text: 'Earth',
      fill: 'white',
      textAlign: 'center',
      textBaseline: 'middle',
    },
  });
  earth.appendChild(earthLabel);
  const moon = new Circle({
    id: 'moon',
    style: {
      r: 25,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    },
  });
  const moonLabel = new Text({
    style: {
      fontSize: 10,
      text: 'Moon',
      fill: 'white',
      textAlign: 'center',
      textBaseline: 'middle',
    },
  });
  moon.appendChild(moonLabel);

  solarSystem.appendChild(sun);
  solarSystem.appendChild(earthOrbit);
  earthOrbit.appendChild(earth);
  earthOrbit.appendChild(moonOrbit);
  moonOrbit.appendChild(moon);

  solarSystem.setPosition(300, 250);
  earthOrbit.translate(100, 0);
  moonOrbit.translate(100, 0);

  canvas.appendChild(solarSystem);

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
    solarSystem.rotateLocal(1);
    earthOrbit.rotateLocal(2);
  });

  // GUI
  const gui = new lil.GUI({ autoPlace: false });
  $wrapper.appendChild(gui.domElement);
  const rendererFolder = gui.addFolder('renderer');
  const rendererConfig = {
    renderer: 'canvas',
  };
  rendererFolder
    .add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg'])
    .onChange((renderer) => {
      canvas.setRenderer(
        renderer === 'canvas'
          ? canvasRenderer
          : renderer === 'webgl'
          ? webglRenderer
          : svgRenderer,
      );
    });
  rendererFolder.open();

  const cameraFolder = gui.addFolder('camera actions');
  const cameraConfig = {
    panX: 0,
    panY: 0,
    zoom: 1,
    roll: 0,
  };

  const origin = camera.getPosition();
  cameraFolder.add(cameraConfig, 'panX', -300, 300).onChange((panX) => {
    const current = camera.getPosition();
    camera.pan(origin[0] + panX - current[0], 0);
  });
  cameraFolder.add(cameraConfig, 'panY', -300, 300).onChange((panY) => {
    const current = camera.getPosition();
    camera.pan(0, origin[1] + panY - current[1]);
  });
  cameraFolder.add(cameraConfig, 'roll', -90, 90).onChange((roll) => {
    camera.rotate(0, 0, roll);
  });
  cameraFolder.add(cameraConfig, 'zoom', 0, 10).onChange((zoom) => {
    camera.setZoom(zoom);
  });
  cameraFolder.open();
});
