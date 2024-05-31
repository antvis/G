import { Canvas, Circle, Group, Path, Text } from '@antv/g';
import { Renderer } from '@antv/g-canvas';
import Stats from 'stats.js';

// stats
const stats = new Stats();
stats.showPanel(0);
const $stats = stats.dom;
$stats.style.position = 'absolute';
$stats.style.left = '0px';
$stats.style.top = '0px';
const $wrapper = document.getElementById('container');
$wrapper.appendChild($stats);

// create a renderer
const canvasRenderer = new Renderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: canvasRenderer,
});

const groups = Array(1000)
  .fill(1)
  .map(() => {
    const text = new Text({
      style: {
        x: 100,
        y: 100,
        fontFamily: 'PingFang SC',
        text: '这是测试文本This is text',
        fontSize: 15,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 5,
      },
    });
    const circle = new Circle({
      style: {
        r: 20,
        fill: '#000',
      },
    });
    const path = new Path({
      style: {
        d: [
          ['M', 0, 0],
          ['L', 100, 100],
        ],
        lineWidth: 2,
        stroke: 'black',
      },
    });
    const gg = new Group({
      style: {
        x: 100,
        y: 100,
      },
    });
    gg.appendChild(text);
    gg.appendChild(circle);
    gg.appendChild(path);
    canvas.appendChild(gg);
    return gg;
  });

const loop = () => {
  if (stats) {
    stats.update();
  }

  groups.forEach((group) =>
    // ~30FPS
    // group.attr({
    //   x: Math.random() * 600,
    //   y: Math.random() * 500,
    // }),
    // ~60FPS
    group.setLocalPosition(Math.random() * 600, Math.random() * 500),
  );
  setTimeout(loop);
};
loop();
