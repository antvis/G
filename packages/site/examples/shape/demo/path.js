import { Canvas, CanvasEvent, Group, Path } from '@antv/g';
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
});
const webgpuRenderer = new WebGPURenderer();

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const path = new Path({
  style: {
    path: [
      ['M', 57.06339097770921, -18.541019662496844],
      ['L', 13.225168176580645, -18.202882373436317],
      ['L', 3.67394039744206e-15, -60],
      ['L', -13.225168176580643, -18.202882373436317],
      ['L', -57.06339097770921, -18.54101966249685],
      ['L', -21.398771616640953, 6.952882373436324],
      ['L', -35.267115137548394, 48.54101966249684],
      ['L', -4.133182947122317e-15, 22.5],
      ['L', 35.26711513754837, 48.54101966249685],
      ['L', 21.398771616640953, 6.952882373436322],
      ['Z'],
    ],
    stroke: '#1890FF',
    lineWidth: 1,
  },
});
path.translate(100, 250);

const path1 = new Path({
  style: {
    path: [
      ['M', 100, 100],
      ['L', 200, 100],
    ],
    stroke: '#F04864',
    lineDash: [10],
  },
});
const path2 = new Path({
  style: {
    transform: 'translate(200, 100) scale(10)',
    path: 'M2 4C0.8954304997175604 3.9999999991219815 -1.3527075029566811e-16 4.895430499717561 0 6C0 6 0 9.9375 0 12C1.3527075029566811e-16 13.10456950028244 0.8954304997175604 14.00000000087802 2 14C8 14 10.25 14 14 14C15.104569499040734 13.99999999912198 16 13.104569499040734 16 12C16 9 16 7.875 16 6C16 4.895430500959266 15.104569499040734 4.0000000008780185 14 4C13.414 4 13.194249999999998 4 12.828 4C12.297610373455704 3.9998867247945213 11.788985462367364 3.7890987493850155 11.414 3.414C11 3 10.84475 2.8447500000000003 10.586 2.5860000000000003C10.211014537632636 2.210901250614985 9.702389626544296 2.0001132752054787 9.172 2.0000000000000004C8 2.0000000000000004 7.560500000000001 2.0000000000000004 6.828000000000001 2.0000000000000004C6.297610373455706 2.0001132752054787 5.788985462367367 2.210901250614985 5.4140000000000015 2.5860000000000003C5.000000000000002 3 4.844750000000001 3.1552499999999997 4.586000000000001 3.414C4.211014537632636 3.7890987493850155 3.7023896265442966 3.9998867247945213 3.1720000000000015 4C2.5860000000000016 4 2.3662500000000017 4 2.0000000000000018 4C2.000000000000001 4 2.000000000000001 4 2 4M10.5 8.5C10.5 6.575499102701247 8.416666666666666 5.372686041889527 6.75 6.334936490538903C5.976497308103742 6.781518477924107 5.5 7.606836025229591 5.5 8.5C5.5 10.424500897298753 7.583333333333334 11.627313958110474 9.25 10.665063509461097C10.023502691896258 10.218481522075892 10.5 9.39316397477041 10.5 8.5C10.5 8.5 10.5 8.5 10.5 8.5M2.5 6C2.1150998205402494 6.000000000305956 1.874537208444147 5.583333333830511 2.0669872979090567 5.2500000003442C2.1563036954051213 5.095299461648009 2.321367204761929 4.999999999858005 2.5 5C2.8849001794597506 5.000000000305956 3.125462791688336 5.416666667163845 2.933012701693495 5.7500000003442C2.8436963042354777 5.904700538406512 2.6786327946700927 5.999999999858005 2.5 6C2.5 6 2.5 6 2.5 6M11.5 8.5C11.5 11.194301256218253 8.583333333333334 12.878239541354663 6.250000000000001 11.531088913245537C5.167096231345241 10.90587413090625 4.5 9.750429564678573 4.5 8.5C4.5 5.805698743781747 7.416666666666667 4.121760458645338 9.75 5.468911086754464C10.832903768654761 6.094125869093751 11.5 7.249570435321427 11.5 8.5C11.5 8.5 11.5 8.5 11.5 8.5',
    lineWidth: 1,
    lineJoin: 'round',
    stroke: '#54BECC',
    cursor: 'pointer',
  },
});
path2.addEventListener('mouseenter', () => {
  path2.style.stroke = 'red';
});
path2.addEventListener('mouseleave', () => {
  path2.style.stroke = '#54BECC';
});

const path3 = new Path({
  style: {
    lineWidth: 1,
    stroke: '#54BECC',
    path: 'M 0,40 C 5.5555555555555545,40,22.222222222222218,44.44444444444445,33.33333333333333,40 C 44.444444444444436,35.55555555555556,55.55555555555554,14.66666666666667,66.66666666666666,13.333333333333336 C 77.77777777777777,12.000000000000002,88.88888888888887,32,100,32 C 111.11111111111113,32,122.22222222222221,14.66666666666667,133.33333333333331,13.333333333333336 C 144.44444444444443,12.000000000000002,155.55555555555557,24,166.66666666666669,24 C 177.7777777777778,24,188.8888888888889,11.111111111111114,200,13.333333333333336 C 211.1111111111111,15.555555555555557,222.22222222222226,35.111111111111114,233.33333333333334,37.333333333333336 C 244.44444444444443,39.55555555555555,255.55555555555551,31.22222222222223,266.66666666666663,26.66666666666667 C 277.77777777777777,22.111111111111114,294.4444444444444,12.777777777777779,300,10',
  },
});

