import {
  Canvas,
  CanvasEvent,
  CSS,
  CustomElement,
  Polyline,
  PropertySyntax,
} from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const svgRenderer = new SVGRenderer();
const webglRenderer = new WebGLRenderer();
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

// register custom property
CSS.registerProperty({
  name: 'myNumber',
  syntax: PropertySyntax.NUMBER,
  initialValue: '0',
  interpolable: true,
});
CSS.registerProperty({
  name: 'myAngle',
  syntax: PropertySyntax.ANGLE,
  initialValue: '0',
  interpolable: true,
});
CSS.registerProperty({
  name: 'myLength',
  syntax: PropertySyntax.LENGTH,
  initialValue: '0',
  interpolable: true,
});
CSS.registerProperty({
  name: 'myLengthOrPercentage',
  syntax: PropertySyntax.LENGTH_PERCENTAGE,
  initialValue: '0',
  interpolable: true,
});

class MyCustomElement extends CustomElement {
  connectedCallback() {
    this.appendChild(
      new Polyline({ style: { points: '100,100 200,200', stroke: 'red' } }),
    );
  }
}
const myCustomElement = new MyCustomElement();

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(myCustomElement);

  const animation = myCustomElement.animate(
    [
      {
        myAngle: '20deg',
        myLength: '10px',
        myNumber: 0,
        myLengthOrPercentage: '50%',
      },
      {
        myAngle: '10deg',
        myLength: '20px',
        myNumber: 1,
        myLengthOrPercentage: '100%',
      },
    ],
    { duration: 2000, fill: 'both' },
  );

  if (animation) {
    animation.onframe = () => {
      console.log(
        myCustomElement.style.myAngle,
        myCustomElement.style.myLength,
        myCustomElement.style.myNumber,
        myCustomElement.style.myLengthOrPercentage,
      );
    };
  }
});

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
  .add(rendererConfig, 'renderer', ['canvas', 'svg', 'webgl', 'webgpu'])
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
    }
    canvas.setRenderer(renderer);
  });
rendererFolder.open();
