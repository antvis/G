import {
  Canvas,
  CanvasEvent,
  Circle,
  CustomElement,
  Image,
  Line,
  Path,
  Polyline,
} from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Arrow } from '@antv/g-components';
import { Plugin } from '@antv/g-plugin-dragndrop';
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
const webgpuRenderer = new WebGPURenderer({
  shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
});

canvasRenderer.registerPlugin(new Plugin());

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

// create an arrow
const lineArrow = new Arrow({
  id: 'lineArrow',
  style: {
    body: new Line({
      style: {
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
    increasedLineWidthForHitTesting: 40,
  },
});
lineArrow.translate(200, 100);

const handle1 = new Circle({
  id: 'handle1',
  style: {
    cx: 400,
    cy: 200,
    r: 10,
    fill: 'red',
    draggable: true,
  },
});
const handle2 = handle1.cloneNode();
handle2.id = 'handle2';
handle2.style.cx = 200;
handle2.style.cy = 100;

const polylineArrow = new Arrow({
  id: 'polylineArrow',
  style: {
    body: new Polyline({
      style: {
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
  id: 'pathArrow',
  style: {
    body: new Path({
      style: {
        d: 'M 100,300' + 'l 50,-25' + 'a25,25 -30 0,1 50,-80',
      },
    }),
    startHead: true,
    stroke: '#1890FF',
    lineWidth: 10,
    cursor: 'pointer',
  },
});
pathArrow.translate(100, 150);

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(lineArrow);
  canvas.appendChild(polylineArrow);
  canvas.appendChild(pathArrow);

  canvas.appendChild(handle1);
  canvas.appendChild(handle2);
});

let shiftX = 0;
let shiftY = 0;
function moveAt(target, canvasX, canvasY) {
  target.setPosition(canvasX - shiftX, canvasY - shiftY);

  if (target.id === 'handle1') {
    const lineBody = lineArrow.getBody();
    lineBody.style.x1 = canvasX - shiftX - 200;
    lineBody.style.y1 = canvasY - shiftY - 100;
  } else if (target.id === 'handle2') {
    const lineBody = lineArrow.getBody();
    lineBody.style.x2 = canvasX - shiftX - 200;
    lineBody.style.y2 = canvasY - shiftY - 100;
  }
}

canvas.addEventListener('dragstart', function (e) {
  const [x, y] = e.target.getPosition();
  shiftX = e.canvasX - x;
  shiftY = e.canvasY - y;

  moveAt(e.target, e.canvasX, e.canvasY);
});
canvas.addEventListener('drag', function (e) {
  moveAt(e.target, e.canvasX, e.canvasY);
});

lineArrow.addEventListener('mouseenter', () => {
  lineArrow.setAttribute('stroke', '#2FC25B');
});
lineArrow.addEventListener('mouseleave', () => {
  lineArrow.setAttribute('stroke', '#1890FF');
});

polylineArrow.addEventListener('mouseenter', () => {
  polylineArrow.setAttribute('stroke', '#2FC25B');
});
polylineArrow.addEventListener('mouseleave', () => {
  polylineArrow.setAttribute('stroke', '#1890FF');
});

pathArrow.addEventListener('mouseenter', () => {
  pathArrow.setAttribute('stroke', '#2FC25B');
});
pathArrow.addEventListener('mouseleave', () => {
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
      style: {
        path: 'M 10,10 L -10,0 L 10,-10 Z',
      },
    });

    this.appendChild(this.head);
  }

  attributeChangedCallback(name, oldValue, value) {
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

const lineArrowFolder = gui.addFolder('line arrow');
const lineArrowConfig = {
  stroke: '#1890FF',
  lineWidth: 10,
  strokeOpacity: 1,
  startHead: 'default',
  endHead: 'none',
  startHeadOffset: 0,
  endHeadOffset: 0,
};

lineArrowFolder.addColor(lineArrowConfig, 'stroke').onChange((color) => {
  lineArrow.setAttribute('stroke', color);
});
lineArrowFolder
  .add(lineArrowConfig, 'lineWidth', 1, 20)
  .onChange((lineWidth) => {
    lineArrow.setAttribute('lineWidth', lineWidth);
  });
lineArrowFolder
  .add(lineArrowConfig, 'strokeOpacity', 0, 1, 0.1)
  .onChange((opacity) => {
    lineArrow.setAttribute('strokeOpacity', opacity);
  });
lineArrowFolder
  .add(lineArrowConfig, 'startHead', [
    'none',
    'default',
    'circle',
    'image',
    'custom arrowhead',
  ])
  .onChange((type) => {
    if (type === 'none') {
      lineArrow.setAttribute('startHead', false);
    } else if (type === 'default') {
      lineArrow.setAttribute('startHead', true);
    } else if (type === 'circle') {
      lineArrow.setAttribute('startHead', new Circle({ style: { r: 10 } }));
    } else if (type === 'image') {
      const image = new Image({
        style: {
          width: 50,
          height: 50,
          anchor: [0.5, 0.5],
          transformOrigin: 'center',
          img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
        },
      });
      image.rotateLocal(90);
      lineArrow.setAttribute('startHead', image);
    } else if (type === 'custom arrowhead') {
      lineArrow.setAttribute('startHead', new MyCustomArrowHead({ style: {} }));
    }
  });
lineArrowFolder
  .add(lineArrowConfig, 'endHead', [
    'none',
    'default',
    'circle',
    'image',
    'custom arrowhead',
  ])
  .onChange((type) => {
    if (type === 'none') {
      lineArrow.setAttribute('endHead', false);
    } else if (type === 'default') {
      lineArrow.setAttribute('endHead', true);
    } else if (type === 'circle') {
      lineArrow.setAttribute('endHead', new Circle({ style: { r: 10 } }));
    } else if (type === 'image') {
      const image = new Image({
        style: {
          width: 50,
          height: 50,
          anchor: [0.5, 0.5],
          transformOrigin: 'center',
          img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
        },
      });
      image.rotateLocal(90);
      lineArrow.setAttribute('endHead', image);
    } else if (type === 'custom arrowhead') {
      lineArrow.setAttribute('endHead', new MyCustomArrowHead({ style: {} }));
    }
  });
lineArrowFolder
  .add(lineArrowConfig, 'startHeadOffset', -20, 20)
  .onChange((startHeadOffset) => {
    lineArrow.setAttribute('startHeadOffset', startHeadOffset);
  });
lineArrowFolder
  .add(lineArrowConfig, 'endHeadOffset', -20, 20)
  .onChange((endHeadOffset) => {
    lineArrow.setAttribute('endHeadOffset', endHeadOffset);
  });
lineArrowFolder.open();

const polylineArrowFolder = gui.addFolder('polyline arrow');
const polylineArrowConfig = {
  stroke: '#1890FF',
  lineWidth: 10,
  strokeOpacity: 1,
  startHead: 'default',
  endHead: 'none',
  startHeadOffset: 0,
  endHeadOffset: 0,
};
polylineArrowFolder
  .addColor(polylineArrowConfig, 'stroke')
  .onChange((color) => {
    polylineArrow.setAttribute('stroke', color);
  });
polylineArrowFolder
  .add(polylineArrowConfig, 'lineWidth', 1, 20)
  .onChange((lineWidth) => {
    polylineArrow.setAttribute('lineWidth', lineWidth);
  });
polylineArrowFolder
  .add(polylineArrowConfig, 'strokeOpacity', 0, 1, 0.1)
  .onChange((opacity) => {
    polylineArrow.setAttribute('strokeOpacity', opacity);
  });
polylineArrowFolder
  .add(polylineArrowConfig, 'startHead', [
    'none',
    'default',
    'circle',
    'image',
    'custom arrowhead',
  ])
  .onChange((type) => {
    if (type === 'none') {
      polylineArrow.setAttribute('startHead', false);
    } else if (type === 'default') {
      polylineArrow.setAttribute('startHead', true);
    } else if (type === 'circle') {
      polylineArrow.setAttribute('startHead', new Circle({ style: { r: 10 } }));
    } else if (type === 'image') {
      const image = new Image({
        style: {
          width: 50,
          height: 50,
          anchor: [0.5, 0.5],
          transformOrigin: 'center',
          img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
        },
      });
      image.rotateLocal(90);
      polylineArrow.setAttribute('startHead', image);
    } else if (type === 'custom arrowhead') {
      polylineArrow.setAttribute(
        'startHead',
        new MyCustomArrowHead({ style: {} }),
      );
    }
  });
polylineArrowFolder
  .add(polylineArrowConfig, 'endHead', [
    'none',
    'default',
    'circle',
    'image',
    'custom arrowhead',
  ])
  .onChange((type) => {
    if (type === 'none') {
      polylineArrow.setAttribute('endHead', false);
    } else if (type === 'default') {
      polylineArrow.setAttribute('endHead', true);
    } else if (type === 'circle') {
      polylineArrow.setAttribute('endHead', new Circle({ style: { r: 10 } }));
    } else if (type === 'image') {
      const image = new Image({
        style: {
          width: 50,
          height: 50,
          anchor: [0.5, 0.5],
          transformOrigin: 'center',
          img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
        },
      });
      image.rotateLocal(90);
      polylineArrow.setAttribute('endHead', image);
    } else if (type === 'custom arrowhead') {
      polylineArrow.setAttribute(
        'endHead',
        new MyCustomArrowHead({ style: {} }),
      );
    }
  });
polylineArrowFolder
  .add(polylineArrowConfig, 'startHeadOffset', -20, 20)
  .onChange((startHeadOffset) => {
    polylineArrow.setAttribute('startHeadOffset', startHeadOffset);
  });
polylineArrowFolder
  .add(polylineArrowConfig, 'endHeadOffset', -20, 20)
  .onChange((endHeadOffset) => {
    polylineArrow.setAttribute('endHeadOffset', endHeadOffset);
  });

const pathArrowFolder = gui.addFolder('path arrow');
const pathArrowConfig = {
  stroke: '#1890FF',
  lineWidth: 10,
  strokeOpacity: 1,
  startHead: 'default',
  endHead: 'none',
  startHeadOffset: 0,
  endHeadOffset: 0,
};
pathArrowFolder.addColor(pathArrowConfig, 'stroke').onChange((color) => {
  pathArrow.setAttribute('stroke', color);
});
pathArrowFolder
  .add(pathArrowConfig, 'lineWidth', 1, 20)
  .onChange((lineWidth) => {
    pathArrow.setAttribute('lineWidth', lineWidth);
  });
pathArrowFolder
  .add(pathArrowConfig, 'strokeOpacity', 0, 1, 0.1)
  .onChange((opacity) => {
    pathArrow.setAttribute('strokeOpacity', opacity);
  });
pathArrowFolder
  .add(pathArrowConfig, 'startHead', [
    'none',
    'default',
    'circle',
    'image',
    'custom arrowhead',
  ])
  .onChange((type) => {
    if (type === 'none') {
      pathArrow.setAttribute('startHead', false);
    } else if (type === 'default') {
      pathArrow.setAttribute('startHead', true);
    } else if (type === 'circle') {
      pathArrow.setAttribute('startHead', new Circle({ style: { r: 10 } }));
    } else if (type === 'image') {
      const image = new Image({
        style: {
          width: 50,
          height: 50,
          anchor: [0.5, 0.5],
          transformOrigin: 'center',
          img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
        },
      });
      image.rotateLocal(90);
      pathArrow.setAttribute('startHead', image);
    } else if (type === 'custom arrowhead') {
      pathArrow.setAttribute('startHead', new MyCustomArrowHead({ style: {} }));
    }
  });
pathArrowFolder
  .add(pathArrowConfig, 'endHead', [
    'none',
    'default',
    'circle',
    'image',
    'custom arrowhead',
  ])
  .onChange((type) => {
    if (type === 'none') {
      pathArrow.setAttribute('endHead', false);
    } else if (type === 'default') {
      pathArrow.setAttribute('endHead', true);
    } else if (type === 'circle') {
      pathArrow.setAttribute('endHead', new Circle({ style: { r: 10 } }));
    } else if (type === 'image') {
      const image = new Image({
        style: {
          width: 50,
          height: 50,
          anchor: [0.5, 0.5],
          transformOrigin: 'center',
          img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
        },
      });
      image.rotateLocal(90);
      pathArrow.setAttribute('endHead', image);
    } else if (type === 'custom arrowhead') {
      pathArrow.setAttribute('endHead', new MyCustomArrowHead({ style: {} }));
    }
  });
pathArrowFolder
  .add(pathArrowConfig, 'startHeadOffset', -20, 20)
  .onChange((startHeadOffset) => {
    pathArrow.setAttribute('startHeadOffset', startHeadOffset);
  });
pathArrowFolder
  .add(pathArrowConfig, 'endHeadOffset', -20, 20)
  .onChange((endHeadOffset) => {
    pathArrow.setAttribute('endHeadOffset', endHeadOffset);
  });
