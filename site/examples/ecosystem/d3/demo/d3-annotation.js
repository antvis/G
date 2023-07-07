import { Canvas, CanvasEvent } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as CanvaskitRenderer } from '@antv/g-canvaskit';
import { Plugin as PluginCSSSelect } from '@antv/g-plugin-css-select';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';
import { Renderer as WebGPURenderer } from '@antv/g-webgpu';
import * as d3 from 'd3';
import * as d3SvgAnnotation from 'd3-svg-annotation';
import * as lil from 'lil-gui';
import Stats from 'stats.js';

Object.assign(d3, d3SvgAnnotation);

/**
 * inspired by sprite.js
 * @see http://spritejs.com/#/en/guide/d3
 *
 * ported from https://d3-annotation.susielu.com/
 * @see https://bl.ocks.org/susielu/974e41473737320f8db5ae711ded8542
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

const cssSelectPlugin = new PluginCSSSelect();

canvasRenderer.registerPlugin(cssSelectPlugin);
webglRenderer.registerPlugin(cssSelectPlugin);
svgRenderer.registerPlugin(cssSelectPlugin);
webgpuRenderer.registerPlugin(cssSelectPlugin);
canvaskitRenderer.registerPlugin(cssSelectPlugin);

// create chart dimensions
const margin = { top: 20, right: 20, bottom: 30, left: 50 },
  height = 500 - margin.top - margin.bottom;
const maxWidth = 860 - margin.left - margin.right;
let width = 860 - margin.left - margin.right;

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 960,
  height: height + margin.top + margin.bottom,
  renderer: canvasRenderer,
});

const drawBars = async () => {
  const wrapper = d3.select(
    canvas.document.documentElement, // use GCanvas' document element instead of a real DOM
  );

  const svg = wrapper
    .append('g')
    .style('transform', `translate(${margin.left}px, ${margin.top}px)`);

  const parseTime = d3.timeParse('%d-%b-%y');
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  const valueline = d3
    .line()
    .x((d) => x(d.date) || 0)
    .y((d) => y(d.close) || 0);

  const data = await d3.json(
    'https://gw.alipayobjects.com/os/bmw-prod/e5e0e405-e0b0-4585-a10d-caf6b657dc9f.json',
  );

  data.forEach(function (d) {
    d.date = parseTime(d.date);
    d.close = +d.close;
  });

  x.domain(d3.extent(data, (d) => d.date));
  y.domain([0, d3.max(data, (d) => d.close)]);

  svg
    .append('path')
    .data([data])
    .attr('class', 'line')
    .attr('d', valueline)
    .style('stroke', 'black')
    .style('stroke-width', '1px');

  svg
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(x));

  svg.append('g').call(d3.axisLeft(y));

  //Add annotations
  const labels = [
    {
      data: { date: '9-Apr-12', close: 636.23 },
      dy: 37,
      dx: -142,
      subject: { text: 'C', y: 'bottom' },
      id: 'minimize-badge',
    },
    {
      data: { date: '26-Feb-08', close: 119.15 },
      dy: -137,
      dx: 0,
      note: { align: 'middle' },
      subject: { text: 'A', y: 'bottom' },
      id: 'minimize-badge',
    },
    {
      data: { date: '18-Sep-09', close: 185.02 },
      dy: 37,
      dx: 42,
      subject: { text: 'B' },
      id: 'minimize-badge',
    },
  ].map((l) => {
    l.note = Object.assign({}, l.note, {
      title: `Close: ${l.data.close}`,
      label: `${l.data.date}`,
    });
    return l;
  });

  //using a separate type of annotation to control the resize functionality
  const resize = [
    {
      subject: {
        y1: 0,
        y2: height,
      },
      x: width,
      dx: 10,
      dy: height / 2,
      disable: ['connector'],
      note: {
        title: '< >',
        label: 'drag to resize',
        lineType: 'none',
      },
    },
  ];

  const timeFormat = d3.timeFormat('%d-%b-%y');

  window.makeAnnotations = d3
    .annotation()
    .annotations(labels)
    .type(d3.annotationCalloutElbow)
    .accessors({ x: (d) => x(parseTime(d.date)), y: (d) => y(d.close) })
    .accessorsInverse({
      date: (d) => timeFormat(x.invert(d.x)),
      close: (d) => y.invert(d.y),
    })
    .on('subjectover', function (annotation) {
      //cannot reference this if you are using es6 function syntax
      this.append('text')
        .attr('class', 'hover')
        .text(annotation.note.title)
        .attr('text-anchor', 'middle')
        .attr(
          'y',
          annotation.subject.y && annotation.subject.y == 'bottom' ? 50 : -40,
        )
        .attr('x', -15);

      this.append('text')
        .attr('class', 'hover')
        .text(annotation.note.label)
        .attr('text-anchor', 'middle')
        .attr(
          'y',
          annotation.subject.y && annotation.subject.y == 'bottom' ? 70 : -60,
        )
        .attr('x', -15);
    })
    .on('subjectout', function (annotation) {
      this.selectAll('text.hover').remove();
    });

  //Isn't using data for placement so accessors and accessorsInverse
  //are not necessary
  window.makeResize = d3
    .annotation()
    .annotations(resize)
    .type(d3.annotationXYThreshold);

  svg.append('g').attr('class', 'annotation-test').call(makeAnnotations);

  svg.append('g').attr('class', 'annotation-resize').call(makeResize);

  svg.select('.annotation.xythreshold').call(
    d3.drag().on('drag', function (d) {
      const newWidth = Math.max(0, Math.min(maxWidth, d.x + d.dx));
      // d.x = newWidth;

      const threshold = 400;
      if (newWidth < threshold && width >= threshold) {
        makeAnnotations.type(d3.annotationBadge);
        svg.select('g.annotation-test').call(makeAnnotations);
      } else if (newWidth > threshold && width <= threshold) {
        makeAnnotations.type(d3.annotationCalloutElbow);
        svg.select('g.annotation-test').call(makeAnnotations);
      }

      width = newWidth;

      x.range([0, width]);
      makeAnnotations.updatedAccessors();
      makeResize.updatedAccessors();

      svg.select('g.x-axis').call(d3.axisBottom(x));

      svg.select('path.line').attr('d', valueline);
    }),
  );

  // load font
  // const latoFontFace = new FontFace(
  //   'Lato',
  //   'url(https://fonts.gstatic.com/s/lato/v22/S6u9w4BMUTPHh7USSwaPGQ3q5d0N7w.woff2)',
  // );
  // window.document.fonts.add(latoFontFace);
  // latoFontFace.loaded.then((fontFace) => {
  //   console.log(fontFace.family);
  //   canvas.document.documentElement.style.fontFamily = 'Lato';
  // });

  var bitterFontFace = new FontFace(
    'Lato',
    'url(https://fonts.gstatic.com/s/lato/v22/S6u9w4BMUTPHh7USSwaPGQ3q5d0N7w.woff2)',
  );
  document.fonts.add(bitterFontFace);
  bitterFontFace.loaded.then((fontFace) => {
    console.log(fontFace.family);
  });

  document.fonts.ready.then(function () {
    for (const c of document.fonts.values()) {
      console.log(c);
    }

    canvas.document.documentElement.style.fontFamily = 'Lato';
  });

  // apply CSS styles
  canvas.document.querySelectorAll('.annotation path').forEach((path) => {
    path.style.stroke = '#E8336D';
  });

  canvas.document
    .querySelectorAll('.annotation-note-title')
    .forEach((title) => {
      title.style['font-weight'] = 'bold';
    });

  const handle = canvas.document.querySelector('.annotation.xythreshold');
  handle.style.cursor = 'move';
  // console.log(t, svg.selectAll('.annotation path'));
};

canvas.addEventListener(CanvasEvent.READY, () => {
  drawBars();
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
