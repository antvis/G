import { Canvas, Circle, Path, Line, Polyline, CustomElement } from '@antv/g';
import { Arrow } from '@antv/g-components';
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

// create an arrow
const lineArrow = new Arrow({
  attrs: {
    body: new Line({
      attrs: {
        x1: 200,
        y1: 100,
        x2: 0,
        y2: 0,
      },
    }),
    startHead: true,
    stroke: '#1890FF',
    lineWidth: 10,
    cursor: 'pointer',
  },
});
lineArrow.translate(200, 100);

const polylineArrow = new Arrow({
  attrs: {
    body: new Polyline({
      attrs: {
        points: [
          [0, 0],
          [50, 0],
          [50, 50],
          [100, 50],
          [100, 100],
          [150, 100],
        ],
      },
    }),
    startHead: true,
    stroke: '#1890FF',
    lineWidth: 10,
    cursor: 'pointer',
  },
});
polylineArrow.translate(200, 200);

const pathArrow = new Arrow({
  attrs: {
    body: new Path({
      attrs: {
        path: 'M 100,300' + 'l 50,-25' + 'a25,25 -30 0,1 50,-80',
      },
    }),
    startHead: true,
    stroke: '#1890FF',
    lineWidth: 10,
    cursor: 'pointer',
  },
});
pathArrow.translate(100, 150);

canvas.appendChild(lineArrow);
canvas.appendChild(polylineArrow);
canvas.appendChild(pathArrow);

lineArrow.on('mouseenter', () => {
  lineArrow.setAttribute('stroke', '#2FC25B');
});
lineArrow.on('mouseleave', () => {
  lineArrow.setAttribute('stroke', '#1890FF');
});

polylineArrow.on('mouseenter', () => {
  polylineArrow.setAttribute('stroke', '#2FC25B');
});
polylineArrow.on('mouseleave', () => {
  polylineArrow.setAttribute('stroke', '#1890FF');
});

pathArrow.on('mouseenter', () => {
  pathArrow.setAttribute('stroke', '#2FC25B');
});
pathArrow.on('mouseleave', () => {
  pathArrow.setAttribute('stroke', '#1890FF');
});

// define my custom arrow head
class MyCustomArrowHead extends CustomElement {
  static tag = 'my-arrow-head';

  constructor(config) {
    super({
      ...config,
      type: MyCustomArrowHead.tag,
    });

    // just draw a simple triangle, eg. '<|'
    this.head = new Path({
      attrs: {
        path: 'M 10,10 L -10,0 L 10,-10 Z',
        anchor: [0.5, 0.5],
      },
    });

    this.appendChild(this.head);
  }

  attributeChangedCallback(name, value) {
    this.head.setAttribute(name, value);
  }
}

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.on('postrender', () => {
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
  canvas.setConfig({
    renderer: renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
  });
});
rendererFolder.open();

const lineArrowFolder = gui.addFolder('line arrow');
const lineArrowConfig = {
  stroke: '#1890FF',
  lineWidth: 10,
  strokeOpacity: 1,
  startHead: 'default',
  endHead: 'none',
};
lineArrowFolder.addColor(lineArrowConfig, 'stroke').onChange((color) => {
  lineArrow.setAttribute('stroke', color);
});
lineArrowFolder.add(lineArrowConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  lineArrow.setAttribute('lineWidth', lineWidth);
});
lineArrowFolder.add(lineArrowConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  lineArrow.setAttribute('strokeOpacity', opacity);
});
lineArrowFolder
  .add(lineArrowConfig, 'startHead', ['none', 'default', 'circle', 'custom arrowhead'])
  .onChange((type) => {
    if (type === 'none') {
      lineArrow.setAttribute('startHead', false);
    } else if (type === 'default') {
      lineArrow.setAttribute('startHead', true);
    } else if (type === 'circle') {
      lineArrow.setAttribute('startHead', new Circle({ attrs: { r: 10 } }));
    } else if (type === 'custom arrowhead') {
      lineArrow.setAttribute('startHead', new MyCustomArrowHead({ attrs: {} }));
    }
  });
