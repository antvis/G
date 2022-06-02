import { Canvas, CanvasEvent, Circle, Group } from '@antv/g';
import { Renderer } from '@antv/g-canvas';
import Stats from 'stats.js';

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: new Renderer(),
});

const group = new Group();
canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(group);
  for (let i = 0; i < 1000; i++) {
    const circle = new Circle({
      style: {
        cx: Math.random() * 600,
        cy: Math.random() * 500,
        r: 20 + Math.random() * 10,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 4,
        cursor: 'pointer',
      },
    });
    group.appendChild(circle);

    circle.on('mouseenter', () => {
      circle.attr('fill', '#2FC25B');
    });

    circle.on('mouseleave', () => {
      circle.attr('fill', '#1890FF');
    });
  }
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

let t = 0;
const spin = () => {
  console.log(canvas.getStats());
  if (stats) {
    stats.update();
  }
  group.translate(t < 20 ? 5 : -5);
  if (t > 40) {
    t = 0;
  }
  t++;
  window.requestAnimationFrame(spin);
};

spin();
