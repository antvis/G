import {
  Canvas,
  CanvasEvent,
  Circle,
  convertToPath,
  Ellipse,
  Group,
  Image,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
  Text,
} from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Plugin as PluginRoughCanvasRenderer } from '@antv/g-plugin-rough-canvas-renderer';
import { Plugin as PluginRoughSVGRenderer } from '@antv/g-plugin-rough-svg-renderer';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as lil from 'lil-gui';
import Stats from 'stats.js';
import WebFont from 'webfontloader';

// create a renderer
const canvasRenderer = new CanvasRenderer();
canvasRenderer.registerPlugin(new PluginRoughCanvasRenderer());
const svgRenderer = new SVGRenderer();
svgRenderer.registerPlugin(new PluginRoughSVGRenderer());

// create a canvas & use `g-canvas`
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
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

  /**
   * Ellipse
   */
  const ellipse = new Ellipse({
    style: {
      cx: 150,
      cy: 100,
      rx: 25,
      ry: 15,
      fill: '#1890FF',
      stroke: '#F04864',
      strokeOpacity: 0.5,
      lineWidth: 4,
      cursor: 'pointer',
    },
  });
  canvas.appendChild(ellipse);

  /**
   * Rect
   */
  const rect = new Rect({
    style: {
      x: 50,
      y: 50,
      width: 50,
      height: 50,
      fill: '#1890FF',
      fillOpacity: 0.5,
      stroke: '#F04864',
      lineWidth: 4,
      bowing: 4,
      cursor: 'pointer',
    },
  });
  canvas.appendChild(rect);
  rect.addEventListener('pointerenter', function () {
    rect.style.fill = 'yellow';
  });
  rect.addEventListener('pointerleave', function () {
    rect.style.fill = '#1890FF';
  });

  /**
   * Line
   */
  const line = new Line({
    style: {
      x1: 50,
      y1: 120,
      x2: 50,
      y2: 200,
      stroke: '#F04864',
      lineWidth: 4,
      cursor: 'pointer',
    },
  });
  canvas.appendChild(line);

  /**
   * Polyline
   */
  const polyline = new Polyline({
    style: {
      points: [
        [50, 250],
        [50, 300],
        [100, 300],
        [100, 350],
      ],
      stroke: '#F04864',
      lineWidth: 4,
      cursor: 'pointer',
    },
  });
  canvas.appendChild(polyline);

  /**
   * Polygon
   */
  const polygon = new Polygon({
    style: {
      points: [
        [50, 400],
        [100, 400],
        [100, 450],
      ],
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
      cursor: 'pointer',
    },
  });
  canvas.appendChild(polygon);

  /**
   * Path
   */
  const rectPath = convertToPath(
    new Rect({
      style: {
        x: 100,
        y: 0,
        width: 200,
        height: 100,
        transformOrigin: 'center',
      },
    }),
  );
  const starPath = new Path({
    style: {
      path: 'M301.113,12.011l99.25,179.996l201.864,38.778L461.706,380.808l25.508,203.958l-186.101-87.287L115.01,584.766l25.507-203.958L0,230.785l201.86-38.778L301.113,12.011',
    },
  });
  starPath.translate(200, 0);
  starPath.scale(0.2);
  const pathG = new Path({
    style: {
      path: rectPath,
      lineWidth: 2,
      cursor: 'pointer',
    },
  });
  canvas.appendChild(pathG);
  pathG.animate(
    [
      { path: rectPath, stroke: '#F04864', fill: 'blue' },
      { path: convertToPath(starPath), stroke: 'blue', fill: '#F04864' },
    ],
    {
      duration: 2500,
      easing: 'ease',
      iterations: Infinity,
      direction: 'alternate',
    },
  );
  pathG.translate(300, 0);

  /**
   * Text
   */
  WebFont.load({
    google: {
      families: ['Gaegu'],
    },
    active: () => {
      const text = new Text({
        style: {
          x: 100,
          y: 450,
          fontFamily: 'Gaegu',
          text: 'Almost before we knew it, we had left the ground.',
          fontSize: 30,
          fill: '#1890FF',
          stroke: '#F04864',
          lineWidth: 5,
          cursor: 'pointer',
        },
      });
      canvas.appendChild(text);
    },
  });

  const image = new Image({
    style: {
      x: 90,
      y: 130,
      width: 100,
      height: 100,
      img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    },
  });
  canvas.appendChild(image);

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
    .add(rendererConfig, 'renderer', ['canvas', 'svg'])
    .onChange((renderer) => {
      canvas.setRenderer(renderer === 'canvas' ? canvasRenderer : svgRenderer);
    });
  rendererFolder.open();

  const sunFolder = gui.addFolder('sun');
  const sunConfig = {
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    visibility: true,
    'z-index': 0,
    opacity: 1,
    shadowColor: '#fff',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    fillStyle: 'hachure',
    fillWeight: 4 / 2,
    hachureAngle: -41,
    hachureGap: 4 * 4,
  };
  sunFolder.add(sunConfig, 'r', 50, 200).onChange((r) => {
    sun.style.r = r;
  });
  sunFolder.add(sunConfig, 'opacity', 0, 1).onChange((opacity) => {
    sun.style.opacity = opacity;
  });
  sunFolder.addColor(sunConfig, 'fill').onChange((color) => {
    sun.style.fill = color;
  });
  sunFolder.addColor(sunConfig, 'stroke').onChange((color) => {
    sun.style.stroke = color;
  });
  sunFolder.addColor(sunConfig, 'shadowColor').onChange((color) => {
    sun.style.shadowColor = color;
  });
  sunFolder.add(sunConfig, 'shadowBlur', 0, 100).onChange((shadowBlur) => {
    sun.style.shadowBlur = shadowBlur;
  });
  sunFolder
    .add(sunConfig, 'shadowOffsetX', -50, 50)
    .onChange((shadowOffsetX) => {
      sun.style.shadowOffsetX = shadowOffsetX;
    });
  sunFolder
    .add(sunConfig, 'shadowOffsetY', -50, 50)
    .onChange((shadowOffsetY) => {
      sun.style.shadowOffsetY = shadowOffsetY;
    });
  sunFolder.add(sunConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
    sun.style.lineWidth = lineWidth;
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
  sunFolder
    .add(sunConfig, 'fillStyle', [
      'hachure',
      'solid',
      'zigzag',
      'cross-hatch',
      'dots',
      'dashed',
      'zigzag-line',
    ])
    .onChange((fillStyle) => {
      sun.style.fillStyle = fillStyle;
    });
  sunFolder.add(sunConfig, 'fillWeight', 0, 20).onChange((fillWeight) => {
    sun.style.fillWeight = fillWeight;
  });
  sunFolder.add(sunConfig, 'hachureAngle', -50, 50).onChange((hachureAngle) => {
    sun.style.hachureAngle = hachureAngle;
  });
  sunFolder.add(sunConfig, 'hachureGap', 0, 20).onChange((hachureGap) => {
    sun.style.hachureAngle = hachureGap;
  });
  sunFolder.open();
});