lineArrowFolder.add(lineArrowConfig, 'endHead', ['none', 'default', 'circle', 'custom arrowhead']).onChange((type) => {
  if (type === 'none') {
    lineArrow.setAttribute('endHead', false);
  } else if (type === 'default') {
    lineArrow.setAttribute('endHead', true);
  } else if (type === 'circle') {
    lineArrow.setAttribute('endHead', new Circle({ attrs: { r: 10 } }));
  } else if (type === 'custom arrowhead') {
    lineArrow.setAttribute('endHead', new MyCustomArrowHead({ attrs: {} }));
  }
});
lineArrowFolder.open();

const polylineArrowFolder = gui.addFolder('polyline arrow');
const polylineArrowConfig = {
  stroke: '#1890FF',
  lineWidth: 10,
  strokeOpacity: 1,
  startHead: 'default',
  endHead: 'none',
};
polylineArrowFolder.addColor(polylineArrowConfig, 'stroke').onChange((color) => {
  polylineArrow.setAttribute('stroke', color);
});
polylineArrowFolder.add(polylineArrowConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  polylineArrow.setAttribute('lineWidth', lineWidth);
});
polylineArrowFolder.add(polylineArrowConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  polylineArrow.setAttribute('strokeOpacity', opacity);
});
polylineArrowFolder
  .add(polylineArrowConfig, 'startHead', ['none', 'default', 'circle', 'custom arrowhead'])
  .onChange((type) => {
    if (type === 'none') {
      polylineArrow.setAttribute('startHead', false);
    } else if (type === 'default') {
      polylineArrow.setAttribute('startHead', true);
    } else if (type === 'circle') {
      polylineArrow.setAttribute('startHead', new Circle({ attrs: { r: 10 } }));
    } else if (type === 'custom arrowhead') {
      polylineArrow.setAttribute('startHead', new MyCustomArrowHead({ attrs: {} }));
    }
  });
polylineArrowFolder
  .add(polylineArrowConfig, 'endHead', ['none', 'default', 'circle', 'custom arrowhead'])
  .onChange((type) => {
    if (type === 'none') {
      polylineArrow.setAttribute('endHead', false);
    } else if (type === 'default') {
      polylineArrow.setAttribute('endHead', true);
    } else if (type === 'circle') {
      polylineArrow.setAttribute('endHead', new Circle({ attrs: { r: 10 } }));
    } else if (type === 'custom arrowhead') {
      polylineArrow.setAttribute('endHead', new MyCustomArrowHead({ attrs: {} }));
    }
  });

const pathArrowFolder = gui.addFolder('path arrow');
const pathArrowConfig = {
  stroke: '#1890FF',
  lineWidth: 10,
  strokeOpacity: 1,
  startHead: 'default',
  endHead: 'none',
};
pathArrowFolder.addColor(pathArrowConfig, 'stroke').onChange((color) => {
  pathArrow.setAttribute('stroke', color);
});
pathArrowFolder.add(pathArrowConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  pathArrow.setAttribute('lineWidth', lineWidth);
});
pathArrowFolder.add(pathArrowConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  pathArrow.setAttribute('strokeOpacity', opacity);
});
pathArrowFolder
  .add(pathArrowConfig, 'startHead', ['none', 'default', 'circle', 'custom arrowhead'])
  .onChange((type) => {
    if (type === 'none') {
      pathArrow.setAttribute('startHead', false);
    } else if (type === 'default') {
      pathArrow.setAttribute('startHead', true);
    } else if (type === 'circle') {
      pathArrow.setAttribute('startHead', new Circle({ attrs: { r: 10 } }));
    } else if (type === 'custom arrowhead') {
      pathArrow.setAttribute('startHead', new MyCustomArrowHead({ attrs: {} }));
    }
  });
pathArrowFolder.add(pathArrowConfig, 'endHead', ['none', 'default', 'circle', 'custom arrowhead']).onChange((type) => {
  if (type === 'none') {
    pathArrow.setAttribute('endHead', false);
  } else if (type === 'default') {
    pathArrow.setAttribute('endHead', true);
  } else if (type === 'circle') {
    pathArrow.setAttribute('endHead', new Circle({ attrs: { r: 10 } }));
  } else if (type === 'custom arrowhead') {
    pathArrow.setAttribute('endHead', new MyCustomArrowHead({ attrs: {} }));
  }
});
