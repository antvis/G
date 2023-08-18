const util = require('util');
// ref: https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
// ref: https://github.com/jsdom/jsdom/issues/2524
Object.defineProperty(window, 'TextEncoder', {
  writable: true,
  value: util.TextEncoder,
});
Object.defineProperty(window, 'TextDecoder', {
  writable: true,
  value: util.TextDecoder,
});

const fs = require('fs');
const { JSDOM } = require('jsdom');
const xmlserializer = require('xmlserializer');
const { Circle, Canvas, Group, Rect } = require('@antv/g');
const { Renderer } = require('@antv/g-svg');
const { sleep } = require('../../util');

// create a renderer, unregister plugin relative to DOM
const renderer = new Renderer();
const domInteractionPlugin = renderer.getPlugin('dom-interaction');
renderer.unregisterPlugin(domInteractionPlugin);

const dom = new JSDOM(`
<div id="container">
</div>
`);

const SIZE = 200;
const canvas = new Canvas({
  container: 'container',
  width: SIZE,
  height: SIZE,
  renderer,
  document: dom.window.document,
  requestAnimationFrame: dom.window.requestAnimationFrame,
  cancelAnimationFrame: dom.window.cancelAnimationFrame,
});

const RESULT_IMAGE = '/clippath.svg';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render ClipPath with g-svg', () => {
  afterEach(() => {
    canvas.removeChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render clippath on server-side correctly.', async () => {
    const circle = new Circle({
      style: {
        cx: 50,
        cy: 50,
        r: 50,
        fill: 'red',
        clipPath: new Rect({
          // basic graphic as clippath
          style: {
            width: 50,
            height: 50,
          },
        }),
      },
    });

    // nested group
    const group = new Group({
      style: {
        x: 100,
        y: 0,
        clipPath: new Rect({
          // basic graphic as clippath
          style: {
            x: 100,
            y: 0,
            width: 50,
            height: 50,
          },
        }),
      },
    });
    const circle2 = new Circle({
      style: {
        cx: 50,
        cy: 50,
        r: 50,
        fill: 'blue',
      },
    });
    group.appendChild(circle2);

    // nested group
    const group2 = new Group({
      style: {
        x: 50,
        y: 100,
        clipPath: new Rect({
          // basic graphic as clippath
          style: {
            x: 50,
            y: 100,
            width: 50,
            height: 50,
          },
        }),
      },
    });
    const group3 = new Group();
    const circle3 = new Circle({
      style: {
        cx: 50,
        cy: 50,
        r: 50,
        fill: 'green',
      },
    });
    group2.appendChild(group3);
    group3.appendChild(circle3);

    // clip with connected shape
    const clipPathCircle = new Circle({
      style: {
        cx: 150,
        cy: 150,
        r: 50,
        fill: 'yellow',
      },
    });
    const rect = new Rect({
      style: {
        x: 150,
        y: 100,
        width: 50,
        height: 50,
        fill: 'cyan',
      },
    });
    rect.style.clipPath = clipPathCircle;

    await canvas.ready;
    canvas.appendChild(circle);
    canvas.appendChild(group);
    canvas.appendChild(group2);
    canvas.appendChild(clipPathCircle);
    canvas.appendChild(rect);

    await sleep(120);

    // fs.writeFileSync(
    //   __dirname + RESULT_IMAGE,
    //   xmlserializer.serializeToString(
    //     dom.window.document.getElementById('container').children[0],
    //   ),
    // );

    const snapshot = fs.readFileSync(
      __dirname + BASELINE_IMAGE_DIR + RESULT_IMAGE,
      {
        encoding: 'utf8',
        flag: 'r',
      },
    );

    expect(
      xmlserializer.serializeToString(
        dom.window.document.getElementById('container').children[0],
      ),
    ).toBe(snapshot);
  });
});
