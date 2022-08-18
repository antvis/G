import { Canvas, CanvasEvent, Circle, Ellipse, Image, Line, Polyline, Rect } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Plugin as AnnotationPlugin } from '@antv/g-plugin-annotation';
import { Plugin as DragndropPlugin } from '@antv/g-plugin-dragndrop';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const svgRenderer = new SVGRenderer();
const webglRenderer = new WebGLRenderer();
const webgpuRenderer = new WebGPURenderer();
const canvaskitRenderer = new CanvaskitRenderer({
  wasmDir: '/',
  fonts: [
    {
      name: 'sans-serif',
      url: '/NotoSans-Regular.ttf',
    },
  ],
});

const annotationPlugin = new AnnotationPlugin({
  selectableStyle: {
    selectionFill: 'rgba(24,144,255,0.15)',
    selectionStroke: '#1890FF',
    selectionStrokeWidth: 2.5,
    anchorFill: '#1890FF',
    anchorStroke: '#1890FF',
  },
});
canvasRenderer.registerPlugin(annotationPlugin);
svgRenderer.registerPlugin(annotationPlugin);
webglRenderer.registerPlugin(annotationPlugin);
webgpuRenderer.registerPlugin(annotationPlugin);
canvaskitRenderer.registerPlugin(annotationPlugin);

const dragndropPlugin = new DragndropPlugin({
  dragstartDistanceThreshold: 10,
  dragstartTimeThreshold: 100,
});
canvasRenderer.registerPlugin(dragndropPlugin);
svgRenderer.registerPlugin(dragndropPlugin);
webglRenderer.registerPlugin(dragndropPlugin);
webgpuRenderer.registerPlugin(dragndropPlugin);
canvaskitRenderer.registerPlugin(dragndropPlugin);

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const circle = new Circle({
  style: {
    cx: 200,
    cy: 200,
    r: 100,
    stroke: '#F04864',
    lineWidth: 10,
    selectable: true,
  },
});

const ellipse = new Ellipse({
  style: {
    cx: 440,
    cy: 200,
    rx: 100,
    ry: 50,
    stroke: '#F04864',
    lineWidth: 10,
    selectable: true,
  },
});

const image = new Image({
  style: {
    x: 300,
    y: 280,
    width: 200,
    height: 200,
    src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    // transform: 'scale(0.5) rotate(30deg)',
    selectable: true,
  },
});
image.addEventListener('selected', () => {
  console.log('image selected');
});
image.addEventListener('deselected', () => {
  console.log('image deselected');
});

const rect = new Rect({
  style: {
    x: 100,
    y: 280,
    width: 100,
    height: 200,
    fill: 'blue',
    stroke: 'red',
    selectable: true,
  },
});

const line = new Line({
  style: {
    x1: 100,
    y1: 100,
    x2: 100,
    y2: 300,
    lineWidth: 10,
    stroke: 'red',
    selectable: true,
  },
});

