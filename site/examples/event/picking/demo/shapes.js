import {
  Canvas,
  CanvasEvent,
  Circle,
  Ellipse,
  Image,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
  Text,
} from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
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
const canvaskitRenderer = new CanvaskitRenderer({
  wasmDir: '/',
  fonts: [
    {
      name: 'Roboto',
      url: '/Roboto-Regular.ttf',
    },
    {
      name: 'sans-serif',
      url: 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/file/A*064aSK2LUPEAAAAAAAAAAAAADmJ7AQ/NotoSansCJKsc-VF.ttf',
    },
  ],
});

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const circle = new Circle({
  style: {
    r: 50,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    cursor: 'pointer',
  },
});
const ellipse = new Ellipse({
  style: {
    rx: 60,
    ry: 80,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    cursor: 'pointer',
  },
});
const rect = new Rect({
  style: {
    width: 80,
    height: 60,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    radius: 8,
    cursor: 'pointer',
  },
});
const image = new Image({
  style: {
    width: 100,
    height: 100,
    src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    cursor: 'pointer',
  },
});
const line = new Line({
  style: {
    x1: 0,
    y1: 0,
    x2: 200,
    y2: 0,
    stroke: '#1890FF',
    lineWidth: 10,
    cursor: 'pointer',
  },
});
const polyline = new Polyline({
  style: {
    points: [
      [50, 50],
      [100, 50],
      [100, 100],
      [150, 100],
      [150, 150],
      [200, 150],
      [200, 200],
      [250, 200],
    ],
    stroke: '#1890FF',
    lineWidth: 10,
    cursor: 'pointer',
  },
});
const path = new Path({
  style: {
    d:
      'M 100,300' +
      'l 50,-25' +
      'a25,25 -30 0,1 50,-25' +
      'l 50,-25' +
      'a25,50 -30 0,1 50,-25' +
      'l 50,-25' +
      'a25,75 -30 0,1 50,-25' +
      'l 50,-25' +
      'a25,100 -30 0,1 50,-25' +
      'l 50,-25' +
      'l 0, 200,' +
      'z',
    lineWidth: 10,
    lineJoin: 'round',
    stroke: '#1890FF',
    cursor: 'pointer',
  },
});
const polygon = new Polygon({
  style: {
    points: [
      [200, 100],
      [400, 100],
      [400 + 200 * Math.sin(Math.PI / 6), 100 + 200 * Math.cos(Math.PI / 6)],
      [400, 100 + 200 * Math.cos(Math.PI / 6) * 2],
      [200, 100 + 200 * Math.cos(Math.PI / 6) * 2],
      [200 - 200 * Math.sin(Math.PI / 6), 100 + 200 * Math.cos(Math.PI / 6)],
    ],
    stroke: '#1890FF',
    fill: '#1890FF',
    lineWidth: 10,
    cursor: 'pointer',
  },
});
const text = new Text({
  style: {
    fontFamily: 'PingFang SC',
    text: '这是测试文本',
    fontSize: 40,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 5,
    cursor: 'pointer',
  },
});
const clippedText = new Text({
  style: {
    fontFamily: 'PingFang SC',
    text: '这是测试文本',
    fontSize: 40,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 5,
    clipPath: new Circle({
      style: {
        cx: 20,
        cy: -10,
        r: 20,
      },
    }),
    cursor: 'pointer',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  circle.setPosition(100, 100);
  canvas.appendChild(circle);

  ellipse.setPosition(220, 100);
  canvas.appendChild(ellipse);

  rect.setPosition(300, 100);
  canvas.appendChild(rect);

  image.setPosition(400, 100);
  canvas.appendChild(image);

  line.setPosition(100, 200);
  canvas.appendChild(line);

  polyline.setPosition(0, 200);
  polyline.rotate(20);
  canvas.appendChild(polyline);

  path.translate(60, 100);
  path.rotate(20);
  path.scale(0.5);
  canvas.appendChild(path);

  polygon.setPosition(340, 200);
  polygon.scale(0.3);
  canvas.appendChild(polygon);

  text.setPosition(160, 450);
  canvas.appendChild(text);

  clippedText.setPosition(160, 500);
  canvas.appendChild(clippedText);

  circle.addEventListener('mouseenter', () => {
    circle.style.fill = '#2FC25B';
  });
  circle.addEventListener('mouseleave', () => {
    circle.style.fill = '#1890FF';
  });
  ellipse.addEventListener('mouseenter', () => {
    ellipse.style.fill = '#2FC25B';
  });
  ellipse.addEventListener('mouseleave', () => {
    ellipse.style.fill = '#1890FF';
  });
  rect.addEventListener('mouseenter', () => {
    rect.style.fill = '#2FC25B';
  });
  rect.addEventListener('mouseleave', () => {
    rect.style.fill = '#1890FF';
  });
  line.addEventListener('mouseenter', () => {
    line.style.stroke = '#2FC25B';
  });
  line.addEventListener('mouseleave', () => {
    line.style.stroke = '#1890FF';
  });
  polyline.addEventListener('mouseenter', () => {
    polyline.style.stroke = '#2FC25B';
  });
  polyline.addEventListener('mouseleave', () => {
    polyline.style.stroke = '#1890FF';
  });
  path.addEventListener('mouseenter', () => {
    path.style.stroke = '#2FC25B';
  });
  path.addEventListener('mouseleave', () => {
    path.style.stroke = '#1890FF';
  });
  polygon.addEventListener('mouseenter', () => {
    polygon.style.stroke = '#2FC25B';
  });
  polygon.addEventListener('mouseleave', () => {
    polygon.style.stroke = '#1890FF';
  });
  text.addEventListener('mouseenter', () => {
    text.attr('stroke', '#2FC25B');
  });
  text.addEventListener('mouseleave', () => {
    text.attr('stroke', '#F04864');
  });
  clippedText.addEventListener('mouseenter', () => {
    clippedText.attr('stroke', '#2FC25B');
  });
  clippedText.addEventListener('mouseleave', () => {
    clippedText.attr('stroke', '#F04864');
  });
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
canvas.addEventListener('afterrender', () => {
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
