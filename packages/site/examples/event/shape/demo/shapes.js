import { Circle, Rect, Ellipse, Image, Line, Polyline, Path, Polygon, Canvas } from '@antv/g';
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

const circle = new Circle({
  attrs: {
    r: 50,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    cursor: 'pointer',
  },
});
const ellipse = new Ellipse({
  attrs: {
    rx: 60,
    ry: 80,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    cursor: 'pointer',
  },
});
const rect = new Rect({
  attrs: {
    width: 80,
    height: 60,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
    radius: 8,
    cursor: 'pointer',
  },
});
const image = new Image({
  attrs: {
    width: 100,
    height: 100,
    img: 'https://gw.alipayobjects.com/mdn/rms_6ae20b/afts/img/A*N4ZMS7gHsUIAAAAAAAAAAABkARQnAQ',
    cursor: 'pointer',
  },
});
const line = new Line({
  attrs: {
    x1: 0,
    y1: 0,
    x2: 200,
    y2: 0,
    stroke: '#1890FF',
    lineWidth: 10,
    cursor: 'pointer',
  },
});
const polyline = new Polyline({
  attrs: {
    points: [
      [50, 50],
      [100, 50],
      [100, 100],
      [150, 100],
      [150, 150],
      [200, 150],
      [200, 200],
      [250, 200],
    ],
    stroke: '#1890FF',
    lineWidth: 10,
    cursor: 'pointer',
  },
});
const path = new Path({
  attrs: {
    path:
      'M 100,300' +
      'l 50,-25' +
      'a25,25 -30 0,1 50,-25' +
      'l 50,-25' +
      'a25,50 -30 0,1 50,-25' +
      'l 50,-25' +
      'a25,75 -30 0,1 50,-25' +
      'l 50,-25' +
      'a25,100 -30 0,1 50,-25' +
      'l 50,-25' +
      'l 0, 200,' +
      'z',
    lineWidth: 10,
    lineJoin: 'round',
    stroke: '#1890FF',
  },
});
const polygon = new Polygon({
  attrs: {
    points: [
      [200, 100],
      [400, 100],
      [400 + 200 * Math.sin(Math.PI / 6), 100 + 200 * Math.cos(Math.PI / 6)],
      [400, 100 + 200 * Math.cos(Math.PI / 6) * 2],
      [200, 100 + 200 * Math.cos(Math.PI / 6) * 2],
      [200 - 200 * Math.sin(Math.PI / 6), 100 + 200 * Math.cos(Math.PI / 6)],
    ],
    stroke: '#1890FF',
    fill: '#1890FF',
    lineWidth: 10,
  },
});

circle.setPosition(100, 100);
canvas.appendChild(circle);

ellipse.setPosition(220, 100);
canvas.appendChild(ellipse);

rect.setPosition(300, 100);
canvas.appendChild(rect);

image.setPosition(400, 100);
canvas.appendChild(image);

line.setPosition(100, 200);
canvas.appendChild(line);

polyline.setPosition(0, 200);
polyline.rotate(20);
canvas.appendChild(polyline);

path.setPosition(160, 200);
path.rotate(20);
path.scale(0.5);
canvas.appendChild(path);

polygon.setPosition(340, 200);
polygon.scale(0.3);
canvas.appendChild(polygon);

circle.on('mouseenter', () => {
  circle.attr('fill', '#2FC25B');
});
circle.on('mouseleave', () => {
  circle.attr('fill', '#1890FF');
});
ellipse.on('mouseenter', () => {
  ellipse.attr('fill', '#2FC25B');
});
ellipse.on('mouseleave', () => {
  ellipse.attr('fill', '#1890FF');
});
rect.on('mouseenter', () => {
  rect.attr('fill', '#2FC25B');
});
rect.on('mouseleave', () => {
  rect.attr('fill', '#1890FF');
});
line.on('mouseenter', () => {
  line.attr('stroke', '#2FC25B');
});
line.on('mouseleave', () => {
  line.attr('stroke', '#1890FF');
});
polyline.on('mouseenter', () => {
  polyline.attr('stroke', '#2FC25B');
});
polyline.on('mouseleave', () => {
  polyline.attr('stroke', '#1890FF');
});
path.on('mouseenter', () => {
  path.attr('stroke', '#2FC25B');
});
path.on('mouseleave', () => {
  path.attr('stroke', '#1890FF');
});
polygon.on('mouseenter', () => {
  polygon.attr('stroke', '#2FC25B');
});
polygon.on('mouseleave', () => {
  polygon.attr('stroke', '#1890FF');
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
