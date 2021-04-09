import { Canvas } from '@antv/g-canvas';
import { Circle } from '@antv/g-core';
import * as dat from 'dat.gui';
import Stats from 'stats.js';

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
});

const circle1 = new Circle({
  attrs: {
    x: 100,
    y: 100,
    r: 20,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

const circle2 = new Circle({
  attrs: {
    x: 100,
    y: 200,
    r: 50,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

const circle3 = new Circle({
  attrs: {
    x: 100,
    y: 300,
    r: 50,
    fill: '#1890FF',
    stroke: '#F04864',
    lineWidth: 4,
  },
});

canvas.appendChild(circle1);
canvas.appendChild(circle2);
canvas.appendChild(circle3);

circle1.animate(
  {
    r: 50,
  },
  {
    delay: 0,
    duration: 2000,
    easing: 'easeLinear',
    callback: () => {},
    repeat: true,
  }
);

circle2.animate(
  {
    fill: '#F04864',
  },
  {
    delay: 0,
    duration: 2000,
    easing: 'easeLinear',
    callback: () => {},
    repeat: true,
  }
);

circle3.animate(
  {
    x: 500,
  },
  {
    delay: 0,
    duration: 2000,
    easing: 'easeQuadInOut',
    callback: () => {},
    repeat: true,
  }
);

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
const animationFolder = gui.addFolder('animation');
const animationConfig = {
  pause: () => {
    circle1.pauseAnimation();
    circle2.pauseAnimation();
    circle3.pauseAnimation();
  },
  resume: () => {
    circle1.resumeAnimation();
    circle2.resumeAnimation();
    circle3.resumeAnimation();
  },
  stop: () => {
    circle1.stopAnimation(true);
    circle2.stopAnimation(true);
    circle3.stopAnimation(true);
  },
  start: () => {
    circle1.attr({
      x: 100,
      y: 100,
      r: 20,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    });
    circle1.animate(
      {
        r: 50,
      },
      {
        delay: 0,
        duration: 2000,
        easing: 'easeLinear',
        callback: () => {},
        repeat: true,
      }
    );

    circle2.attr({
      x: 100,
      y: 200,
      r: 50,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    });
    circle2.animate(
      {
        fill: '#F04864',
      },
      {
        delay: 0,
        duration: 2000,
        easing: 'easeLinear',
        callback: () => {},
        repeat: true,
      }
    );

    circle3.attr({
      x: 100,
      y: 300,
      r: 50,
      fill: '#1890FF',
      stroke: '#F04864',
      lineWidth: 4,
    });
    circle3.animate(
      {
        x: 500,
      },
      {
        delay: 0,
        duration: 2000,
        easing: 'easeQuadInOut',
        callback: () => {},
        repeat: true,
      }
    );
  },
};
animationFolder.add(animationConfig, 'pause').name('Pause');
animationFolder.add(animationConfig, 'resume').name('Resume');
animationFolder.add(animationConfig, 'stop').name('Stop');
animationFolder.add(animationConfig, 'start').name('Restart');
animationFolder.open();
