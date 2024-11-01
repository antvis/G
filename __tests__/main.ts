import Stats from 'stats.js';
import * as lil from 'lil-gui';
import '@antv/g-camera-api';
import { Canvas, CanvasEvent, runtime } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
// WebGL & WebGPU renderer need to be built with rollup first.
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import { Plugin as DragAndDropPlugin } from '@antv/g-plugin-dragndrop';
import * as basic2d from './demos/2d';
import * as basic3d from './demos/3d';
import * as animation from './demos/animation';
import * as d3 from './demos/d3';
import * as plugin from './demos/plugin';
import * as hammerjs from './demos/hammerjs';
import * as lottie from './demos/lottie';
import * as perf from './demos/perf';
import * as bugfix from './demos/bugfix';
import * as event from './demos/event';
import * as camera from './demos/camera';
import * as canvasCase from './demos/canvas';

const tests = {
  ...createSpecRender(namespace(basic2d, '2d')),
  ...createSpecRender(namespace(basic3d, '3d')),
  ...createSpecRender(namespace(animation, 'animation')),
  ...createSpecRender(namespace(d3, 'd3')),
  ...createSpecRender(namespace(plugin, 'plugin')),
  ...createSpecRender(namespace(hammerjs, 'hammerjs')),
  ...createSpecRender(namespace(lottie, 'lottie')),
  ...createSpecRender(namespace(bugfix, 'bugfix')),
  ...createSpecRender(namespace(perf, 'perf')),
  ...createSpecRender(namespace(event, 'event')),
  ...createSpecRender(namespace(camera, 'camera')),
  ...createSpecRender(namespace(canvasCase, 'canvas')),
};

const renderers = {
  canvas: CanvasRenderer,
  svg: SVGRenderer,
  canvaskit: CanvaskitRenderer,
  webgl: WebGLRenderer,
  webgpu: WebGPURenderer,
};
const app = document.getElementById('app') as HTMLElement;
let currentContainer = document.createElement('div');
let canvas: Canvas;
let prevAfter;
const normalizeName = (name: string) => name.replace(/-/g, '').toLowerCase();
const renderOptions = (keyword = '') => {
  const matched = Object.keys(tests)
    .filter((key) => normalizeName(key).includes(normalizeName(keyword)))
    .map(createOption);
  selectChart.replaceChildren(...matched);
  selectChart.value = '';
};

// Select for chart.
const selectChart = document.createElement('select') as HTMLSelectElement;
selectChart.style.margin = '1em 1em 1em 96px';
renderOptions();
selectChart.onchange = () => {
  const { value } = selectChart;
  history.pushState(
    { value },
    '',
    `?name=${value}&renderer=${selectRenderer.value}`,
  );
  plot();
};
document.onkeydown = (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
  switch (event.key) {
    case 'ArrowLeft': {
      if (selectChart.selectedIndex > 0) {
        selectChart.selectedIndex--;
        // @ts-ignore
        selectChart.onchange();
      } else {
        alert('This is the first test case.');
      }
      break;
    }
    case 'ArrowRight': {
      if (selectChart.selectedIndex < selectChart.options.length - 1) {
        selectChart.selectedIndex++;
        // @ts-ignore
        selectChart.onchange();
      } else {
        alert('This is the last test case.');
      }
      break;
    }
  }
};

// Select for renderer.
const selectRenderer = document.createElement('select');
selectRenderer.style.margin = '1em';
selectRenderer.append(...Object.keys(renderers).map(createOption));
selectRenderer.onchange = () => {
  const { value } = selectRenderer;
  history.pushState(
    { value },
    '',
    `?name=${selectChart.value}&renderer=${value}`,
  );
  plot();
};

// Search input
const searchInput = document.createElement('input');
searchInput.style.margin = '1em';
searchInput.placeholder = 'Search test case';
searchInput.onkeyup = () => {
  const { value } = searchInput;
  renderOptions(value);
};

// Render button
const renderBtn = document.createElement('button');
renderBtn.textContent = 'Render';
renderBtn.onclick = () => {
  if (selectChart.value) plot();
};

// Span for tips.
const span = document.createElement('span');
span.textContent = 'Press left or right to view more.';
span.style.fontSize = '10px';

