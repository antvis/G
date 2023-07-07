import { Canvas, CanvasEvent, Circle, Text } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

/**
 * Pick target by calling API instead of interactive events.
 * DisplayObject's `interactive` & `visibility` will affect picking but not `opacity`.
 *
 * You can move the red picking point with mouse click or lil-gui.
 *
 * more informations @see /zh/docs/api/builtin-objects/document#elementsfrompoint
 */

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
  // create a circle
  const circle1 = new Circle({
    id: 'circle1',
    style: {
      cx: 100,
      cy: 100,
      r: 100,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    },
  });
  canvas.appendChild(circle1);

  // clone another circle
  const circle2 = circle1.cloneNode();
  circle2.id = 'circle2';
  circle2.translate(50, 50);
  canvas.appendChild(circle2);

  const result = new Text({
    interactive: false, // we don't want picking itself
    style: {
      x: 50,
      y: 300,
      fontSize: 32,
      fill: 'black',
    },
  });
  canvas.appendChild(result);

  // represent the picking point
  const pickingPoint = new Circle({
    interactive: false, // we don't want picking itself
    style: {
      cx: 150,
      cy: 150,
      r: 20,
      fill: '#F04864',
    },
  });
  canvas.appendChild(pickingPoint);

  canvas.addEventListener('click', (e) => {
    pickingPoint.setLocalPosition(e.canvasX, e.canvasY);

    pickingConfig.x = e.canvasX;
    pickingConfig.y = e.canvasY;
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
    .add(rendererConfig, 'renderer', ['canvas', 'webgl', 'svg'])
    .onChange((renderer) => {
      canvas.setRenderer(
        renderer === 'canvas'
          ? canvasRenderer
          : renderer === 'webgl'
          ? webglRenderer
          : svgRenderer,
      );
    });
  rendererFolder.open();

  const pickingFolder = gui.addFolder('point for picking');
  const pickingConfig = {
    x: 150,
    y: 150,
    elementFromPoint: async () => {
      const target = await canvas.document.elementFromPoint(
        pickingConfig.x,
        pickingConfig.y,
      );

      result.style.text = (target && target.id) || 'null';
    },
    elementsFromPoint: async () => {
      const targets = await canvas.document.elementsFromPoint(
        pickingConfig.x,
        pickingConfig.y,
      );

      result.style.text =
        '[' + targets.map((target) => target.id).join(', ') + ']';
    },
  };
  pickingFolder
    .add(pickingConfig, 'x', -100, 400)
    .onChange((x) => {
      const [_, y] = pickingPoint.getLocalPosition();
      pickingPoint.setLocalPosition(x, y);
    })
    .listen();
  pickingFolder
    .add(pickingConfig, 'y', -100, 400)
    .onChange((y) => {
      const [x, _] = pickingPoint.getLocalPosition();
      pickingPoint.setLocalPosition(x, y);
    })
    .listen();
  pickingFolder.add(pickingConfig, 'elementFromPoint').name('elementFromPoint');
  pickingFolder
    .add(pickingConfig, 'elementsFromPoint')
    .name('elementsFromPoint');
  pickingFolder.open();

  const circle1Folder = gui.addFolder('circle1');
  const circle1Config = {
    interactive: true,
    visibility: 'visible',
    opacity: 1,
  };
  circle1Folder.add(circle1Config, 'interactive').onChange((interactive) => {
    circle1.interactive = interactive;
  });
  circle1Folder
    .add(circle1Config, 'visibility', ['visible', 'hidden'])
    .onChange((visibility) => {
      circle1.style.visibility = visibility;
    });
  circle1Folder.add(circle1Config, 'opacity', 0, 1).onChange((opacity) => {
    circle1.style.opacity = opacity;
  });
  const circle2Folder = gui.addFolder('circle2');
  const circle2Config = {
    interactive: true,
    visibility: 'visible',
    opacity: 1,
  };
  circle2Folder.add(circle2Config, 'interactive').onChange((interactive) => {
    circle2.interactive = interactive;
  });
  circle2Folder
    .add(circle2Config, 'visibility', ['visible', 'hidden'])
    .onChange((visibility) => {
      circle2.style.visibility = visibility;
    });
  circle2Folder.add(circle2Config, 'opacity', 0, 1).onChange((opacity) => {
    circle2.style.opacity = opacity;
  });
});
