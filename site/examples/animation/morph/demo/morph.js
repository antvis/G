import {
  Canvas,
  CanvasEvent,
  Circle,
  convertToPath,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
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
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();
const canvaskitRenderer = new CanvaskitRenderer({
  wasmDir: '/',
  fonts: [
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

canvas.addEventListener(CanvasEvent.READY, () => {
  const path1 = new Path({
    style: {
      d: 'M 0,40 C 5.5555555555555545,40,22.222222222222218,44.44444444444445,33.33333333333333,40 C 44.444444444444436,35.55555555555556,55.55555555555554,14.66666666666667,66.66666666666666,13.333333333333336 C 77.77777777777777,12.000000000000002,88.88888888888887,32,100,32 C 111.11111111111113,32,122.22222222222221,14.66666666666667,133.33333333333331,13.333333333333336 C 144.44444444444443,12.000000000000002,155.55555555555557,24,166.66666666666669,24 C 177.7777777777778,24,188.8888888888889,11.111111111111114,200,13.333333333333336 C 211.1111111111111,15.555555555555557,222.22222222222226,35.111111111111114,233.33333333333334,37.333333333333336 C 244.44444444444443,39.55555555555555,255.55555555555551,31.22222222222223,266.66666666666663,26.66666666666667 C 277.77777777777777,22.111111111111114,294.4444444444444,12.777777777777779,300,10',
    },
  });
  const path2 = new Path({
    style: {
      d: [
        ['M', 0, 0],
        ['L', 200, 0],
      ],
    },
  });

  path1.translate(100, 100);
  path2.translate(100, 100);

  /**
   * Path -> Path
   */
  const path1Str = convertToPath(path1);
  const path2Str = convertToPath(path2);
  const pathA = new Path({
    style: {
      d: path1Str,
      stroke: '#F04864',
    },
  });
  canvas.appendChild(pathA);
  pathA.animate([{ d: path1Str }, { d: path2Str }], {
    duration: 2500,
    easing: 'ease',
    iterations: Infinity,
    direction: 'alternate',
  });

  /**
   * Path -> Line
   */
  const line = new Line({
    style: {
      x1: 100,
      y1: 0,
      x2: 100,
      y2: 100,
      transform: 'translate(0, 100px)',
    },
  });
  const linePathStr = convertToPath(line);
  const pathB = new Path({
    style: {
      d: path1Str,
      stroke: '#F04864',
    },
  });
  canvas.appendChild(pathB);
  pathB.animate([{ d: path1Str }, { d: linePathStr }], {
    duration: 2500,
    easing: 'ease',
    iterations: Infinity,
    direction: 'alternate',
  });

  /**
   * Path -> Circle
   */
  const circle = new Circle({
    style: {
      cx: 100,
      cy: 100,
      r: 50,
    },
  });
  circle.scale(2);
  const circlePathStr = convertToPath(circle);
  const pathC = new Path({
    style: {
      d: path1Str,
      stroke: '#F04864',
    },
  });
  canvas.appendChild(pathC);
  pathC.animate([{ d: path1Str }, { d: circlePathStr }], {
    duration: 2500,
    easing: 'ease',
    iterations: Infinity,
    direction: 'alternate',
  });

  /**
   * Circle -> Polyline
   */
  const polylinePathStr = convertToPath(
    new Polyline({
      style: {
        points: [
          [50, 50],
          [100, 50],
          [100, 100],
          [150, 100],
          [150, 150],
          [200, 150],
        ],
        transform: 'translate(0, 200)',
      },
    }),
  );
  const pathD = new Path({
    style: {
      d: circlePathStr,
      stroke: '#F04864',
    },
  });
  canvas.appendChild(pathD);
  pathD.animate([{ d: circlePathStr }, { d: polylinePathStr }], {
    duration: 2500,
    easing: 'ease',
    iterations: Infinity,
    direction: 'alternate',
  });

  /**
   * Path -> Polygon
   */
  const polygonPathStr = convertToPath(
    new Polygon({
      style: {
        points: [
          [0, 0],
          [50, 50],
          [50, 100],
        ],
        transform: 'translate(0, 300px)',
      },
    }),
  );
  const pathE = new Path({
    style: {
      d: path1Str,
      stroke: '#F04864',
    },
  });
  canvas.appendChild(pathE);
  pathE.animate([{ d: path1Str }, { d: polygonPathStr }], {
    duration: 2500,
    easing: 'ease',
    iterations: Infinity,
    direction: 'alternate',
  });

  /**
   * Rect -> Circle
   */
  const rectPathStr = convertToPath(
    new Rect({
      style: {
        x: 300,
        y: 200,
        width: 200,
        height: 100,
        transformOrigin: 'center',
      },
    }),
  );
  const pathF = new Path({
    style: {
      d: rectPathStr,
      stroke: '#F04864',
      fill: '',
      opacity: 0.5,
      lineWidth: 10,
    },
  });
  canvas.appendChild(pathF);
  pathF.animate(
    [
      { d: rectPathStr, stroke: '#F04864', fill: 'blue' },
      { d: circlePathStr, stroke: 'blue', fill: '#F04864' },
    ],
    {
      duration: 2500,
      easing: 'ease',
      iterations: Infinity,
      direction: 'alternate',
    },
  );

  /**
   * Rect -> Path
   */
  const starPath = new Path({
    style: {
      d: 'M301.113,12.011l99.25,179.996l201.864,38.778L461.706,380.808l25.508,203.958l-186.101-87.287L115.01,584.766l25.507-203.958L0,230.785l201.86-38.778L301.113,12.011',
    },
  });
  starPath.scale(0.2);
  starPath.translate(200, 200);
  const pathG = new Path({
    style: {
      d: rectPathStr,
      lineWidth: 2,
    },
  });
  canvas.appendChild(pathG);
  pathG.animate(
    [
      { d: rectPathStr, stroke: '#F04864', fill: 'blue' },
      { d: convertToPath(starPath), stroke: 'blue', fill: '#F04864' },
    ],
    {
      duration: 2500,
      easing: 'ease',
      iterations: Infinity,
      direction: 'alternate',
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
