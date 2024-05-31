import { Canvas, CanvasEvent, Circle, Image, Line, Path } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();
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

// create a line
const line1 = new Line({
  style: {
    x1: 200,
    y1: 100,
    x2: 400,
    y2: 100,
    stroke: '#1890FF',
    lineWidth: 2,
    cursor: 'pointer',
  },
});

const line2 = new Line({
  style: {
    x1: 200,
    y1: 150,
    x2: 400,
    y2: 150,
    lineWidth: 2,
    lineDash: [10, 10],
    stroke: '#F04864',
  },
});
const line3 = new Line({
  style: {
    x1: 200,
    y1: 200,
    x2: 400,
    y2: 200,
    lineWidth: 2,
    stroke: 'l(0) 0:#F04864 0.5:#7EC2F3 1:#1890FF',
  },
});

const arrowMarker = new Path({
  style: {
    d: 'M 10,10 L -10,0 L 10,-10 Z',
    stroke: '#1890FF',
    transformOrigin: 'center',
  },
});
const circleMarker = new Circle({
  style: {
    r: 10,
    stroke: '#1890FF',
  },
});
const imageMarker = new Image({
  style: {
    x: -25,
    y: -25,
    width: 50,
    height: 50,
    transformOrigin: 'center',
    transform: 'rotate(90deg)',
    src: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
  },
});

