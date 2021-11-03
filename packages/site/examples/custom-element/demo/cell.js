import { Canvas, Rect, Text, CustomElement } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import * as dat from 'dat.gui';
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

// define my custom arrow head
class Cell extends CustomElement {
  static tag = 'cell';

  constructor(config) {
    super({
      ...config,
      type: Cell.tag,
    });

    this.background = new Rect({
      style: {
        width: 200,
        height: 100,
        fill: '#1890FF',
      },
    });
    const text = new Text({
      style: {
        y: 50,
        fontFamily: 'PingFang SC',
        text: '这是测试文本',
        fontSize: 20,
        fill: 'white',
        stroke: '#F04864',
        lineWidth: 5,
        textBaseline: 'middle',
      },
    });

    this.background.appendChild(text);
    this.appendChild(this.background);
  }

  changeBackgroundColor() {
    this.background.style.fill = 'red';
  }

  attributeChangedCallback(name, oldValue, value) {}
}

const cell1 = new Cell({
  name: 'my-cell',
});
const cell2 = new Cell({
  name: 'my-cell',
});

canvas.appendChild(cell1);
canvas.appendChild(cell2);

cell1.setPosition(100, 100);
cell2.setPosition(100, 300);

canvas.addEventListener('mouseover', (e) => {
  console.log(e.target, e.composedPath());

  const cell = e.composedPath().find((el) => el instanceof Cell);
  if (cell) {
    cell.changeBackgroundColor();
  }
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
canvas.on('afterrender', () => {
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
