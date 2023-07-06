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
  moonOrbit.translate(100, 0);

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
    .add(rendererConfig, 'renderer', [
      'canvas',
      'svg',
      'webgl',
      'webgpu',
      'canvaskit',
    ])
    .onChange((rendererName) => {
      let renderer;
      if (rendererName === 'canvas') {
        renderer = canvasRenderer;
      } else if (rendererName === 'svg') {
        renderer = svgRenderer;
      } else if (rendererName === 'webgl') {
        renderer = webglRenderer;
      } else if (rendererName === 'webgpu') {
        renderer = webgpuRenderer;
      } else if (rendererName === 'canvaskit') {
        renderer = canvaskitRenderer;
      }
      canvas.setRenderer(renderer);
    });
  rendererFolder.open();

  const sunFolder = gui.addFolder('sun');
  const sunConfig = {
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    fillOpacity: 1,
    strokeOpacity: 1,
    visibility: true,
    'z-index': 0,
  };
  sunFolder.add(sunConfig, 'r', 50, 200).onChange((radius) => {
    sun.attr('r', radius);
  });
  sunFolder.addColor(sunConfig, 'fill').onChange((color) => {
    sun.attr('fill', color);
  });
  sunFolder.addColor(sunConfig, 'stroke').onChange((color) => {
    sun.attr('stroke', color);
  });
  sunFolder.add(sunConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
    sun.attr('lineWidth', lineWidth);
  });
  sunFolder.add(sunConfig, 'fillOpacity', 0, 1, 0.1).onChange((opacity) => {
    sun.attr('fillOpacity', opacity);
  });
  sunFolder.add(sunConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
    sun.attr('strokeOpacity', opacity);
  });
  sunFolder.add(sunConfig, 'visibility').onChange((visible) => {
    if (visible) {
      sun.show();
    } else {
      sun.hide();
    }
  });
  sunFolder.add(sunConfig, 'z-index', 0, 100).onChange((zIndex) => {
    sun.setZIndex(zIndex);
  });
  sunFolder.open();

  const earthFolder = gui.addFolder('earth');
  const earthConfig = {
    r: 50,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    fillOpacity: 1,
    strokeOpacity: 1,
    visibility: true,
  };
  earthFolder.add(earthConfig, 'r', 50, 200).onChange((radius) => {
    earth.attr('r', radius);
  });
  earthFolder.addColor(earthConfig, 'fill').onChange((color) => {
    earth.attr('fill', color);
  });
  earthFolder.addColor(earthConfig, 'stroke').onChange((color) => {
    earth.attr('stroke', color);
  });
  earthFolder.add(earthConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
    earth.attr('lineWidth', lineWidth);
  });
  earthFolder.add(earthConfig, 'fillOpacity', 0, 1, 0.1).onChange((opacity) => {
    earth.attr('fillOpacity', opacity);
  });
  earthFolder
    .add(earthConfig, 'strokeOpacity', 0, 1, 0.1)
    .onChange((opacity) => {
      earth.attr('strokeOpacity', opacity);
    });
  earthFolder.add(earthConfig, 'visibility').onChange((visible) => {
    if (visible) {
      earth.show();
    } else {
      earth.hide();
    }
  });

  const moonFolder = gui.addFolder('moon');
  const moonConfig = {
    r: 25,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    fillOpacity: 1,
    strokeOpacity: 1,
    visibility: true,
  };
  moonFolder.add(moonConfig, 'r', 50, 200).onChange((radius) => {
    moon.attr('r', radius);
  });
  moonFolder.addColor(moonConfig, 'fill').onChange((color) => {
    moon.attr('fill', color);
  });
  moonFolder.addColor(moonConfig, 'stroke').onChange((color) => {
    moon.attr('stroke', color);
  });
  moonFolder.add(moonConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
    moon.attr('lineWidth', lineWidth);
  });
  moonFolder.add(moonConfig, 'fillOpacity', 0, 1, 0.1).onChange((opacity) => {
    moon.attr('fillOpacity', opacity);
  });
  moonFolder.add(moonConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
    moon.attr('strokeOpacity', opacity);
  });
  moonFolder.add(moonConfig, 'visibility').onChange((visible) => {
    if (visible) {
      moon.show();
    } else {
      moon.hide();
    }
  });

  const earthOrbitFolder = gui.addFolder('earthOrbit');
  const earthOrbitConfig = {
    visibility: true,
    'z-index': 0,
  };
  earthOrbitFolder.add(earthOrbitConfig, 'visibility').onChange((visible) => {
    if (visible) {
      earthOrbit.show();
    } else {
      earthOrbit.hide();
    }
  });
  earthOrbitFolder
    .add(earthOrbitConfig, 'z-index', 0, 100)
    .onChange((zIndex) => {
      earthOrbit.setZIndex(zIndex);
    });

  const moonOrbitFolder = gui.addFolder('moonOrbit');
  const moonOrbitConfig = {
    visibility: true,
    'z-index': 0,
  };
  moonOrbitFolder.add(moonOrbitConfig, 'visibility').onChange((visible) => {
    if (visible) {
      moonOrbit.show();
    } else {
      moonOrbit.hide();
    }
  });
  moonOrbitFolder.add(moonOrbitConfig, 'z-index', 0, 100).onChange((zIndex) => {
    moonOrbit.setZIndex(zIndex);
  });

  // zIndexFolder.add(zIndexConfig, 'bringToFront').onChange((toFront) => {
  //   if (toFront) {
  //     sun.toFront();
  //   } else {
  //     sun.toBack();
  //   }
  // });
});
