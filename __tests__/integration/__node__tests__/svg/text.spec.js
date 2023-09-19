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

const { createCanvas } = require('canvas');
const fs = require('fs');
const { JSDOM } = require('jsdom');
const xmlserializer = require('xmlserializer');
const { Text, Canvas } = require('@antv/g');
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

const offscreenNodeCanvas = createCanvas(1, 1);

const canvas = new Canvas({
  container: 'container',
  width: SIZE,
  height: SIZE,
  renderer,
  document: dom.window.document,
  offscreenCanvas: offscreenNodeCanvas,
  requestAnimationFrame: dom.window.requestAnimationFrame,
  cancelAnimationFrame: dom.window.cancelAnimationFrame,
});

const RESULT_IMAGE = '/text.svg';
const BASELINE_IMAGE_DIR = '/snapshots';

describe('Render <Text> with g-svg', () => {
  afterEach(() => {
    canvas.removeChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should render text on server-side correctly.', async () => {
    await canvas.ready;
    const text1 = new Text({
      style: {
        x: 10,
        y: 10,
        text: 'test',
        fill: 'red',
      },
    });
    canvas.appendChild(text1);

    // CJK
    const text2 = text1.cloneNode();
    text2.style.fontSize = '16px';
    text2.style.text = '中文';
    text2.style.textAlign = 'center';
    text2.style.textBaseline = 'middle';
    text2.setPosition(100, 100);
    canvas.appendChild(text2);

    // word wrap
    const text3 = text1.cloneNode();
    text3.style.text = 'aaaaaaaaaaaaaaaaaaaaa';
    text3.style.wordWrap = true;
    text3.style.wordWrapWidth = 80;
    text3.setPosition(100, 80);
    canvas.appendChild(text3);

    // with stroke
    const text4 = text1.cloneNode();
    text4.style.stroke = 'white';
    text4.style.lineWidth = 2;
    text4.setPosition(10, 80);
    canvas.appendChild(text4);

    // text transform
    const text5 = text1.cloneNode();
    text5.style.textTransform = 'capitalize';
    text5.setPosition(10, 60);
    canvas.appendChild(text5);
    const text6 = text1.cloneNode();
    text6.style.textTransform = 'uppercase';
    text6.setPosition(10, 40);
    canvas.appendChild(text6);

    // letter spacing
    const text7 = text1.cloneNode();
    text7.style.letterSpacing = 2;
    text7.setPosition(10, 100);
    canvas.appendChild(text7);

    // dx/dy
    const text8 = text1.cloneNode();
    text8.style.dx = 20;
    text8.style.dy = 10;
    text8.setPosition(10, 120);
    canvas.appendChild(text8);

    // text overflow
    const text10 = text1.cloneNode();
    text10.style.text = 'aaaaaaaaaaaaaaaaaaaaa';
    text10.style.wordWrap = true;
    text10.style.wordWrapWidth = 80;
    text10.style.maxLines = 1;
    text10.style.textOverflow = 'ellipsis';
    text10.setPosition(100, 140);
    canvas.appendChild(text10);

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