addEventListener('popstate', (event) => {
  const { value } = history.state;
  selectChart.value = value;
  plot();
});

// @ts-ignore
const initialValue = new URL(location).searchParams.get('name') as string;
// @ts-ignore
const initialRenderer = new URL(location).searchParams.get(
  'renderer',
) as string;
if (tests[initialValue]) selectChart.value = initialValue;
if (renderers[initialRenderer]) selectRenderer.value = initialRenderer;
app.append(selectChart);
app.append(searchInput);
app.append(selectRenderer);
app.append(span);
app.append(renderBtn);
plot();

async function plot() {
  if (currentContainer) {
    currentContainer.remove();
    if (canvas) canvas.destroy(false, true);
    if (prevAfter) prevAfter();
  }
  currentContainer = document.createElement('div');
  app.append(currentContainer);
  const render = tests[selectChart.value];
  render?.(currentContainer);
}

function createOption(key) {
  const option = document.createElement('option');
  option.value = key;
  option.textContent = key;
  if (key === (window['DEFAULT_RENDERER'] || 'canvas')) {
    option.selected = true;
  }
  return option;
}

function namespace(object, name) {
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => [`${name}-${key}`, value]),
  );
}

function createSpecRender(object) {
  const specRender = (generate) => {
    return async (container) => {
      // Select render is necessary for spec tests.
      selectRenderer.style.display = 'inline';

      const renderer = new renderers[selectRenderer.value]({
        // Used for WebGL renderer
        wasmDir: '/',
        fonts: [
          {
            name: 'Roboto',
            url: '/Roboto-Regular.ttf',
          },
          {
            name: 'sans-serif',
            url: 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/file/A*064aSK2LUPEAAAAAAAAAAAAADmJ7AQ/NotoSansCJKsc-VF.ttf',
          },
        ],
        // Used for WebGPU renderer
        shaderCompilerPath: '/glsl_wgsl_compiler_bg.wasm',
        // enableAutoRendering: false,
        // enableDirtyRectangleRendering: false,
        // enableDirtyRectangleRenderingDebug: true,
      });

      if (generate.initRenderer) {
        generate.initRenderer(renderer, selectRenderer.value);
      }

      renderer.registerPlugin(
        new DragAndDropPlugin({ dragstartDistanceThreshold: 1 }),
      );

      const $div = document.createElement('div');
      canvas = new Canvas({
        container: $div,
        width: window['CANVAS_WIDTH'] || 640,
        height: window['CANVAS_HEIGHT'] || 640,
        cleanUpOnDestroy: false,
        renderer,
      });

      // @ts-ignore
      window.__g_instances__ = [canvas];

      // stats
      const stats = new Stats();
      stats.showPanel(0);
      const $stats = stats.dom;
      $stats.style.position = 'fixed';
      $stats.style.left = '2px';
      $stats.style.top = '2px';
      // document.body.appendChild($stats);

      // GUI
      const gui = new lil.GUI({ autoPlace: false });
      $div.appendChild(gui.domElement);

      await generate({ canvas, renderer, container: $div, gui });

      canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
        stats.update();
      });

      if (
        selectRenderer.value === 'canvas' &&
        renderer.getConfig().enableDirtyRectangleRendering &&
        renderer.getConfig().enableDirtyRectangleRenderingDebug
      ) {
        // display dirty rectangle
        const $dirtyRectangle = document.createElement('div');
        $dirtyRectangle.style.cssText = `
        position: absolute;
        pointer-events: none;
        background: rgba(255, 0, 0, 0.5);
        `;
        $div.appendChild($dirtyRectangle);
        canvas.addEventListener(CanvasEvent.DIRTY_RECTANGLE, (e) => {
          const { dirtyRect } = e.detail;
          const { x, y, width, height } = dirtyRect;
          const dpr = window.devicePixelRatio;
          // convert from canvas coords to viewport
          $dirtyRectangle.style.left = `${x / dpr}px`;
          $dirtyRectangle.style.top = `${y / dpr}px`;
          $dirtyRectangle.style.width = `${width / dpr}px`;
          $dirtyRectangle.style.height = `${height / dpr}px`;
        });
      }

      container.append($div);
    };
  };
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => [key, specRender(value)]),
  );
}
