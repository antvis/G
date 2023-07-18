import { Canvas, CanvasEvent, Text, runtime } from '@antv/g';
import { Renderer } from '@antv/g-webgl';
import Stats from 'stats.js';

runtime.enableCSSParsing = false;

const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer: new Renderer(),
});

const text1 = new Text({
  style: {
    x: 100,
    y: 100,
    fill: 'black',
    text: 'Text1',
  },
});

const text2 = new Text({
  style: {
    x: 200,
    y: 100,
    fill: 'black',
    text: 'Text2',
  },
});

const text3 = new Text({
  style: {
    x: 300,
    y: 100,
    fill: 'black',
    text: 'Text3',
  },
});

const text4 = new Text({
  style: {
    x: 200,
    y: 200,
    fill: 'black',
    text: 'Text3',
  },
});

const text5 = new Text({
  style: {
    x: 300,
    y: 200,
    fill: 'black',
    text: 'Text3',
  },
});

canvas.addEventListener(CanvasEvent.READY, () => {
  canvas.appendChild(text1);
  text1.animate(
    [
      {
        opacity: 0,
        transform: 'translate(0, 0)',
      },
      {
        opacity: 1,
        transform: 'translate(100, 0)',
      },
    ],
    {
      duration: 2000,
      fill: 'both',
      iterations: Infinity,
    },
  );

  canvas.appendChild(text2);
  text2.animate(
    [
      { opacity: 0, transform: 'translate(0, 0)' },
      { opacity: 1, transform: 'translate(100, 0)' },
    ],
    {
      duration: 2000,
      fill: 'both',
      iterations: Infinity,
    },
  );

  canvas.appendChild(text3);
  text3.animate(
    [
      { opacity: 0, transform: 'translate(0, 0)' },
      { opacity: 1, transform: 'translate(100, 0)' },
    ],
    {
      duration: 2000,
      fill: 'both',
      iterations: Infinity,
    },
  );

  canvas.appendChild(text4);
  text4.animate(
    [
      { opacity: 0, transform: 'translate(0, 0)' },
      { opacity: 1, transform: 'translate(100, 0)' },
    ],
    {
      duration: 2000,
      fill: 'both',
      iterations: Infinity,
    },
  );

  canvas.appendChild(text5);
  text5.animate(
    [
      { opacity: 0, transform: 'translate(0, 0)' },
      { opacity: 1, transform: 'translate(100, 0)' },
    ],
    {
      duration: 2000,
      fill: 'both',
      iterations: Infinity,
    },
  );

  text1.style.fontSize = 32;
  text2.style.fontSize = 32;
  text3.style.fontSize = 32;
  text4.style.fontSize = 32;
  text5.style.fontSize = 32;
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
