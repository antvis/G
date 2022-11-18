const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const { Ellipse, Canvas } = require('@antv/g');
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

const RESULT_IMAGE = '/ellipse.png';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render <Ellipse> with g-canvas', () => {
  afterEach(() => {
    canvas.removeChildren();
    fs.rmSync(__dirname + RESULT_IMAGE);
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render ellipse on server-side correctly.', async () => {
    await canvas.ready;
    const ellipse1 = new Ellipse({
      style: {
        cx: 20,
        cy: 20,
        rx: 10,
        ry: 20,
        fill: 'red',
      },
    });
    canvas.appendChild(ellipse1);

    const ellipse2 = ellipse1.cloneNode();
    ellipse2.style.stroke = 'green';
    ellipse2.style.lineWidth = '2px';
    ellipse2.setPosition(40, 20);
    canvas.appendChild(ellipse2);

    // transparent
    const ellipse3 = ellipse2.cloneNode();
    ellipse3.style.fill = 'transparent';
    ellipse3.setPosition(60, 20);
    canvas.appendChild(ellipse3);

    // none fill
    const ellipse4 = ellipse2.cloneNode();
    ellipse4.style.fill = 'none';
    ellipse4.setPosition(80, 20);
    canvas.appendChild(ellipse4);

    // dashed
    const ellipse5 = ellipse2.cloneNode();
    ellipse5.style.lineDash = [2, 2];
    ellipse5.setPosition(100, 20);
    canvas.appendChild(ellipse5);

    // dashed with offset
    const ellipse6 = ellipse2.cloneNode();
    ellipse6.style.lineDash = [2, 2];
    ellipse6.style.lineDashOffset = 2;
    ellipse6.setPosition(120, 20);
    canvas.appendChild(ellipse6);

    const ellipse7 = ellipse1.cloneNode();
    ellipse7.style.opacity = 0.5;
    ellipse7.setPosition(140, 20);
    canvas.appendChild(ellipse7);

    // with shadow
    const ellipse8 = ellipse1.cloneNode();
    ellipse8.style.r = 20;
    ellipse8.style.shadowBlur = 10;
    ellipse8.style.shadowColor = 'blue';
    ellipse8.setPosition(20, 60);
    canvas.appendChild(ellipse8);

    // with gradient
    const ellipse9 = ellipse1.cloneNode();
    ellipse9.style.fill = 'l(0) 0:#ffffff 0.5:#7ec2f3 1:#1890ff';
    ellipse9.setPosition(60, 60);
    canvas.appendChild(ellipse9);

    const ellipse10 = ellipse1.cloneNode();
    ellipse10.style.fill = 'r(0.5, 0.5, 1) 0:#ffffff 1:#1890ff';
    ellipse10.setPosition(100, 60);
    canvas.appendChild(ellipse10);

    // transform
    const ellipse11 = ellipse1.cloneNode();
    ellipse11.scaleLocal(2);
    ellipse11.setPosition(140, 100);
    canvas.appendChild(ellipse11);

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
