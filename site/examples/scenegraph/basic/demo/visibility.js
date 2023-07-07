import { Canvas, CanvasEvent, Circle, Group } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

/**
solarSystem
   |    |
   |   sun
   |
 earthOrbit
   |    |
   |  earth
   |
  moonOrbit
      |
     moon
 */

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
  const earth = new Circle({
    id: 'earth',
    style: {
      r: 50,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    },
  });
  const moon = new Circle({
    id: 'moon',
    style: {
      r: 25,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    },
  });

  solarSystem.appendChild(sun);
  solarSystem.appendChild(earthOrbit);
  earthOrbit.appendChild(earth);
  earthOrbit.appendChild(moonOrbit);
  moonOrbit.appendChild(moon);

  solarSystem.setPosition(300, 250);
  earthOrbit.translate(100, 0);
  moonOrbit.translate(50, 0);

  canvas.appendChild(solarSystem);

  // use AntV G devtools
  window.__g_instances__ = [canvas];

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

  const sunFolder = gui.addFolder('sun');
  const sunConfig = {
    show: () => {
      sun.attr('visibility', 'visible');
    },
    hide: () => {
      sun.attr('visibility', 'hidden');
    },
    'z-index': 0,
  };
  sunFolder.add(sunConfig, 'hide').name('hide');
  sunFolder.add(sunConfig, 'show').name('show');
  sunFolder.add(sunConfig, 'z-index', 0, 100).onChange((zIndex) => {
    sun.style.zIndex = zIndex;
  });
  sunFolder.open();

  const earthFolder = gui.addFolder('earth');
  const earthConfig = {
    show: () => {
      earth.attr('visibility', 'visible');
    },
    hide: () => {
      earth.attr('visibility', 'hidden');
    },
    'z-index': 0,
  };
  earthFolder.add(earthConfig, 'hide').name('hide');
  earthFolder.add(earthConfig, 'show').name('show');
  earthFolder.add(earthConfig, 'z-index', 0, 100).onChange((zIndex) => {
    earth.style.zIndex = zIndex;
  });

  const moonFolder = gui.addFolder('moon');
  const moonConfig = {
    show: () => {
      moon.attr('visibility', 'visible');
    },
    hide: () => {
      moon.attr('visibility', 'hidden');
    },
  };
  moonFolder.add(moonConfig, 'hide').name('hide');
  moonFolder.add(moonConfig, 'show').name('show');

  const earthOrbitFolder = gui.addFolder('earthOrbit');
  const earthOrbitConfig = {
    show: () => {
      earthOrbit.attr('visibility', 'visible');
    },
    hide: () => {
      earthOrbit.attr('visibility', 'hidden');
    },
    'z-index': 0,
  };
  earthOrbitFolder.add(earthOrbitConfig, 'hide').name('hide');
  earthOrbitFolder.add(earthOrbitConfig, 'show').name('show');
  earthOrbitFolder
    .add(earthOrbitConfig, 'z-index', 0, 100)
    .onChange((zIndex) => {
      earthOrbit.style.zIndex = zIndex;
    });

  const moonOrbitFolder = gui.addFolder('moonOrbit');
  const moonOrbitConfig = {
    show: () => {
      moonOrbit.attr('visibility', 'visible');
    },
    hide: () => {
      moonOrbit.attr('visibility', 'hidden');
    },
    'z-index': 0,
  };
  moonOrbitFolder.add(moonOrbitConfig, 'hide').name('hide');
  moonOrbitFolder.add(moonOrbitConfig, 'show').name('show');
  moonOrbitFolder.add(moonOrbitConfig, 'z-index', 0, 100).onChange((zIndex) => {
    moonOrbit.style.zIndex = zIndex;
  });
});
