import { Canvas, CanvasEvent, Polygon } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as d3 from 'd3';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

(async () => {
  // Load data.
  const data = await fetch(
    'https://gw.alipayobjects.com/os/bmw-prod/a09237e0-58e1-40b5-ac18-d4e0b9156306.json',
  ).then((res) => res.json());

  // Set center of projection in latitude and longitude.
  const projection = d3.geoMercator().center([107, 31]);

  // Compute height based on width and feature data.
  const width = 900;
  const height = (() => {
    const [[x0, y0], [x1, y1]] = d3
      .geoPath(projection.fitWidth(width, data))
      .bounds(data);
    const dy = Math.ceil(y1 - y0);
    const l = Math.min(Math.ceil(x1 - x0), dy);
    projection.scale((projection.scale() * (l - 1)) / l).precision(0.2);
    return dy;
  })();

  // Helper function to map abstract data.
  const project = (data) => {
    const { features } = data;
    return features.flatMap((feature) => {
      const { coordinates: C, type } = feature.geometry;
      const coordinates = type === 'MultiPolygon' ? C.flatMap((d) => d) : C;
      return coordinates.map((coordinate) => {
        const P = coordinate.map(projection);
        return {
          name: feature.properties.name,
          x: P.map((d) => d[0]),
          y: P.map((d) => d[1]),
        };
      });
    });
  };

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
        name: 'Roboto',
        url: '/Roboto-Regular.ttf',
      },
      {
        name: 'sans-serif',
        url: 'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/file/A*064aSK2LUPEAAAAAAAAAAAAADmJ7AQ/NotoSansCJKsc-VF.ttf',
      },
    ],
  });
  const canvas = new Canvas({
    container: 'container',
    width,
    height,
    renderer: canvasRenderer,
  });

  canvas.addEventListener(CanvasEvent.READY, () => {
    project(data).forEach(({ x, y }) => {
      const points = x.map((X, i) => [3 * X - 1800, 3 * y[i] - 800]);
      console.log(points);

      canvas.appendChild(
        new Polygon({
          style: {
            stroke: 'black',
            strokeWidth: 1,
            points,
          },
        }),
      );
    });
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
})();
