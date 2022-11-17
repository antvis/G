import { Canvas, CanvasEvent, Circle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Plugin as PluginRoughCanvasRenderer } from '@antv/g-plugin-rough-canvas-renderer';
import { Plugin as PluginRoughSVGRenderer } from '@antv/g-plugin-rough-svg-renderer';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

const canvasRenderer = new CanvasRenderer();
canvasRenderer.registerPlugin(new PluginRoughCanvasRenderer());
const svgRenderer = new SVGRenderer();
svgRenderer.registerPlugin(new PluginRoughSVGRenderer());

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
  const circle = new Circle({
    style: {
      cx: 200,
      cy: 200,
      r: 100,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
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

  const folder = gui.addFolder('rough-options');
  const config = {
    roughness: 1,
    bowing: 1,
    fillStyle: 'hachure',
    fillWeight: 4 / 2,
    hachureAngle: -41,
    hachureGap: 4 * 4,
    curveStepCount: 9,
    curveFitting: 0.95,
    simplification: 0,
    lineDash: 0,
    lineDashOffset: 0,
    fillLineDash: 0,
    fillLineDashOffset: 0,
    disableMultiStroke: false,
    disableMultiStrokeFill: false,
    dashOffset: 4 * 4,
    dashGap: 4 * 4,
    zigzagOffset: 4 * 4,
  };
  folder.add(config, 'roughness', 0, 10).onChange((roughness) => {
    circle.style.roughness = roughness;
  });
  folder.add(config, 'bowing', 0, 10).onChange((bowing) => {
    circle.style.bowing = bowing;
  });
  folder
    .add(config, 'fillStyle', [
      'hachure',
      'solid',
      'zigzag',
      'cross-hatch',
      'dots',
      'dashed',
      'zigzag-line',
    ])
    .onChange((fillStyle) => {
      circle.style.fillStyle = fillStyle;
    });
  folder.add(config, 'fillWeight', 0, 20).onChange((fillWeight) => {
    circle.style.fillWeight = fillWeight;
  });
  folder.add(config, 'hachureAngle', -50, 50).onChange((hachureAngle) => {
    circle.style.hachureAngle = hachureAngle;
  });
  folder.add(config, 'hachureGap', 0, 20).onChange((hachureGap) => {
    circle.style.hachureGap = hachureGap;
  });
  folder.add(config, 'curveStepCount', 0, 20).onChange((curveStepCount) => {
    circle.style.curveStepCount = curveStepCount;
  });
  folder.add(config, 'curveFitting', 0, 1).onChange((curveFitting) => {
    circle.style.curveFitting = curveFitting;
  });
  folder.add(config, 'lineDash', 0, 20).onChange((lineDash) => {
    circle.style.lineDash = [lineDash, lineDash];
  });
  folder.add(config, 'lineDashOffset', 0, 20).onChange((lineDashOffset) => {
    circle.style.lineDashOffset = lineDashOffset;
  });
  folder.add(config, 'fillLineDash', 0, 20).onChange((fillLineDash) => {
    circle.style.fillLineDash = [fillLineDash, fillLineDash];
  });
  folder
    .add(config, 'fillLineDashOffset', 0, 20)
    .onChange((fillLineDashOffset) => {
      circle.style.fillLineDashOffset = fillLineDashOffset;
    });
  folder.add(config, 'disableMultiStroke').onChange((disableMultiStroke) => {
    circle.style.disableMultiStroke = disableMultiStroke;
  });
  folder
    .add(config, 'disableMultiStrokeFill')
    .onChange((disableMultiStrokeFill) => {
      circle.style.disableMultiStrokeFill = disableMultiStrokeFill;
    });
  folder.add(config, 'simplification', 0, 1).onChange((simplification) => {
    circle.style.simplification = simplification;
  });
  folder.add(config, 'dashOffset', 0, 30).onChange((dashOffset) => {
    circle.style.dashOffset = dashOffset;
  });
  folder.add(config, 'dashGap', 0, 30).onChange((dashGap) => {
    circle.style.dashGap = dashGap;
  });
  folder.add(config, 'zigzagOffset', 0, 30).onChange((zigzagOffset) => {
    circle.style.zigzagOffset = zigzagOffset;
  });

  folder.open();
});
