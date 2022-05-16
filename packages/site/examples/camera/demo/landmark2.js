import { Canvas, Circle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const camera = canvas.getCamera();

// create landmarks
camera.createLandmark('reset', {
  position: [300, 250],
  focalPoint: [300, 250],
  zoom: 1,
});
camera.createLandmark('look at red circle', {
  position: [200, 200],
  focalPoint: [200, 200],
  zoom: 2,
  roll: 30,
});
camera.createLandmark('look at green circle', {
  position: [400, 400],
  focalPoint: [400, 400],
  zoom: 2,
});

const circle1 = new Circle({
  style: {
    cx: 200,
    cy: 200,
    r: 50,
    fill: 'red',
  },
});
const circle2 = circle1.cloneNode();
circle2.setPosition(400, 400);
circle2.style.fill = 'green';

canvas.appendChild(circle1);
canvas.appendChild(circle2);

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.on('afterrender', () => {
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
rendererFolder.add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg']).onChange((renderer) => {
  canvas.setRenderer(
    renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
  );
});
rendererFolder.open();

const cameraFolder = gui.addFolder('camera landmarks');
const cameraConfig = {
  goToMark1: () => {
    camera.gotoLandmark('reset', {
      duration: 1000,
      easing: 'ease-in',
      onfinish: () => {
        console.log('reset finished');
      },
    });
  },
  goToMark2: () => {
    camera.gotoLandmark('look at red circle', {
      duration: 300,
      easing: 'linear',
    });
  },
  goToMark3: () => {
    camera.gotoLandmark('look at green circle', {
      duration: 300,
      easing: 'linear',
    });
  },
};
cameraFolder.add(cameraConfig, 'goToMark1').name('reset');
cameraFolder.add(cameraConfig, 'goToMark2').name('look at red circle');
cameraFolder.add(cameraConfig, 'goToMark3').name('look at green circle');
cameraFolder.open();