const arrowLine = new Line({
  style: {
    x1: 200,
    y1: 250,
    x2: 400,
    y2: 250,
    stroke: '#1890FF',
    lineWidth: 2,
    cursor: 'pointer',
    markerStart: arrowMarker,
    markerEnd: circleMarker,
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(line1);
  canvas.appendChild(line2);
  canvas.appendChild(line3);
  canvas.appendChild(arrowLine);

  line2.animate([{ lineDashOffset: -20 }, { lineDashOffset: 0 }], {
    duration: 1500,
    iterations: Infinity,
  });

  line3.animate(
    [
      { x1: 200, lineWidth: 2 },
      { x1: 0, lineWidth: 10 },
    ],
    {
      duration: 1500,
      iterations: Infinity,
      easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
    },
  );
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

const lineFolder = gui.addFolder('line1');
const lineConfig = {
  stroke: '#1890FF',
  lineWidth: 2,
  lineJoin: 'miter',
  lineCap: 'butt',
  strokeOpacity: 1,
  x1: 200,
  y1: 100,
  x2: 400,
  y2: 100,
  lineDash: 0,
  lineDashOffset: 0,
  increasedLineWidthForHitTesting: 0,
  cursor: 'pointer',
  shadowColor: '#fff',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  pointerEvents: 'auto',
  visibility: 'visible',
};
lineFolder
  .add(lineConfig, 'lineJoin', ['miter', 'round', 'bevel'])
  .onChange((lineJoin) => {
    line1.style.lineJoin = lineJoin;
  });
lineFolder
  .add(lineConfig, 'lineCap', ['butt', 'round', 'square'])
  .onChange((lineCap) => {
    line1.style.lineCap = lineCap;
  });
lineFolder.add(lineConfig, 'lineDash', 0, 100).onChange((lineDash) => {
  line1.style.lineDash = [lineDash];
});
lineFolder
  .add(lineConfig, 'lineDashOffset', 0, 100)
  .onChange((lineDashOffset) => {
    line1.style.lineDashOffset = lineDashOffset;
  });
lineFolder.add(lineConfig, 'x1', 0, 400).onChange((x1) => {
  line1.style.x1 = x1;
});
lineFolder.add(lineConfig, 'y1', 0, 400).onChange((y1) => {
  line1.style.y1 = y1;
});
lineFolder.add(lineConfig, 'x2', 0, 400).onChange((x2) => {
  line1.style.x2 = x2;
});
lineFolder.add(lineConfig, 'y2', 0, 400).onChange((y2) => {
  line1.style.y2 = y2;
});
lineFolder.addColor(lineConfig, 'stroke').onChange((color) => {
  line1.style.stroke = color;
});
lineFolder.add(lineConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  line1.style.lineWidth = lineWidth;
});
lineFolder.add(lineConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  line1.style.strokeOpacity = opacity;
});
lineFolder
  .add(lineConfig, 'increasedLineWidthForHitTesting', 0, 200)
  .onChange((increasedLineWidthForHitTesting) => {
    line1.style.increasedLineWidthForHitTesting =
      increasedLineWidthForHitTesting;
  });
lineFolder
  .add(lineConfig, 'cursor', [
    'default',
    'pointer',
    'help',
    'progress',
    'text',
    'move',
  ])
  .onChange((cursor) => {
    line1.style.cursor = cursor;
  });
lineFolder.addColor(lineConfig, 'shadowColor').onChange((color) => {
  line1.attr('shadowColor', color);
});
lineFolder.add(lineConfig, 'shadowBlur', 0, 100).onChange((shadowBlur) => {
  line1.style.shadowBlur = shadowBlur;
});
lineFolder
  .add(lineConfig, 'shadowOffsetX', -50, 50)
  .onChange((shadowOffsetX) => {
    line1.style.shadowOffsetX = shadowOffsetX;
  });
lineFolder
  .add(lineConfig, 'shadowOffsetY', -50, 50)
  .onChange((shadowOffsetY) => {
    line1.style.shadowOffsetY = shadowOffsetY;
  });
lineFolder
  .add(lineConfig, 'pointerEvents', [
    'none',
    'auto',
    'stroke',
    'fill',
    'painted',
    'visible',
    'visiblestroke',
    'visiblefill',
    'visiblepainted',
    'all',
  ])
  .onChange((pointerEvents) => {
    line1.style.pointerEvents = pointerEvents;
  });
lineFolder
  .add(lineConfig, 'visibility', ['visible', 'hidden'])
  .onChange((visibility) => {
    line1.style.visibility = visibility;
  });

const transformFolder = gui.addFolder('transform');
const transformConfig = {
  localPositionX: 0,
  localPositionY: 0,
  localScale: 1,
  localEulerAngles: 0,
  transformOrigin: 'left top',
};
transformFolder
  .add(transformConfig, 'transformOrigin', [
    'left top',
    'center',
    'right bottom',
    '50% 50%',
    '50px 50px',
  ])
  .onChange((transformOrigin) => {
    line1.style.transformOrigin = transformOrigin;
  });
transformFolder
  .add(transformConfig, 'localPositionX', 0, 600)
  .onChange((localPositionX) => {
    const [lx, ly] = line1.getLocalPosition();
    line1.setLocalPosition(localPositionX, ly);
  });
transformFolder
  .add(transformConfig, 'localPositionY', 0, 500)
  .onChange((localPositionY) => {
    const [lx, ly] = line1.getLocalPosition();
    line1.setLocalPosition(lx, localPositionY);
  });
transformFolder
  .add(transformConfig, 'localScale', 0.2, 5)
  .onChange((localScale) => {
    line1.setLocalScale(localScale);
  });
transformFolder
  .add(transformConfig, 'localEulerAngles', 0, 360)
  .onChange((localEulerAngles) => {
    line1.setLocalEulerAngles(localEulerAngles);
  });
transformFolder.close();

const markerFolder = gui.addFolder('marker');
const markerConfig = {
  markerStart: 'path',
  markerEnd: 'circle',
  markerStartOffset: 0,
  markerEndOffset: 0,
  x1: 200,
  y1: 250,
  x2: 400,
  y2: 250,
};
markerFolder
  .add(markerConfig, 'markerStart', ['path', 'circle', 'image', 'null'])
  .onChange((markerStartStr) => {
    let markerStart;
    if (markerStartStr === 'path') {
      markerStart = arrowMarker;
    } else if (markerStartStr === 'circle') {
      markerStart = circleMarker;
    } else if (markerStartStr === 'image') {
      markerStart = imageMarker;
    } else {
      markerStart = null;
    }

    arrowLine.style.markerStart = markerStart;
  });
markerFolder
  .add(markerConfig, 'markerEnd', ['path', 'circle', 'image', 'null'])
  .onChange((markerEndStr) => {
    let markerEnd;
    if (markerEndStr === 'path') {
      markerEnd = arrowMarker;
    } else if (markerEndStr === 'circle') {
      markerEnd = circleMarker;
    } else if (markerEndStr === 'image') {
      markerEnd = imageMarker;
    } else {
      markerEnd = null;
    }

    arrowLine.style.markerEnd = markerEnd;
  });
markerFolder
  .add(markerConfig, 'markerStartOffset', -20, 20)
  .onChange((markerStartOffset) => {
    arrowLine.style.markerStartOffset = markerStartOffset;
  });
markerFolder
  .add(markerConfig, 'markerEndOffset', -20, 20)
  .onChange((markerEndOffset) => {
    arrowLine.style.markerEndOffset = markerEndOffset;
  });
markerFolder.add(markerConfig, 'x1', 0, 400).onChange((x1) => {
  arrowLine.style.x1 = x1;
});
markerFolder.add(markerConfig, 'y1', 0, 400).onChange((y1) => {
  arrowLine.style.y1 = y1;
});
markerFolder.add(markerConfig, 'x2', 0, 400).onChange((x2) => {
  arrowLine.style.x2 = x2;
});
markerFolder.add(markerConfig, 'y2', 0, 400).onChange((y2) => {
  arrowLine.style.y2 = y2;
});
markerFolder.open();
