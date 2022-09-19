import { Canvas, CanvasEvent, HTML, Rectangle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { createAnimation } from '@antv/g-lottie-player';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

/**
 * @see https://lottiefiles.github.io/lottie-docs/breakdown/bouncy_ball/
 */

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

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const bouncy_ball = {
  nm: 'Bouncy Ball',
  v: '5.5.2',
  ip: 0,
  op: 120,
  fr: 60,
  w: 512,
  h: 512,
  layers: [
    {
      ddd: 0,
      ty: 4,
      ind: 0,
      st: 0,
      ip: 0,
      op: 120,
      nm: 'Layer',
      ks: {
        a: {
          a: 0,
          k: [0, 0],
        },
        p: {
          a: 0,
          k: [0, 0],
        },
        s: {
          a: 0,
          k: [100, 100],
        },
        r: {
          a: 0,
          k: 0,
        },
        o: {
          a: 0,
          k: 100,
        },
      },
      shapes: [
        {
          ty: 'gr',
          nm: 'Ellipse Group',
          it: [
            {
              ty: 'el',
              nm: 'Ellipse',
              p: {
                a: 0,
                k: [204, 169],
              },
              s: {
                a: 0,
                k: [153, 153],
              },
            },
            {
              ty: 'fl',
              nm: 'Fill',
              o: {
                a: 0,
                k: 100,
              },
              c: {
                a: 0,
                k: [0.71, 0.192, 0.278],
              },
              r: 1,
            },
            {
              ty: 'tr',
              a: {
                a: 0,
                k: [204, 169],
              },
              p: {
                a: 1,
                k: [
                  {
                    t: 0,
                    s: [235, 106],
                    h: 0,
                    o: {
                      x: [0.333],
                      y: [0],
                    },
                    i: {
                      x: [1],
                      y: [1],
                    },
                  },
                  {
                    t: 60,
                    s: [265, 441],
                    h: 0,
                    o: {
                      x: [0],
                      y: [0],
                    },
                    i: {
                      x: [0.667],
                      y: [1],
                    },
                  },
                  {
                    t: 120,
                    s: [235, 106],
                  },
                ],
              },
              s: {
                a: 1,
                k: [
                  {
                    t: 55,
                    s: [100, 100],
                    h: 0,
                    o: {
                      x: [0],
                      y: [0],
                    },
                    i: {
                      x: [1],
                      y: [1],
                    },
                  },
                  {
                    t: 60,
                    s: [136, 59],
                    h: 0,
                    o: {
                      x: [0],
                      y: [0],
                    },
                    i: {
                      x: [1],
                      y: [1],
                    },
                  },
                  {
                    t: 65,
                    s: [100, 100],
                  },
                ],
              },
              r: {
                a: 0,
                k: 0,
              },
              o: {
                a: 0,
                k: 100,
              },
            },
          ],
        },
      ],
    },
  ],
};

const animation = createAnimation(bouncy_ball);
canvas.addEventListener(CanvasEvent.READY, () => {
  animation.render(canvas);
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
