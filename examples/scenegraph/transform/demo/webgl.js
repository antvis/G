import { Canvas } from '@antv/g-webgl';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

const ellipse = canvas.addShape('ellipse', {
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
const ellipseFolder = gui.addFolder('Transform');
const ellipseConfig = {
  translateX: 0,
  translateY: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
};
ellipseFolder.add(ellipseConfig, 'translateX', -200, 200).onChange((tx) => {
  // same as:
  // ellipse.attr('x');
  // ellipse.attr('y');
  const [x, y] = ellipse.getPosition();
  // same as:
  // * ellipse.move(300 + tx, y);
  // * ellipse.moveTo(300 + tx, y);
  ellipse.setPosition(300 + tx, y);
});
ellipseFolder.add(ellipseConfig, 'translateY', -200, 200).onChange((ty) => {
  const [x, y] = ellipse.getPosition();
  // same as:
  // * ellipse.move(x, 200 + ty);
  // * ellipse.moveTo(x, 200 + ty);
  ellipse.setPosition(x, 200 + ty);
});
ellipseFolder
  .add(ellipseConfig, 'rotation', -360, 360)
  .onChange((degrees) => {
    const radians = degrees * (Math.PI / 180);
    ellipse.rotateAtStart(radians);
  })
  .name('rotation in degrees');
ellipseFolder.add(ellipseConfig, 'scaleX', 0.2, 5).onChange((sx) => {
  ellipse.setLocalScale(sx, ellipseConfig.scaleY);
});
ellipseFolder.add(ellipseConfig, 'scaleY', 0.2, 5).onChange((sy) => {
  ellipse.setLocalScale(ellipseConfig.scaleX, sy);
});

ellipseFolder.open();
