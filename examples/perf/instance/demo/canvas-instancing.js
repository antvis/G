import { Circle } from '@antv/g-core';
import { Canvas } from '@antv/g-canvas';
import Stats from 'stats.js';

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

const circle = new Circle({
  attrs: {
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

for (let i = 0; i < 1000; i++) {
  // add a circle to canvas
  const instance = circle.createInstance({
    attrs: {
      x: Math.random() * 600,
      y: Math.random() * 500,
      r: 10 + Math.random() * 5,
    },
  });

  canvas.appendChild(instance);

  instance.animate(
    {
      x: Math.random() * 600,
      y: Math.random() * 500,
    },
    {
      delay: 0,
      duration: 1000,
      easing: 'easeLinear',
      callback: () => {},
      repeat: true,
      direction: 'alternate',
    }
  );
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
canvas.onFrame(() => {
  if (stats) {
    stats.update();
  }
});
