import { Canvas } from '@antv/g-canvas';
import { Ellipse } from '@antv/g-core';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

const ellipse = new Ellipse({
  attrs: {
    x: 300,
    y: 200,
    rx: 100,
    ry: 150,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

canvas.appendChild(ellipse);

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);
canvas.onFrame(() => {
  if (stats) {
    stats.update();
  }
});

// GUI
const gui = new dat.GUI({ autoPlace: false });
$wrapper.appendChild(gui.domElement);
const ellipseFolder = gui.addFolder('ellipse');
const ellipseConfig = {
  rx: 100,
  ry: 150,
  fill: '#1890FF',
  stroke: '#F04864',
  lineWidth: 4,
  fillOpacity: 1,
  strokeOpacity: 1,
};
ellipseFolder.add(ellipseConfig, 'rx', 50, 200).onChange((radius) => {
  ellipse.attr('rx', radius);
});
ellipseFolder.add(ellipseConfig, 'ry', 50, 200).onChange((radius) => {
  ellipse.attr('ry', radius);
});
ellipseFolder.addColor(ellipseConfig, 'fill').onChange((color) => {
  ellipse.attr('fill', color);
});
ellipseFolder.addColor(ellipseConfig, 'stroke').onChange((color) => {
  ellipse.attr('stroke', color);
});
ellipseFolder.add(ellipseConfig, 'lineWidth', 1, 20).onChange((lineWidth) => {
  ellipse.attr('lineWidth', lineWidth);
});
ellipseFolder.add(ellipseConfig, 'fillOpacity', 0, 1, 0.1).onChange((opacity) => {
  ellipse.attr('fillOpacity', opacity);
});
ellipseFolder.add(ellipseConfig, 'strokeOpacity', 0, 1, 0.1).onChange((opacity) => {
  ellipse.attr('strokeOpacity', opacity);
});
ellipseFolder.open();
