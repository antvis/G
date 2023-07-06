import { Canvas, CanvasEvent, Circle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Plugin as PluginRoughCanvasRenderer } from '@antv/g-plugin-zdog-canvas-renderer';
import { Plugin as PluginRoughSvgRenderer } from '@antv/g-plugin-zdog-svg-renderer';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const canvasRenderer = new CanvasRenderer();
canvasRenderer.registerPlugin(new PluginRoughCanvasRenderer());
const svgRenderer = new SVGRenderer();
svgRenderer.registerPlugin(new PluginRoughSvgRenderer());

// create a canvas & use `g-canvas`
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
  /**
   * Circle
   */
  const circle = new Circle({
    style: {
      cx: 150,
      cy: 100,
      r: 50,
      fill: '#1890FF',
      stroke: '#F04864',
      strokeOpacity: 0.5,
      lineWidth: 4,
      cursor: 'pointer',
    },
  });
  canvas.appendChild(circle);

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
    .add(rendererConfig, 'renderer', ['canvas', 'svg'])
    .onChange((renderer) => {
      canvas.setRenderer(renderer === 'canvas' ? canvasRenderer : svgRenderer);
    });
  rendererFolder.open();
});
