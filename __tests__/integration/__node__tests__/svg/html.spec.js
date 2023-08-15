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
const { HTML, Canvas } = require('@antv/g');
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

const RESULT_IMAGE = '/html.svg';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render <HTML> with g-svg', () => {
  afterEach(() => {
    canvas.removeChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render HTML on server-side correctly.', async () => {
    await canvas.ready;
    const html = new HTML({
      id: 'p1',
      name: 'p2-name',
      className: 'p2-classname',
      style: {
        x: 50,
        y: 50,
        width: 60,
        height: 30,
        innerHTML: 'p2',
      },
    });
    canvas.appendChild(html);

    const html2 = new HTML({
      id: 'p1',
      name: 'p2-name',
      className: 'p2-classname',
      style: {
        x: 50,
        y: 150,
        width: 60,
        height: 30,
        innerHTML: '<div>p2</div>',
        fontSize: '20px',
        textAlign: 'center',
        color: 'red',
      },
    });
    canvas.appendChild(html2);

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
