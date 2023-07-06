import { Canvas, CanvasEvent, HTML, Rectangle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { loadAnimation } from '@antv/g-lottie-player';
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
const webgpuRenderer = new WebGPURenderer({
  shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});
const canvaskitRenderer = new CanvaskitRenderer({
  wasmDir: '/',
  fonts: [
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
                // position
                a: 0,
                k: [204, 169],
              },
              s: {
                // size
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
                // anchor
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
                // rotation
                a: 0,
                k: 0,
              },
              o: {
                // opacity
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

// @see https://lottiefiles.github.io/lottie-docs/shapes/#rectangle
const rect = {
  v: '5.5.7',
  ip: 0,
  op: 180,
  nm: 'Animation',
  mn: '{8f1618e3-6f83-4531-8f65-07dd4b68ee2e}',
  fr: 60,
  w: 512,
  h: 512,
  assets: [],
  layers: [
    {
      ddd: 0,
      ty: 4,
      ind: 0,
      st: 0,
      ip: 0,
      op: 180,
      nm: 'Layer',
      mn: '{85f37d8b-1792-4a4f-82d2-1b3b6d829c07}',
      ks: {
        a: {
          a: 0,
          k: [256, 256],
        },
        p: {
          a: 0,
          k: [256, 256],
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
          nm: 'Group',
          it: [
            {
              ty: 'rc',
              nm: 'Rectangle',
              p: {
                a: 0,
                k: [256, 256],
              },
              s: {
                a: 0,
                k: [256, 256],
              },
              r: {
                a: 0,
                k: 0,
              },
            },
            {
              ty: 'st',
              nm: 'Stroke',
              mn: '{0930ce27-c8f9-4371-b0cf-111a859abfaf}',
              o: {
                a: 0,
                k: 100,
              },
              c: {
                a: 0,
                k: [1, 0.9803921568627451, 0.2823529411764706],
              },
              lc: 2,
              lj: 2,
              ml: 0,
              w: {
                a: 0,
                k: 30,
              },
            },
            {
              ty: 'tr',
              a: {
                a: 0,
                k: [249.3134328358209, 254.47164179104476],
              },
              p: {
                a: 0,
                k: [249.3134328358209, 254.47164179104476],
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
          ],
        },
      ],
    },
  ],
  meta: {
    g: 'Glaxnimate 0.4.6-26-g7b05e75c',
  },
};

// @see https://lottiefiles.github.io/lottie-docs/breakdown/bezier/#beziers-in-lottie
const path = {
  v: '5.7.1',
  ip: 0,
  op: 180,
  nm: 'Animation',
  mn: '{8f1618e3-6f83-4531-8f65-07dd4b68ee2e}',
  fr: 60,
  w: 512,
  h: 512,
  layers: [
    {
      ty: 4,
      ddd: 0,
      nm: 'Layer',
      mn: '{85f37d8b-1792-4a4f-82d2-1b3b6d829c07}',
      ip: 0,
      op: 180,
      ind: 0,
      st: 0,
      sr: 1,
      ks: {
        a: {
          a: 0,
          k: [256, 256],
        },
        p: {
          a: 0,
          k: [256, 256],
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
          nm: 'Path',
          mn: '{9199543e-3552-4e51-a802-623f2a4a2ca1}',
          it: [
            {
              ty: 'sh',
              ks: {
                a: 0,
                k: {
                  c: false,
                  v: [
                    [53, 325],
                    [429, 147],
                    [215, 430],
                  ],
                  i: [
                    [0, 0],
                    [-147, 186],
                    [114, 36],
                  ],
                  o: [
                    [89, -189],
                    [40, 189],
                    [0, 0],
                  ],
                },
              },
            },
            {
              ty: 'st',
              nm: 'Stroke',
              mn: '{0930ce27-c8f9-4371-b0cf-111a859abfaf}',
              o: {
                a: 0,
                k: 100,
              },
              c: {
                a: 0,
                k: [1, 0.979995422293431, 0.28000305180437934],
              },
              lc: 2,
              lj: 2,
              ml: 0,
              w: {
                a: 0,
                k: 30,
              },
            },
            {
              ty: 'tr',
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
          ],
        },
      ],
    },
  ],
  meta: {
    g: 'Glaxnimate 0.4.6-32-gb62899be',
  },
};

const gradient = {
  v: '5.7.1',
  ip: 0,
  op: 180,
  nm: 'Animation',
  mn: '{8f1618e3-6f83-4531-8f65-07dd4b68ee2e}',
  fr: 60,
  w: 512,
  h: 512,
  layers: [
    {
      ty: 4,
      ddd: 0,
      nm: 'Layer',
      mn: '{85f37d8b-1792-4a4f-82d2-1b3b6d829c07}',
      ip: 0,
      op: 180,
      ind: 0,
      st: 0,
      sr: 1,
      ks: {
        a: {
          a: 0,
          k: [256, 256],
        },
        p: {
          a: 0,
          k: [256, 256],
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
        // {
        //   ty: 'gf',
        //   nm: 'Gradient Fill',
        //   o: {
        //     a: 0,
        //     k: 100,
        //   },
        //   r: 1,
        //   s: {
        //     a: 0,
        //     k: [256, 496],
        //   },
        //   e: {
        //     a: 0,
        //     k: [256, 16],
        //   },
        //   t: 2,
        //   h: {
        //     a: 0,
        //     k: 0,
        //   },
        //   a: {
        //     a: 0,
        //     k: 0,
        //   },
        //   g: {
        //     p: 3,
        //     k: {
        //       a: 0,
        //       k: [
        //         0, 0.7686274509803922, 0.8509803921568627, 0.9607843137254902, 0.5,
        //         0.19600213626306554, 0.31400015259021896, 0.6899977111467155, 1,
        //         0.16099794003204396, 0.18399328603036547, 0.45900663767452504, 0, 1, 0.5, 1, 1, 1,
        //       ],
        //     },
        //   },
        // },
        {
          ty: 'gr',
          nm: 'Gradient',
          mn: '{9df3ba96-24a3-412e-abd4-e64e2e76e6df}',
          it: [
            {
              ty: 'rc',
              nm: 'Rectangle',
              mn: '{20934ad0-1c22-4752-a5b1-be99889ea79a}',
              p: {
                a: 0,
                k: [256, 256],
              },
              s: {
                a: 0,
                k: [512, 512],
              },
              r: {
                a: 0,
                k: 0,
              },
            },
            {
              ty: 'gf',
              nm: 'Gradient Fill',
              o: {
                a: 0,
                k: 100,
              },
              r: 1,
              s: {
                a: 0,
                k: [256, 496],
              },
              e: {
                a: 0,
                k: [256, 16],
              },
              t: 1,
              h: {
                a: 0,
                k: 0,
              },
              a: {
                a: 0,
                k: 0,
              },
              g: {
                p: 3,
                k: {
                  a: 0,
                  k: [
                    0, 0.7686274509803922, 0.8509803921568627,
                    0.9607843137254902, 0.5, 0.19600213626306554,
                    0.31400015259021896, 0.6899977111467155, 1,
                    0.16099794003204396, 0.18399328603036547,
                    0.45900663767452504, 0, 1, 0.5, 1, 1, 1,
                  ],
                },
              },
            },
            {
              ty: 'tr',
              a: {
                a: 0,
                k: [257.4805970149254, 255.76119402985074],
              },
              p: {
                a: 0,
                k: [257.4805970149254, 255.76119402985074],
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
          ],
        },
      ],
    },
  ],
  meta: {
    g: 'Glaxnimate 0.4.6-32-gb62899be',
  },
};

// const gradientAnimation = loadAnimation(gradient);
// const rectAnimation = loadAnimation(rect);
// const pathAnimation = loadAnimation(path);
const ballAnimation = loadAnimation(bouncy_ball, {
  loop: true,
  autoplay: true,
});
canvas.addEventListener(CanvasEvent.READY, () => {
  // gradientAnimation.render(canvas);
  // rectAnimation.render(canvas);
  // pathAnimation.render(canvas);
  ballAnimation.render(canvas);
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

const controlFolder = gui.addFolder('control');
const controlConfig = {
  pause: () => {
    ballAnimation.pause();
  },
  play: () => {
    ballAnimation.play();
  },
  stop: () => {
    ballAnimation.stop();
  },
  speed: 1,
  goToCurrentTime: 0,
  goToFrame: 0,
};
controlFolder.add(controlConfig, 'play');
controlFolder.add(controlConfig, 'pause');
controlFolder.add(controlConfig, 'stop');
controlFolder.add(controlConfig, 'speed', -3, 3).onChange((speed) => {
  ballAnimation.setSpeed(speed);
});
controlFolder
  .add(controlConfig, 'goToCurrentTime', 0, 2000)
  .onChange((time) => {
    ballAnimation.goTo(time);
  });
controlFolder.add(controlConfig, 'goToFrame', 0, 100).onChange((frame) => {
  ballAnimation.goTo(frame, true);
});
controlFolder.open();
