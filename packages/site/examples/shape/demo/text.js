import { Text, Circle, Rect, Canvas } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

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

// create a line of text
const text = new Text({
  style: {
    x: 100,
    y: 300,
    fontFamily: 'PingFang SC',
    text: '这是测试文本This is text',
    fontSize: 60,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 5,
  },
});

// display anchor
const origin = new Circle({
  style: {
    r: 20,
    fill: 'red',
  },
});
origin.setPosition(text.getPosition());

// display bounds
const bounds = new Rect({
  style: {
    stroke: 'black',
    lineWidth: 2,
  },
});

canvas.appendChild(bounds);
canvas.appendChild(text);
canvas.appendChild(origin);

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.on('afterrender', () => {
  if (stats) {
    stats.update();
  }

  const bounding = text.getBounds();
  if (bounding) {
    const { center, halfExtents } = bounding;
    bounds.attr('width', halfExtents[0] * 2);
    bounds.attr('height', halfExtents[1] * 2);
    bounds.setPosition(center[0] - halfExtents[0], center[1] - halfExtents[1]);
  }
});

// GUI
const gui = new lil.GUI({ autoPlace: false });
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

const fontFolder = gui.addFolder('font');
const fontConfig = {
  text: '这是测试文本This is text',
  fontFamily: 'PingFang SC',
  fontSize: 60,
  fontStyle: 'normal',
  fontWeight: 'normal',
  fontVariant: 'normal',
};
fontFolder.add(fontConfig, 'text').onFinishChange((content) => {
  text.attr('text', content);
});
fontFolder
  .add(fontConfig, 'fontFamily', ['PingFang SC', 'fantasy', 'Arial', 'Times', 'Microsoft YaHei'])
  .onChange((fontFamily) => {
    text.attr('fontFamily', fontFamily);
  });
fontFolder.add(fontConfig, 'fontSize', 10, 100).onChange((fontSize) => {
  text.attr('fontSize', fontSize);
});
fontFolder.add(fontConfig, 'fontStyle', ['normal', 'italic', 'oblique']).onChange((fontStyle) => {
  text.attr('fontStyle', fontStyle);
});
fontFolder
  .add(fontConfig, 'fontWeight', ['normal', 'bold', 'bolder', 'lighter', '100', '200', '400'])
  .onChange((fontWeight) => {
    text.attr('fontWeight', fontWeight);
  });
fontFolder.add(fontConfig, 'fontVariant', ['normal', 'small-caps']).onChange((fontVariant) => {
  text.attr('fontVariant', fontVariant);
});

const fillStrokeFolder = gui.addFolder('fill & stroke');
const fillStrokeConfig = {
  fill: '#1890FF',
  fillOpacity: 1,
  stroke: '#F04864',
  strokeOpacity: 1,
  lineWidth: 5,
  lineJoin: 'miter',
  visible: true,
};
fillStrokeFolder.addColor(fillStrokeConfig, 'fill').onChange((color) => {
  text.attr('fill', color);
});
fillStrokeFolder.add(fillStrokeConfig, 'fillOpacity', 0, 1).onChange((fillOpacity) => {
  text.attr('fillOpacity', fillOpacity);
});
fillStrokeFolder.addColor(fillStrokeConfig, 'stroke').onChange((color) => {
  text.attr('stroke', color);
});
fillStrokeFolder.add(fillStrokeConfig, 'lineWidth', 0, 10).onChange((lineWidth) => {
  text.attr('lineWidth', lineWidth);
});
fillStrokeFolder
  .add(fillStrokeConfig, 'lineJoin', ['miter', 'round', 'bevel'])
  .onChange((lineJoin) => {
    text.attr('lineJoin', lineJoin);
  });
fillStrokeFolder.add(fillStrokeConfig, 'strokeOpacity', 0, 1).onChange((strokeOpacity) => {
  text.attr('strokeOpacity', strokeOpacity);
});
fillStrokeFolder.add(fillStrokeConfig, 'visible').onChange((visible) => {
  if (visible) {
    text.style.visibility = 'visible';
    // text.show();
  } else {
    text.style.visibility = 'hidden';
    // text.hide();
  }
});

const layoutFolder = gui.addFolder('layout');
const layoutConfig = {
  letterSpacing: 0,
  textBaseline: 'alphabetic',
};
layoutFolder.add(layoutConfig, 'letterSpacing', 0, 10).onChange((letterSpacing) => {
  text.attr('letterSpacing', letterSpacing);
});
layoutFolder
  .add(layoutConfig, 'textBaseline', [
    'alphabetic',
    'bottom',
    'middle',
    'top',
    'hanging',
    'ideographic',
  ])
  .onChange((textBaseline) => {
    text.attr('textBaseline', textBaseline);
  });

const multilineFolder = gui.addFolder('multiline');
const multilineConfig = {
  breakWords: false,
  wordWrap: false,
  wordWrapWidth: 100,
  lineHeight: 0,
  leading: 0,
  textAlign: 'start',
  whiteSpace: 'pre',
};
multilineFolder.add(multilineConfig, 'breakWords').onChange((breakWords) => {
  text.attr('breakWords', breakWords);
});
multilineFolder.add(multilineConfig, 'wordWrap').onChange((wordWrap) => {
  text.attr('wordWrap', wordWrap);
});

const lineBlocks = [];
multilineFolder.add(multilineConfig, 'wordWrapWidth', 0, 500).onChange((wordWrapWidth) => {
  text.attr('wordWrapWidth', wordWrapWidth);
  lineBlocks.forEach((block) => block.remove());

  text.getLineBoundingRects().forEach(({ x, y, width, height }) => {
    const block = new Rect({
      style: {
        x,
        y,
        width,
        height,
        stroke: 'black',
        lineWidth: 2,
      },
    });
    lineBlocks.push(block);
    text.appendChild(block);
  });
});
multilineFolder.add(multilineConfig, 'lineHeight', 0, 100).onChange((lineHeight) => {
  text.attr('lineHeight', lineHeight);
});
multilineFolder.add(multilineConfig, 'leading', 0, 30).onChange((leading) => {
  text.attr('leading', leading);
});
multilineFolder
  .add(multilineConfig, 'textAlign', ['start', 'end', 'center', 'left', 'right'])
  .onChange((textAlign) => {
    text.attr('textAlign', textAlign);
  });
multilineFolder
  .add(multilineConfig, 'whiteSpace', ['pre', 'normal', 'pre-line'])
  .onChange((whiteSpace) => {
    text.attr('whiteSpace', whiteSpace);
  });