const polyline = new Polyline({
  style: {
    points: [
      [200, 100],
      [300, 100],
      [300, 200],
      [300, 300],
    ],
    lineWidth: 10,
    stroke: 'red',
    selectable: true,
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(circle);
  canvas.appendChild(ellipse);
  canvas.appendChild(image);
  canvas.appendChild(rect);
  canvas.appendChild(line);
  canvas.appendChild(polyline);
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
  .add(rendererConfig, 'renderer', ['canvas', 'svg', 'webgl', 'webgpu', 'canvaskit'])
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

const selectableFolder = gui.addFolder('selectable');
const selectableConfig = {
  selectionFill: 'rgba(24,144,255,0.15)',
  selectionFillOpacity: 1,
  selectionStroke: '#1890FF',
  selectionStrokeOpacity: 1,
  selectionStrokeWidth: 2.5,
  selectionLineDash: 0,
  anchorFill: '#1890FF',
  anchorFillOpacity: 1,
  anchorStroke: '#1890FF',
  anchorStrokeOpacity: 1,
  anchorStrokeWidth: 1,
  anchorSize: 6,
};
selectableFolder.addColor(selectableConfig, 'selectionFill').onChange((selectionFill) => {
  annotationPlugin.updateSelectableStyle({
    selectionFill,
  });
});
selectableFolder
  .add(selectableConfig, 'selectionFillOpacity', 0, 1)
  .onChange((selectionFillOpacity) => {
    annotationPlugin.updateSelectableStyle({
      selectionFillOpacity,
    });
  });
selectableFolder.addColor(selectableConfig, 'selectionStroke').onChange((selectionStroke) => {
  annotationPlugin.updateSelectableStyle({
    selectionStroke,
  });
});
selectableFolder
  .add(selectableConfig, 'selectionStrokeOpacity', 0, 1)
  .onChange((selectionStrokeOpacity) => {
    annotationPlugin.updateSelectableStyle({
      selectionStrokeOpacity,
    });
  });
selectableFolder
  .add(selectableConfig, 'selectionStrokeWidth', 1, 20)
  .onChange((selectionStrokeWidth) => {
    annotationPlugin.updateSelectableStyle({
      selectionStrokeWidth,
    });
  });
selectableFolder.add(selectableConfig, 'selectionLineDash', 0, 20).onChange((selectionLineDash) => {
  annotationPlugin.updateSelectableStyle({
    selectionLineDash,
  });
});
selectableFolder.addColor(selectableConfig, 'anchorFill').onChange((anchorFill) => {
  annotationPlugin.updateSelectableStyle({
    anchorFill,
  });
});
selectableFolder.addColor(selectableConfig, 'anchorStroke').onChange((anchorStroke) => {
  annotationPlugin.updateSelectableStyle({
    anchorStroke,
  });
});
selectableFolder.add(selectableConfig, 'anchorSize', 5, 20).onChange((anchorSize) => {
  annotationPlugin.updateSelectableStyle({
    anchorSize,
  });
});
selectableFolder.add(selectableConfig, 'anchorStrokeWidth', 1, 20).onChange((anchorStrokeWidth) => {
  annotationPlugin.updateSelectableStyle({
    anchorStrokeWidth,
  });
});
selectableFolder.add(selectableConfig, 'anchorFillOpacity', 0, 1).onChange((anchorFillOpacity) => {
  annotationPlugin.updateSelectableStyle({
    anchorFillOpacity,
  });
});
selectableFolder
  .add(selectableConfig, 'anchorStrokeOpacity', 0, 1)
  .onChange((anchorStrokeOpacity) => {
    annotationPlugin.updateSelectableStyle({
      anchorStrokeOpacity,
    });
  });
selectableFolder.open();

const apiFolder = gui.addFolder('API');
const apiConfig = {
  selectDisplayObject: 'none',
  deselectDisplayObject: 'none',
  getSelectedDisplayObjects: () => {
    console.log(annotationPlugin.getSelectedDisplayObjects());
  },
};
apiFolder
  .add(apiConfig, 'selectDisplayObject', [
    'rect',
    'image',
    'circle',
    'ellipse',
    'line',
    'polyline',
    'none',
  ])
  .onChange((shape) => {
    let target;
    if (shape === 'rect') {
      target = rect;
    } else if (shape === 'image') {
      target = image;
    } else if (shape === 'circle') {
      target = circle;
    } else if (shape === 'ellipse') {
      target = ellipse;
    } else if (shape === 'line') {
      target = line;
    } else if (shape === 'polyline') {
      target = polyline;
    }
    annotationPlugin.selectDisplayObject(target);
  });

apiFolder
  .add(apiConfig, 'deselectDisplayObject', [
    'rect',
    'image',
    'circle',
    'ellipse',
    'line',
    'polyline',
    'none',
  ])
  .onChange((shape) => {
    let target;
    if (shape === 'rect') {
      target = rect;
    } else if (shape === 'image') {
      target = image;
    } else if (shape === 'circle') {
      target = circle;
    } else if (shape === 'ellipse') {
      target = ellipse;
    } else if (shape === 'line') {
      target = line;
    } else if (shape === 'polyline') {
      target = polyline;
    }
    annotationPlugin.deselectDisplayObject(target);
  });

apiFolder.add(apiConfig, 'getSelectedDisplayObjects');
apiFolder.open();

const camera = canvas.getCamera();
const cameraFolder = gui.addFolder('camera actions');
const cameraConfig = {
  panX: 0,
  panY: 0,
  zoom: 1,
  roll: 0,
};
cameraFolder.add(cameraConfig, 'zoom', 0.1, 10).onChange((zoom) => {
  camera.setZoom(zoom);
});
cameraFolder.open();
