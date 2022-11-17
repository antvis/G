import { Canvas, CanvasEvent, Circle, Text } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Plugin } from '@antv/g-plugin-dragndrop';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const canvasRenderer = new CanvasRenderer();
canvasRenderer.registerPlugin(new Plugin());
const webglRenderer = new WebGLRenderer();
webglRenderer.registerPlugin(new Plugin());
const svgRenderer = new SVGRenderer();
svgRenderer.registerPlugin(new Plugin());

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
  // add a circle to canvas
  const circle = new Circle({
    id: 'circle',
    style: {
      draggable: true,
      fill: 'rgb(239, 244, 255)',
      fillOpacity: 1,
      lineWidth: 1,
      opacity: 1,
      r: 100,
      stroke: 'rgb(95, 149, 255)',
      strokeOpacity: 1,
      cursor: 'pointer',
    },
  });

  const text = new Text({
    id: 'text',
    style: {
      draggable: true,
      fill: '#000',
      fillOpacity: 0.9,
      font: `normal normal normal 12px Avenir, -apple-system, system-ui, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
      // fontFamily: `Avenir, -apple-system, system-ui, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
      // fontFamily: 'Arial, sans-serif',
      // fontFamily: 'sans-serif',
      fontFamily: 'Avenir',
      // fontFamily: 'Times',
      // fontFamily: 'Microsoft YaHei',
      fontSize: 22,
      fontStyle: 'normal',
      fontVariant: 'normal',
      fontWeight: 'normal',
      lineWidth: 1,
      opacity: 1,
      strokeOpacity: 1,
      text: 'Drag me',
      textAlign: 'center',
      textBaseline: 'middle',
    },
  });

  circle.appendChild(text);
  canvas.appendChild(circle);
  circle.setPosition(300, 200);

  // handle dragging
  let shiftX = 0;
  let shiftY = 0;
  function moveAt(target, canvasX, canvasY) {
    target.setPosition(canvasX - shiftX, canvasY - shiftY);
  }
  circle.addEventListener('dragstart', function (e) {
    circle.style.opacity = 0.5;
    text.style.text = 'Drag me';

    const [x, y] = e.target.getPosition();
    shiftX = e.canvasX - x;
    shiftY = e.canvasY - y;

    moveAt(circle, e.canvasX, e.canvasY);

    console.log('dragstart...');
  });
  circle.addEventListener('drag', function (e) {
    moveAt(circle, e.canvasX, e.canvasY);
    text.style.text = `Dragging...`;
  });
  circle.addEventListener('dragend', function (e) {
    circle.style.opacity = 1;
    text.style.text = 'Drag me';

    console.log('dragend...');
  });
  circle.addEventListener('click', function (e) {
    console.log('click...');
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
    clone: () => {
      const cloned = circle.cloneNode(rendererConfig.deep);
      canvas.appendChild(cloned);
      cloned.toBack();
      cloned.translateLocal(10, 10);
    },
    deep: false,
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
  rendererFolder.add(rendererConfig, 'clone');
  rendererFolder.add(rendererConfig, 'deep');
  rendererFolder.open();

  const circleFolder = gui.addFolder('circle');
  const circleConfig = {
    r: 100,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    fillOpacity: 1,
    strokeOpacity: 1,
    anchorX: 0.5,
    anchorY: 0.5,
    shadowColor: '#000',
    shadowBlur: 20,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
  };
  circleFolder.add(circleConfig, 'r', 50, 200).onChange((radius) => {
    circle.style.r = radius;
  });
  circleFolder.addColor(circleConfig, 'fill').onChange((color) => {
    circle.style.fill = color;
  });
  circleFolder.addColor(circleConfig, 'stroke').onChange((color) => {
    circle.attr('stroke', color);
  });
  circleFolder.addColor(circleConfig, 'shadowColor').onChange((color) => {
    circle.attr('shadowColor', color);
  });
  circleFolder
    .add(circleConfig, 'shadowBlur', 0, 100)
    .onChange((shadowBlur) => {
      circle.style.shadowBlur = shadowBlur;
    });
  circleFolder
    .add(circleConfig, 'shadowOffsetX', -50, 50)
    .onChange((shadowOffsetX) => {
      circle.style.shadowOffsetX = shadowOffsetX;
    });
  circleFolder
    .add(circleConfig, 'shadowOffsetY', -50, 50)
    .onChange((shadowOffsetY) => {
      circle.style.shadowOffsetY = shadowOffsetY;
    });
  circleFolder.add(circleConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
    circle.attr('lineWidth', lineWidth);
  });
  circleFolder
    .add(circleConfig, 'fillOpacity', 0, 1, 0.1)
    .onChange((opacity) => {
      circle.attr('fillOpacity', opacity);
    });
  circleFolder
    .add(circleConfig, 'strokeOpacity', 0, 1, 0.1)
    .onChange((opacity) => {
      circle.attr('strokeOpacity', opacity);
    });
  circleFolder.add(circleConfig, 'anchorX', 0, 1, 0.1).onChange((anchorX) => {
    circle.attr('anchor', [anchorX, circleConfig.anchorY]);
  });
  circleFolder.add(circleConfig, 'anchorY', 0, 1, 0.1).onChange((anchorY) => {
    circle.attr('anchor', [circleConfig.anchorX, anchorY]);
  });
});
