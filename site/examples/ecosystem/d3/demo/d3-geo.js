import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Plugin as PluginRoughCanvasRenderer } from '@antv/g-plugin-rough-canvas-renderer';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as d3 from 'd3';
import * as lil from 'lil-gui';
import Stats from 'stats.js';
import * as topojson from 'topojson';
import versor from 'versor';

/**
 * @see https://observablehq.com/@d3/sketchy-earth?collection=@d3/d3-geo
 */

function curveContext(curve) {
  return {
    moveTo(x, y) {
      curve.lineStart();
      curve.point(x, y);
    },
    lineTo(x, y) {
      curve.point(x, y);
    },
    closePath() {
      curve.lineEnd();
    },
  };
}

function geoCurvePath(curve, projection, context) {
  return (object) => {
    const pathContext = context === undefined ? d3.path() : context;
    d3.geoPath(projection, curveContext(curve(pathContext)))(object);
    return context === undefined ? pathContext + '' : undefined;
  };
}

function zoom(
  projection,
  {
    // Capture the projection’s original scale, before any zooming.
    scale = projection._scale === undefined
      ? (projection._scale = projection.scale())
      : projection._scale,
    scaleExtent = [0.8, 8],
  } = {},
) {
  let v0, q0, r0, a0, tl;

  const zoom = d3
    .zoom()
    .scaleExtent(scaleExtent.map((x) => x * scale))
    .on('start', zoomstarted)
    .on('zoom', zoomed);

  function point(event, that) {
    const t = d3.pointers(event, that);

    if (t.length !== tl) {
      tl = t.length;
      if (tl > 1) a0 = Math.atan2(t[1][1] - t[0][1], t[1][0] - t[0][0]);
      zoomstarted.call(that, event);
    }

    return tl > 1
      ? [
          d3.mean(t, (p) => p[0]),
          d3.mean(t, (p) => p[1]),
          Math.atan2(t[1][1] - t[0][1], t[1][0] - t[0][0]),
        ]
      : t[0];
  }

  function zoomstarted(event) {
    v0 = versor.cartesian(projection.invert(point(event, this)));
    q0 = versor((r0 = projection.rotate()));
  }

  function zoomed(event) {
    projection.scale(event.transform.k);
    const pt = point(event, this);
    const v1 = versor.cartesian(projection.rotate(r0).invert(pt));
    const delta = versor.delta(v0, v1);
    let q1 = versor.multiply(q0, delta);

    // For multitouch, compose with a rotation around the axis.
    if (pt[2]) {
      const d = (pt[2] - a0) / 2;
      const s = -Math.sin(d);
      const c = Math.sign(Math.cos(d));
      q1 = versor.multiply([Math.sqrt(1 - s * s), 0, 0, c * s], q1);
    }

    projection.rotate(versor.rotation(q1));

    // In vicinity of the antipode (unstable) of q0, restart.
    if (delta[0] < 0.7) zoomstarted.call(this, event);
  }

  return Object.assign(
    (selection) =>
      selection
        .property('__zoom', d3.zoomIdentity.scale(projection.scale()))
        .call(zoom),
    {
      on(type, ...options) {
        return options.length
          ? (zoom.on(type, ...options), this)
          : zoom.on(type);
      },
    },
  );
}

(async () => {
  let world = await d3.json(
    'https://gw.alipayobjects.com/os/bmw-prod/d518b501-e0f9-48e0-996f-f6662c04a439.json',
  );

  const width = 500;
  const curve = d3.curveBasisClosed;
  const projection = d3.geoOrthographic().precision(0.1);
  const path = geoCurvePath(curve, projection);
  const minArea = Math.pow(10, 2 - 1);
  const sphere = { type: 'Sphere' };

  const [[x0, y0], [x1, y1]] = d3
    .geoPath(projection.fitWidth(width, sphere))
    .bounds(sphere);
  const dy = Math.ceil(y1 - y0),
    l = Math.min(Math.ceil(x1 - x0), dy);
  projection.scale((projection.scale() * (l - 1)) / l).precision(0.2);
  const height = dy;

  let topology = world;
  topology = topojson.presimplify(topology);
  topology = topojson.simplify(topology, minArea);
  const land = topojson.feature(topology, topology.objects.land);

  const canvasRenderer = new CanvasRenderer();
  // sketchy with rough.js
  canvasRenderer.registerPlugin(new PluginRoughCanvasRenderer());
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
    const svg = d3.select(
      canvas.document.documentElement, // use GCanvas' document element instead of a real DOM
    );

    const outline = svg
      .append('path')
      .attr('stroke', 'black')
      .attr('fill', 'white');
    const feature = svg
      .append('path')
      .attr('stroke', 'black')
      .attr('fill', 'white');

    function render() {
      outline.attr('d', path(sphere));
      feature.attr('d', path(land));
    }

    svg
      .call(zoom(projection).on('zoom.render end.render', render))
      .call(render);
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