function getCirclePath(cx, cy, rx, ry) {
  return [
    // ['M', cx, cy - ry],
    // ['A', rx, ry, 0, 1, 1, cx, cy + ry],
    // ['A', rx, ry, 0, 1, 1, cx, cy - ry],

    ['M', cx - rx, ry],
    ['A', rx, ry, 0, 1, 0, cx + rx, ry],
    ['A', rx, ry, 0, 1, 0, cx - rx, ry],
    ['Z'],
  ];
}

const circlePath = new Path({
  style: {
    path: getCirclePath(0, 0, 100, 100),
    lineWidth: 1,
    stroke: '#54BECC',
  },
});

const path4 = new Path({
  style: {
    transform: 'translate(300, 100) scale(0.4)',
    lineWidth: 10,
    lineJoin: 'round',
    stroke: '#54BECC',
    cursor: 'pointer',
    path:
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
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(path);
  canvas.appendChild(path1);
  canvas.appendChild(path2);
  canvas.appendChild(path3);
  canvas.appendChild(path4);
  canvas.appendChild(circlePath);
  circlePath.setPosition(100, 300);
});

const g = new Group({
  style: {
    transform: 'translate(400, 400) scale(0.5)',
  },
});
const p1 = new Path({
  style: {
    d: 'M1.2858791391047205e-14,-209.99999999999994A209.99999999999994,209.99999999999994,0,0,1,207.94618110413055,29.298221178223883L0,0Z',
    fill: 'red',
  },
});
const p2 = new Path({
  style: {
    d: 'M207.94618110413066,29.298221178223898A210.00000000000006,210.00000000000006,0,0,1,137.74500635698746,158.512817222184L0,0Z',
    fill: 'green',
  },
});
const p3 = new Path({
  style: {
    d: 'M137.7450063569874,158.51281722218394A209.99999999999997,209.99999999999997,0,0,1,-6.530971076665772,209.89841928131747L0,0Z',
    fill: 'blue',
  },
});
const p4 = new Path({
  style: {
    d: 'M-6.530971076665824,209.8984192813175A210,210,0,0,1,-168.7343604741219,-125.01486149809983L0,0Z',
    fill: 'yellow',
  },
});
const p5 = new Path({
  style: {
    d: 'M-168.7343604741219,-125.01486149809983A210,210,0,0,1,-3.377057564320937e-14,-210L0,0Z',
    fill: 'black',
  },
});
g.appendChild(p1);
g.appendChild(p2);
g.appendChild(p3);
g.appendChild(p4);
g.appendChild(p5);

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(g);
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

const circleFolder = gui.addFolder('circle');
const circleConfig = {
  r: 100,
  lineWidth: 1,
  lineDash: 0,
  lineDashOffset: 0,
  anchorX: 0,
  anchorY: 0,
  shadowColor: '#fff',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
};
circleFolder.add(circleConfig, 'r', 0, 200).onChange((r) => {
  circlePath.style.path = getCirclePath(0, 0, r, r);
  circlePath.setPosition(100, 300);
});
circleFolder.add(circleConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  circlePath.style.lineWidth = lineWidth;
});
circleFolder.add(circleConfig, 'lineDash', 0, 100).onChange((lineDash) => {
  circlePath.style.lineDash = [lineDash];
});
circleFolder.add(circleConfig, 'lineDashOffset', 0, 100).onChange((lineDashOffset) => {
  circlePath.style.lineDashOffset = lineDashOffset;
});
circleFolder.add(circleConfig, 'anchorX', 0, 1).onChange((anchorX) => {
  circlePath.style.anchor = [anchorX, circleConfig.anchorY];
});
circleFolder.add(circleConfig, 'anchorY', 0, 1).onChange((anchorY) => {
  circlePath.style.anchor = [circleConfig.anchorX, anchorY];
});
circleFolder.addColor(circleConfig, 'shadowColor').onChange((color) => {
  circlePath.attr('shadowColor', color);
});
circleFolder.add(circleConfig, 'shadowBlur', 0, 100).onChange((shadowBlur) => {
  circlePath.style.shadowBlur = shadowBlur;
});
circleFolder.add(circleConfig, 'shadowOffsetX', -50, 50).onChange((shadowOffsetX) => {
  circlePath.style.shadowOffsetX = shadowOffsetX;
});
circleFolder.add(circleConfig, 'shadowOffsetY', -50, 50).onChange((shadowOffsetY) => {
  circlePath.style.shadowOffsetY = shadowOffsetY;
});
circleFolder.open();

const pathFolder = gui.addFolder('path');
const pathConfig = {
  increasedLineWidthForHitTesting: 0,
  cursor: 'pointer',
};
pathFolder
  .add(pathConfig, 'increasedLineWidthForHitTesting', 0, 200)
  .onChange((increasedLineWidthForHitTesting) => {
    path2.style.increasedLineWidthForHitTesting = increasedLineWidthForHitTesting;
  });
pathFolder
  .add(pathConfig, 'cursor', ['default', 'pointer', 'help', 'progress', 'text', 'move'])
  .onChange((cursor) => {
    path2.style.cursor = cursor;
  });
