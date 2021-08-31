import { Image, Canvas } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

/**
 * ported from https://animista.net/play/entrances/scale-in
 */

// create a renderer
const canvasRenderer = new CanvasRenderer();
const webglRenderer = new WebGLRenderer();
const svgRenderer = new SVGRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const image = new Image({
  style: {
    x: 200,
    y: 100,
    width: 200,
    height: 200,
    origin: [100, 100],
    img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
  },
});

canvas.appendChild(image);

const animation = image.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], {
  duration: 1500,
  iterations: Infinity,
  // delay: 3000,
  // direction: 'alternate',
});
const timing = animation.effect.getTiming();

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.on('afterRender', () => {
  if (stats) {
    stats.update();
  }
});

// GUI
const gui = new dat.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);
const rendererFolder = gui.addFolder('renderer');
const rendererConfig = {
  renderer: 'canvas',
};
rendererFolder.add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg']).onChange((renderer) => {
  canvas.setRenderer(
    renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
  );
});
rendererFolder.open();

const animationFolder = gui.addFolder('animation');
const animationConfig = {
  easing: 'linear',
  playbackRate: 1,
};
animationFolder
  .add(animationConfig, 'easing', [
    'linear',
    'ease',
    'ease-in',
    'ease-out',
    'ease-in-out',
    'ease-out-in',
    'ease-in-quad',
    'ease-out-quad',
    'ease-in-out-quad',
    'ease-out-in-quad',

    'ease-in-cubic',
    'ease-out-cubic',
    'ease-in-out-cubic',
    'ease-out-in-cubic',

    'ease-in-quart',
    'ease-out-quart',
    'ease-in-out-quart',
    'ease-out-in-quart',

    'ease-in-quint',
    'ease-out-quint',
    'ease-in-out-quint',
    'ease-out-in-quint',

    'ease-in-expo',
    'ease-out-expo',
    'ease-in-out-expo',
    'ease-out-in-expo',

    'ease-in-sine',
    'ease-out-sine',
    'ease-in-out-sine',
    'ease-out-in-sine',

    'ease-in-circ',
    'ease-out-circ',
    'ease-in-out-circ',
    'ease-out-in-circ',

    'ease-in-back',
    'ease-out-back',
    'ease-in-out-back',
    'ease-out-in-back',

    'ease-in-bounce',
    'ease-out-bounce',
    'ease-in-out-bounce',
    'ease-out-in-bounce',

    'ease-in-elastic',
    'ease-out-elastic',
    'ease-in-out-elastic',
    'ease-out-in-elastic',

    'cubic-bezier(0.47, 0, 0.745, 0.715)',

    'spring',
    'spring-in',
    'spring-out',
    'spring-in-out',
    'spring-out-in',

    'custom',
  ])
  .onChange((type) => {
    if (type !== 'custom') {
      timing.easing = type;
    } else {
      const count = 4;
      const pos = 0;
      timing.easingFunction = (x) => {
        if (x >= 1) {
          return 1;
        }
        const stepSize = 1 / count;
        x += pos * stepSize;
        return x - (x % stepSize);
      };
    }
  });
animationFolder.add(animationConfig, 'playbackRate', 0, 5).onChange((playbackRate) => {
  animation.updatePlaybackRate(playbackRate);
});
animationFolder.open();
