import { Renderer as CanvasRenderer } from '../../../packages/g-svg/src';
import { Canvas, HTML } from '../../../packages/g/src';
import { sleep } from '../utils';

const $container = document.createElement('div');
$container.id = 'container';
document.body.prepend($container);

const renderer = new CanvasRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
});

describe.skip('HTML', () => {
  afterEach(() => {
    canvas.destroyChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should create HTML correctly.', async () => {
    const html = new HTML({
      id: 'id',
      name: 'name',
      className: 'classname',
      style: {
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        innerHTML: '<h1>This is Title</h1>',
      },
    });

    await canvas.ready;
    canvas.appendChild(html);

    expect(html.getAttribute('x')).toBe(100);
    expect(html.getAttribute('y')).toBe(100);
    expect(html.getAttribute('width')).toBe(100);
    expect(html.getAttribute('height')).toBe(100);

    const $el = html.getDomElement();
    expect($el.id).toBe('id');
    expect($el.getAttribute('name')).toBe('name');
    expect($el.className).toBe('classname');
    expect($el.style.position).toBe('absolute');
    expect($el.style.top).toBe('0px');
    expect($el.style.left).toBe('0px');
    expect($el.style.width).toBe('100px');
    expect($el.style.height).toBe('100px');
    expect($el.style.willChange).toBe('transform');
    expect($el.style.opacity).toBe('1');
    expect($el.style.visibility).toBe('visible');
    expect($el.style.pointerEvents).toBe('auto');
    expect($el.style.fontFamily).toBe('sans-serif');
    expect($el.style.fontSize).toBe('16px');
    expect($el.style.transform).toBe('matrix(1, 0, 0, 1, 100, 100)');
    expect($el.style.transformOrigin).toBe('0px 0px');
    expect($el.style.background).toBe('transparent');

    html.translateLocal(100, 100);

    await sleep(500);
    expect($el.style.transform).toBe('matrix(1, 0, 0, 1, 200, 200)');

    html.scaleLocal(0.5);

    await sleep(500);
    expect($el.style.transform).toBe('matrix(0.5, 0, 0, 0.5, 200, 200)');

    html.style.fill = 'white';
    expect($el.style.background).toBe('white');

    html.style.stroke = 'red';
    html.style.lineWidth = 10;
    expect($el.style.borderColor).toBe('red');
    expect($el.style.borderStyle).toBe('solid');
    expect($el.style.borderWidth).toBe('10px');

    html.style.lineDash = [2];
    expect($el.style.borderStyle).toBe('dashed');

    html.style.zIndex = 10;
    expect($el.style.zIndex).toBe('10');

    expect(html.getBoundingClientRect().x).toBe(208);
    expect(html.getBoundingClientRect().y).toBe(208);

    expect(html.getClientRects()[0].x).toBe(208);
    expect(html.getClientRects()[0].y).toBe(208);

    expect(html.getBounds().halfExtents[0]).toBe(30);
    expect(html.getBounds().halfExtents[1]).toBe(30);
    expect(html.getBounds().center[0]).toBe(230);
    expect(html.getBounds().center[1]).toBe(230);

    expect(html.getLocalBounds().halfExtents[0]).toBe(30);
    expect(html.getLocalBounds().halfExtents[1]).toBe(30);
    expect(html.getLocalBounds().center[0]).toBe(230);
    expect(html.getLocalBounds().center[1]).toBe(230);
  });

  it('should return unprecise bounding box before appending to document.', () => {
    const html = new HTML({
      id: 'id',
      name: 'name',
      className: 'classname',
      style: {
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        innerHTML: '<h1>This is Title</h1>',
      },
    });

    // DOM element hasn't been created yet.
    const $el = html.getDomElement();
    expect($el).toBe(undefined);

    // Use x/y/width/height defined by user.
    const bounds = html.getBounds();
    expect(bounds.halfExtents[0]).toBe(50);
    expect(bounds.halfExtents[1]).toBe(50);
    expect(bounds.center[0]).toBe(150);
    expect(bounds.center[1]).toBe(150);
  });

  it("should override container's style correctly.", async () => {
    const html = new HTML({
      id: 'id',
      name: 'name',
      className: 'classname',
      style: {
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        innerHTML: '<h1>This is Title</h1>',
        // @ts-ignore
        fontSize: '12px',
        textAlign: 'center',
        color: 'red',
      },
    });

    await canvas.ready;
    canvas.appendChild(html);

    expect(html.getAttribute('x')).toBe(100);
    expect(html.getAttribute('y')).toBe(100);
    expect(html.getAttribute('width')).toBe(100);
    expect(html.getAttribute('height')).toBe(100);

    const $el = html.getDomElement();
    expect($el.id).toBe('id');
    expect($el.getAttribute('name')).toBe('name');
    expect($el.className).toBe('classname');
    expect($el.style.position).toBe('absolute');
    expect($el.style.top).toBe('0px');

    // fontSize should be overrided.
    expect($el.style.fontSize).toBe('12px');
    expect($el.style.textAlign).toBe('center');
    expect($el.style.color).toBe('red');

    // update overrided CSS properties.
    // @ts-ignore
    html.style.fontSize = '16px';
    // @ts-ignore
    html.style.color = 'blue';
    expect($el.style.fontSize).toBe('16px');
    expect($el.style.color).toBe('blue');
  });

  it('should allow different HTMLs sharing the same Id.', async () => {
    const html1 = new HTML({
      id: 'id',
      style: {
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        innerHTML: '<h1>This is Title</h1>',
      },
    });
    const html2 = new HTML({
      id: 'id',
      style: {
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        innerHTML: '<h1>This is Title</h1>',
      },
    });

    await canvas.ready;
    canvas.appendChild(html1);
    canvas.appendChild(html2);

    const $el1 = html1.getDomElement();
    const $el2 = html2.getDomElement();
    expect($el1.id).toBe('id');
    expect($el2.id).toBe('id');
  });
});
