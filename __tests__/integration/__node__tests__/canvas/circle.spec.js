const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const { Circle, Canvas } = require('@antv/g');
const { Renderer } = require('@antv/g-canvas');
const { sleep, diff } = require('../../util');

// create a node-canvas
const nodeCanvas = createCanvas(200, 200);

// create a renderer, unregister plugin relative to DOM
const renderer = new Renderer();
const domInteractionPlugin = renderer.getPlugin('dom-interaction');
renderer.unregisterPlugin(domInteractionPlugin);

const SIZE = 200;
const canvas = new Canvas({
  width: SIZE,
  height: SIZE,
  canvas: nodeCanvas, // use node-canvas
  renderer,
});

const RESULT_IMAGE = '/circle.png';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render <Circle> with g-canvas', () => {
  afterEach(() => {
    canvas.removeChildren();
    fs.rmSync(__dirname + RESULT_IMAGE);
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render circle on server-side correctly.', async () => {
    const circle1 = new Circle({
      style: {
        cx: 10,
        cy: 10,
        r: 10,
        fill: 'red',
      },
    });
    await canvas.ready;
    canvas.appendChild(circle1);

    const circle2 = circle1.cloneNode();
    circle2.style.stroke = 'green';
    circle2.style.lineWidth = '2px';
    circle2.setPosition(30, 10);
    canvas.appendChild(circle2);

    // transparent
    const circle3 = circle2.cloneNode();
    circle3.style.fill = 'transparent';
    circle3.setPosition(50, 10);
    canvas.appendChild(circle3);

    // none fill
    const circle4 = circle2.cloneNode();
    circle4.style.fill = 'none';
    circle4.setPosition(70, 10);
    canvas.appendChild(circle4);

    // dashed
    const circle5 = circle2.cloneNode();
    circle5.style.lineDash = [2, 2];
    circle5.setPosition(90, 10);
    canvas.appendChild(circle5);

    // dashed with offset
    const circle6 = circle2.cloneNode();
    circle6.style.lineDash = [2, 2];
    circle6.style.lineDashOffset = 2;
    circle6.setPosition(110, 10);
    canvas.appendChild(circle6);

    const circle7 = circle1.cloneNode();
    circle7.style.opacity = 0.5;
    circle7.setPosition(130, 10);
    canvas.appendChild(circle7);

    // with shadow
    const circle8 = circle1.cloneNode();
    circle8.style.r = 20;
    circle8.style.shadowBlur = 10;
    circle8.style.shadowColor = 'blue';
    circle8.setPosition(20, 60);
    canvas.appendChild(circle8);

    // with gradient
    const circle9 = circle1.cloneNode();
    circle9.style.r = 20;
    circle9.style.fill = 'l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff';
    circle9.setPosition(60, 60);
    canvas.appendChild(circle9);
    const circle10 = circle1.cloneNode();
    circle10.style.r = 20;
    circle10.style.fill = 'r(0.5, 0.5, 1) 0:#ffffff 1:#1890ff';
    circle10.setPosition(100, 60);
    canvas.appendChild(circle10);

    // transform
    const circle11 = circle1.cloneNode();
    circle11.scaleLocal(2);
    circle11.setPosition(140, 60);
    canvas.appendChild(circle11);

    await sleep(200);

    await new Promise((resolve) => {
      const out = fs.createWriteStream(__dirname + RESULT_IMAGE);
      const stream = nodeCanvas.createPNGStream();
      stream.pipe(out);
      out.on('finish', () => {
        resolve(undefined);
      });
    });

    expect(
      diff(
        __dirname + RESULT_IMAGE,
        __dirname + BASELINE_IMAGE_DIR + RESULT_IMAGE,
      ),
    ).toBe(0);
  });
});
