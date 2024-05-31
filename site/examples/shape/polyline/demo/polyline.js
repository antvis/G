import { Canvas, CanvasEvent, Polyline } from '@antv/g';
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
const points = [
  [50, 50],
  [100, 50],
  [100, 100],
  [150, 100],
  [150, 150],
  [200, 150],
  [200, 200],
  [250, 200],
  [250, 250],
  [300, 250],
  [300, 300],
  [350, 300],
  [350, 350],
  [400, 350],
  [400, 400],
  [450, 400],
];
const polyline = new Polyline({
  style: {
    points,
    stroke: '#1890FF',
    lineWidth: 20,
    lineCap: 'round',
    cursor: 'pointer',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
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

const lineFolder = gui.addFolder('polyline');
const lineConfig = {
  stroke: '#1890FF',
  lineWidth: 2,
  lineJoin: 'miter',
  lineCap: 'butt',
  lineDash: 0,
  lineDashOffset: 0,
  strokeOpacity: 1,
  firstPointX: 50,
  firstPointY: 50,
  visible: true,
  increasedLineWidthForHitTesting: 0,
  cursor: 'pointer',
  shadowColor: '#fff',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
};
lineFolder.add(lineConfig, 'firstPointX', 0, 200).onChange((firstPointX) => {
  const newPoints = [...points];
  newPoints[0] = [firstPointX, lineConfig.firstPointY];
  polyline.style.points = newPoints;
});
lineFolder.add(lineConfig, 'firstPointY', 0, 200).onChange((firstPointY) => {
  const newPoints = [...points];
  newPoints[0] = [lineConfig.firstPointX, firstPointY];
  polyline.style.points = newPoints;
});
lineFolder.addColor(lineConfig, 'stroke').onChange((color) => {
  polyline.attr('stroke', color);
});
lineFolder.add(lineConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  polyline.attr('lineWidth', lineWidth);
});
lineFolder
  .add(lineConfig, 'lineJoin', ['miter', 'round', 'bevel'])
  .onChange((lineJoin) => {
    polyline.attr('lineJoin', lineJoin);
  });
lineFolder
  .add(lineConfig, 'lineCap', ['butt', 'round', 'square'])
  .onChange((lineCap) => {
    polyline.attr('lineCap', lineCap);
  });
lineFolder.add(lineConfig, 'lineDash', 0, 100).onChange((lineDash) => {
  polyline.style.lineDash = [lineDash];
});
lineFolder
  .add(lineConfig, 'lineDashOffset', 0, 100)
  .onChange((lineDashOffset) => {
    polyline.style.lineDashOffset = lineDashOffset;
  });
lineFolder.add(lineConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  polyline.attr('strokeOpacity', opacity);
});
lineFolder.add(lineConfig, 'visible').onChange((visible) => {
  if (visible) {
    polyline.style.visibility = 'visible';
    // polyline.show();
  } else {
    polyline.style.visibility = 'hidden';
    // polyline.hide();
  }
});
lineFolder
  .add(lineConfig, 'increasedLineWidthForHitTesting', 0, 50)
  .onChange((increasedLineWidthForHitTesting) => {
    polyline.style.increasedLineWidthForHitTesting =
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
    polyline.style.cursor = cursor;
  });
lineFolder.addColor(lineConfig, 'shadowColor').onChange((color) => {
  polyline.attr('shadowColor', color);
});
lineFolder.add(lineConfig, 'shadowBlur', 0, 100).onChange((shadowBlur) => {
  polyline.style.shadowBlur = shadowBlur;
});
lineFolder
  .add(lineConfig, 'shadowOffsetX', -50, 50)
  .onChange((shadowOffsetX) => {
    polyline.style.shadowOffsetX = shadowOffsetX;
  });
lineFolder
  .add(lineConfig, 'shadowOffsetY', -50, 50)
  .onChange((shadowOffsetY) => {
    polyline.style.shadowOffsetY = shadowOffsetY;
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
    polyline.style.transformOrigin = transformOrigin;
  });
transformFolder
  .add(transformConfig, 'localPositionX', 0, 600)
  .onChange((localPositionX) => {
    const [lx, ly] = polyline.getLocalPosition();
    polyline.setLocalPosition(localPositionX, ly);
  });
transformFolder
  .add(transformConfig, 'localPositionY', 0, 500)
  .onChange((localPositionY) => {
    const [lx, ly] = polyline.getLocalPosition();
    polyline.setLocalPosition(lx, localPositionY);
  });
transformFolder
  .add(transformConfig, 'localScale', 0.2, 5)
  .onChange((localScale) => {
    polyline.setLocalScale(localScale);
  });
transformFolder
  .add(transformConfig, 'localEulerAngles', 0, 360)
  .onChange((localEulerAngles) => {
    polyline.setLocalEulerAngles(localEulerAngles);
  });
transformFolder.close();
