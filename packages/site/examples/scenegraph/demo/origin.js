import { Canvas, CanvasEvent, Circle, Group, Polyline, Rect, Text } from '@antv/g';
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
      url: '/NotoSansCJKsc-VF.ttf',
    },
  ],
});
const webgpuRenderer = new WebGPURenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

canvas.addEventListener(CanvasEvent.READY, () => {
  /**
   * Circle
   */

  const circle = new Circle({
    style: {
      cx: 100,
      cy: 100,
      r: 100,
      fill: '#1890FF',
    },
  });
  canvas.appendChild(circle);
  circle.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.5)' }], {
    duration: 500,
    easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
    iterations: Infinity,
    direction: 'alternate',
  });

  const circleOrigin = new Circle({
    id: 'circleOrigin',
    style: {
      r: 10,
      fill: '#F04864',
    },
  });
  circleOrigin.setPosition(100, 100);
  canvas.appendChild(circleOrigin);

  /**
   * Group
   */

  const group = new Group({ id: 'group' });
  const child1 = new Rect({
    id: 'rect1',
    style: {
      width: 100,
      height: 100,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
      radius: 8,
    },
  });
  group.appendChild(child1);
  group.setPosition(200, 100);

  // original position
  const original = child1.cloneNode();
  original.setPosition(200, 100);
  original.style.opacity = 0.5;
  canvas.appendChild(original);

  const groupOrigin = new Circle({
    id: 'group-origin',
    style: {
      r: 30,
      fill: '#F04864',
    },
  });
  const originText = new Text({
    id: 'text',
    style: {
      fontFamily: 'PingFang SC',
      text: 'Origin',
      fontSize: 16,
      fill: '#fFF',
      textAlign: 'center',
      textBaseline: 'middle',
    },
  });

  groupOrigin.appendChild(originText);
  groupOrigin.setPosition(200, 100);

  canvas.appendChild(group);
  canvas.appendChild(groupOrigin);

  /**
   * Text
   */
  const text = new Text({
    id: 'rotated-text',
    style: {
      fontFamily: 'PingFang SC',
      text: 'Lorem ipsum',
      fontSize: 32,
      fill: '#FFF',
      stroke: '#1890FF',
      lineWidth: 5,
      // textAlign: 'center',
      // textBaseline: 'middle',
    },
  });
  text.setPosition(100, 400);
  canvas.appendChild(text);
  const textOrigin = new Circle({
    id: 'textOrigin',
    style: {
      r: 10,
      fill: '#F04864',
    },
  });
  textOrigin.setPosition(100, 400);
  canvas.appendChild(textOrigin);

  /**
   * Polyline
   */
  const points = [
    [50, 50],
    [100, 50],
    [100, 100],
    [150, 100],
    [150, 150],
    [200, 150],
  ];
  const polyline = new Polyline({
    style: {
      points,
      stroke: '#1890FF',
      lineWidth: 2,
    },
  });
  canvas.appendChild(polyline);
  polyline.setPosition(300, 300);
  const polylineOrigin = new Circle({
    id: 'polyline-origin',
    style: {
      r: 10,
      fill: '#F04864',
    },
  });
  polylineOrigin.setPosition(300, 300);
  canvas.appendChild(polylineOrigin);

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
    group.rotateLocal(1);
    text.rotateLocal(1);
    polyline.rotateLocal(1);
  });

  // GUI
  const gui = new lil.GUI({ autoPlace: false });
  $wrapper.appendChild(gui.domElement);
  const rendererFolder = gui.addFolder('renderer');
  const rendererConfig = {
    renderer: 'canvas',
  };
  rendererFolder
    .add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg'])
    .onChange((renderer) => {
      canvas.setRenderer(
        renderer === 'canvas' ? canvasRenderer : renderer === 'webgl' ? webglRenderer : svgRenderer,
      );
    });
  rendererFolder.open();

  const circleFolder = gui.addFolder('animated circle');
  const circleConfig = {
    transformOriginX: 100,
    transformOriginY: 100,
    transformOrigin: 'center',
  };
  circleFolder
    .add(circleConfig, 'transformOrigin', [
      'left top',
      'center',
      'right bottom',
      '50% 50%',
      '50px 50px',
    ])
    .onChange((transformOrigin) => {
      // set transformOrigin
      circle.style.transformOrigin = transformOrigin;

      // get calculated origin
      const [ox, oy] = circle.getOrigin();
      const x = 100;
      const y = 100;

      circleOrigin.setPosition(x + ox, y + oy);

      // update dat.gui
      circleConfig.transformOriginX = ox + x;
      circleConfig.transformOriginY = oy + y;
    });
  circleFolder
    .add(circleConfig, 'transformOriginX', -200, 200)
    .onChange((tx) => {
      circle.style.transformOrigin = `${tx} ${circleConfig.transformOriginY}`;

      const [ox, oy] = circle.getOrigin();
      const x = 100;
      const y = 100;
      circleOrigin.setPosition(x + ox, y + oy);
    })
    .listen();
  circleFolder
    .add(circleConfig, 'transformOriginY', -200, 200)
    .onChange((ty) => {
      circle.style.transformOrigin = `${circleConfig.transformOriginX}px ${ty}px`;

      const [ox, oy] = circle.getOrigin();
      const x = 100;
      const y = 100;
      circleOrigin.setPosition(x + ox, y + oy);
    })
    .listen();
  circleFolder.open();

  const textFolder = gui.addFolder('text');
  const textConfig = {
    transformOriginX: 0,
    transformOriginY: 0,
    transformOrigin: 'left top',
  };
  textFolder
    .add(textConfig, 'transformOrigin', [
      'left top',
      'center',
      'right bottom',
      '50% 50%',
      '50px 50px',
    ])
    .onChange((transformOrigin) => {
      // set transformOrigin
      text.style.transformOrigin = transformOrigin;

      // get calculated origin
      const [ox, oy, oz] = text.getOrigin();
      const [x, y, z] = text.getPosition(); // left top corner of Bounds

      textOrigin.setPosition(x + ox, y + oy, z + oz);

      // update dat.gui
      textConfig.transformOriginX = ox + x;
      textConfig.transformOriginY = oy + y;
    });
  textFolder
    .add(textConfig, 'transformOriginX', -200, 200)
    .onChange((tx) => {
      text.style.transformOrigin = `${tx} ${textConfig.transformOriginY}`;

      const [ox, oy] = text.getOrigin();
      const [lx, ly] = text.getPosition();
      textOrigin.setPosition(lx + ox, ly + oy);
    })
    .listen();
  textFolder
    .add(textConfig, 'transformOriginY', -200, 200)
    .onChange((ty) => {
      text.style.transformOrigin = `${textConfig.transformOriginX}px ${ty}px`;

      const [ox, oy] = text.getOrigin();
      const [lx, ly] = text.getPosition();
      textOrigin.setPosition(lx + ox, ly + oy);
    })
    .listen();
  textFolder.open();

  let lastCloned = child1;
  const groupFolder = gui.addFolder('group');
  const groupConfig = {
    transformOriginX: 0,
    transformOriginY: 0,
    transformOrigin: 'left top',
    appendChild: () => {
      // // reset rotation
      // group.setEulerAngles(0);
      // // clone child
      // const cloned = lastCloned.cloneNode();
      // cloned.id = 'cloned';
      // cloned.translateLocal(0, 100);
      // group.appendChild(cloned);
      // lastCloned = cloned;
      // // reset transform origin, which will case re-calc origin
      // group.style.transformOrigin = group.style.transformOrigin || 'left top';
      // // get calculated origin
      // const [ox, oy, oz] = group.style.origin;
      // const [x, y, z] = group.getPosition(); // left top corner of Bounds
      // origin.setPosition(x + ox, y + oy, z + oz);
      // // update dat.gui
      // groupConfig.originX = ox;
      // groupConfig.originY = oy;
    },
  };
  groupFolder
    .add(groupConfig, 'transformOrigin', [
      'left top',
      'center',
      'right bottom',
      '50% 50%',
      '50px 50px',
    ])
    .onChange((transformOrigin) => {
      // set transformOrigin
      group.style.transformOrigin = transformOrigin;

      // get calculated origin
      const [ox, oy, oz] = group.getOrigin();
      const [x, y, z] = group.getPosition(); // left top corner of Bounds

      groupOrigin.setPosition(x + ox, y + oy, z + oz);

      // update dat.gui
      groupConfig.transformOriginX = ox + x;
      groupConfig.transformOriginY = oy + y;
    });
  groupFolder
    .add(groupConfig, 'transformOriginX', -200, 200)
    .onChange((tx) => {
      group.style.transformOrigin = `${tx} ${groupConfig.transformOriginY}`;

      const [ox, oy] = group.getOrigin();
      const [lx, ly] = group.getPosition();
      groupOrigin.setPosition(lx + ox, ly + oy);
    })
    .listen();
  groupFolder
    .add(groupConfig, 'transformOriginY', -200, 200)
    .onChange((ty) => {
      group.style.transformOrigin = `${groupConfig.transformOriginX}px ${ty}px`;

      const [ox, oy] = group.getOrigin();
      const [lx, ly] = group.getPosition();
      groupOrigin.setPosition(lx + ox, ly + oy);
    })
    .listen();
  groupFolder.add(groupConfig, 'appendChild');
  groupFolder.open();

  const polylineFolder = gui.addFolder('polyline');
  const polylineConfig = {
    transformOriginX: 0,
    transformOriginY: 0,
    transformOrigin: 'left top',
  };
  polylineFolder
    .add(polylineConfig, 'transformOrigin', [
      'left top',
      'center',
      'right bottom',
      '50% 50%',
      '50px 50px',
    ])
    .onChange((transformOrigin) => {
      // set transformOrigin
      polyline.style.transformOrigin = transformOrigin;

      // get calculated origin
      const [ox, oy] = polyline.getOrigin();
      const x = 300;
      const y = 300;

      // set origin's position
      polylineOrigin.setPosition(x + ox, y + oy);

      // update dat.gui
      polylineConfig.transformOriginX = ox;
      polylineConfig.transformOriginY = oy;
    });
  polylineFolder
    .add(polylineConfig, 'transformOriginX', -200, 200)
    .onChange((tx) => {
      polyline.style.transformOrigin = `${tx} ${polylineConfig.transformOriginY}`;

      const [ox, oy] = polyline.getOrigin();
      const x = 300;
      const y = 300;
      polylineOrigin.setPosition(x + ox, y + oy);
    })
    .listen();
  polylineFolder
    .add(polylineConfig, 'transformOriginY', -200, 200)
    .onChange((ty) => {
      polyline.style.transformOrigin = `${polylineConfig.transformOriginX}px ${ty}px`;

      const [ox, oy] = polyline.getOrigin();
      const x = 300;
      const y = 300;
      polylineOrigin.setPosition(x + ox, y + oy);
    })
    .listen();
  polylineFolder.open();
});
