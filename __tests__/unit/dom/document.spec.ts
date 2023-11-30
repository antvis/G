import { Renderer as CanvasRenderer } from '../../../packages/g-svg/src';
import {
  Canvas,
  Circle,
  Ellipse,
  EllipseStyleProps,
  Rect,
  RectStyleProps,
  Shape,
} from '../../../packages/g/src';
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

describe('Document', () => {
  afterAll(() => {
    canvas.destroy();
  });

  afterEach(() => {
    canvas.destroyChildren();
  });

  it('should createElement correctly', async () => {
    const circle = canvas.document.createElement(Shape.CIRCLE, {
      style: {
        fill: 'rgb(239, 244, 255)',
        fillOpacity: 1,
        lineWidth: 1,
        opacity: 1,
        r: 50,
        stroke: 'rgb(95, 149, 255)',
        strokeOpacity: 1,
        cursor: 'pointer',
      },
    });

    await canvas.ready;
    canvas.appendChild(circle);
    expect(circle.style.r).toBe(50);

    const ellipse = canvas.document.createElement<Ellipse, EllipseStyleProps>(
      Shape.ELLIPSE,
      {
        style: {
          rx: 50,
          ry: 50,
        },
      },
    );
    canvas.appendChild(ellipse);
    expect(ellipse.style.rx).toBe(50);
    expect(ellipse.style.ry).toBe(50);

    const rect = canvas.document.createElement<Rect, RectStyleProps>(
      Shape.RECT,
      {
        style: {
          width: 50,
          height: 50,
        },
      },
    );
    canvas.appendChild(rect);
    expect(rect.style.width).toBe(50);
    expect(rect.style.height).toBe(50);

    // const image = canvas.document.createElement<Image, ImageStyleProps>(Shape.IMAGE, {
    //   style: {
    //     img: '',
    //     width: 50,
    //     height: 50,
    //   },
    // });
    // canvas.appendChild(image);
    // expect(image.style.width).toBe(50);
    // expect(image.style.height).toBe(50);
  });

  it('should create documentElement correctly', () => {
    const element = canvas.document.documentElement;
    expect(canvas.document.children[0]).toBe(element);
    expect(canvas.document.childElementCount).toBe(1);
    expect(canvas.document.firstElementChild).toBe(element);
    expect(canvas.document.lastElementChild).toBe(element);
  });

  it('should throw errors when calling appendChild', () => {
    expect(canvas.document.cloneNode).toThrow('Method not implemented.');
    expect(canvas.document.appendChild).toThrow(
      'Use document.documentElement instead.',
    );
    expect(canvas.document.insertBefore).toThrow(
      'Use document.documentElement instead.',
    );
    expect(canvas.document.removeChild).toThrow(
      'Use document.documentElement instead.',
    );
    expect(canvas.document.replaceChild).toThrow(
      'Use document.documentElement instead.',
    );
    expect(canvas.document.append).toThrow(
      'Use document.documentElement instead.',
    );
    expect(canvas.document.prepend).toThrow(
      'Use document.documentElement instead.',
    );
  });

  it('should proxy query methods to documentElement', () => {
    const ellipse = canvas.document.createElement<Ellipse, EllipseStyleProps>(
      Shape.ELLIPSE,
      {
        id: 'ellipse',
        name: 'ellipse-name',
        className: 'ellipse-classname',
        style: {
          rx: 50,
          ry: 50,
        },
      },
    );

    canvas.appendChild(ellipse);

    expect(canvas.document.getElementById('ellipse') as Ellipse).toBe(ellipse);
    expect(canvas.document.getElementsByName('ellipse-name')[0]).toBe(ellipse);
    expect(canvas.document.getElementsByTagName(Shape.ELLIPSE)[0]).toBe(
      ellipse,
    );
    expect(canvas.document.getElementsByClassName('ellipse-classname')[0]).toBe(
      ellipse,
    );
    expect(canvas.document.querySelector('[name=ellipse-name]')).toBe(ellipse);
    expect(canvas.document.querySelectorAll('[name=ellipse-name]')[0]).toBe(
      ellipse,
    );
    expect(canvas.document.querySelector(Shape.ELLIPSE)).toBe(ellipse);
    expect(canvas.document.querySelectorAll(Shape.ELLIPSE)[0]).toBe(ellipse);
    expect(canvas.document.querySelector('#ellipse')).toBe(ellipse);
    expect(canvas.document.querySelectorAll('#ellipse')[0]).toBe(ellipse);
    expect(canvas.document.querySelector('.ellipse-classname')).toBe(ellipse);
    expect(canvas.document.querySelectorAll('.ellipse-classname')[0]).toBe(
      ellipse,
    );

    expect(canvas.document.find(({ id }) => id === 'ellipse')).toBe(ellipse);
    expect(canvas.document.findAll(({ id }) => id === 'ellipse')[0]).toBe(
      ellipse,
    );

    expect(canvas.document.find(({ id }) => id === 'non-existed')).toBe(null);
    expect(
      canvas.document.findAll(({ id }) => id === 'non-existed'),
    ).toStrictEqual([]);
  });

  it.skip('should picking with element(s)FromPoint', async () => {
    let target = await canvas.document.elementFromPoint(0, 0);
    let targets = await canvas.document.elementsFromPoint(0, 0);
    expect(target).toBe(canvas.document.documentElement);
    expect(targets).toStrictEqual([canvas.document.documentElement]);
    target = canvas.document.elementFromPointSync(0, 0);
    targets = canvas.document.elementsFromPointSync(0, 0);
    expect(target).toBe(canvas.document.documentElement);
    expect(targets).toStrictEqual([canvas.document.documentElement]);

    // outside Canvas' viewport
    target = await canvas.document.elementFromPoint(-100, -100);
    targets = await canvas.document.elementsFromPoint(-100, -100);
    expect(target).toBeNull();
    expect(targets).toStrictEqual([]);
    target = canvas.document.elementFromPointSync(-100, -100);
    targets = canvas.document.elementsFromPointSync(-100, -100);
    expect(target).toBeNull();
    expect(targets).toStrictEqual([]);
    target = await canvas.document.elementFromPoint(1000, 1000);
    targets = await canvas.document.elementsFromPoint(1000, 1000);
    expect(target).toBeNull();
    expect(targets).toStrictEqual([]);
    target = canvas.document.elementFromPointSync(1000, 1000);
    targets = canvas.document.elementsFromPointSync(1000, 1000);
    expect(target).toBeNull();
    expect(targets).toStrictEqual([]);

    const circle = new Circle({
      style: {
        r: 100,
        cx: 100,
        cy: 100,
        fill: 'red',
      },
    });
    canvas.appendChild(circle);

    await sleep(100);

    // picking the center of circle
    target = await canvas.document.elementFromPoint(100, 100);
    targets = await canvas.document.elementsFromPoint(100, 100);
    expect(target).toBe(circle);
    expect(targets).toStrictEqual([circle, canvas.document.documentElement]);
    target = canvas.document.elementFromPointSync(100, 100);
    targets = canvas.document.elementsFromPointSync(100, 100);
    expect(target).toBe(circle);
    expect(targets).toStrictEqual([circle, canvas.document.documentElement]);
    target = await canvas.document.elementFromPoint(0, 0);
    targets = await canvas.document.elementsFromPoint(0, 0);
    expect(target).toBe(canvas.document.documentElement);
    expect(targets).toStrictEqual([canvas.document.documentElement]);
    target = canvas.document.elementFromPointSync(0, 0);
    targets = canvas.document.elementsFromPointSync(0, 0);
    expect(target).toBe(canvas.document.documentElement);
    expect(targets).toStrictEqual([canvas.document.documentElement]);
  });

  it.skip('should get element(s)FromPoint correctly, account for some style props such as `interactive`.', async () => {
    // 2 overlap circles
    const circle1 = new Circle({
      style: {
        r: 100,
        cx: 100,
        cy: 100,
        fill: 'red',
      },
    });
    canvas.appendChild(circle1);
    const circle2 = new Circle({
      style: {
        r: 100,
        cx: 100,
        cy: 100,
        fill: 'green',
      },
    });
    canvas.appendChild(circle2);

    await sleep(100);

    let target = await canvas.document.elementFromPoint(100, 100);
    let targets = await canvas.document.elementsFromPoint(100, 100);
    expect(target).toBe(circle2);
    expect(targets).toStrictEqual([
      circle2,
      circle1,
      canvas.document.documentElement,
    ]);
    target = canvas.document.elementFromPointSync(100, 100);
    targets = canvas.document.elementsFromPointSync(100, 100);
    expect(target).toBe(circle2);
    expect(targets).toStrictEqual([
      circle2,
      circle1,
      canvas.document.documentElement,
    ]);
    target = await canvas.document.elementFromPoint(0, 0);
    targets = await canvas.document.elementsFromPoint(0, 0);
    expect(target).toBe(canvas.document.documentElement);
    expect(targets).toStrictEqual([canvas.document.documentElement]);
    target = canvas.document.elementFromPointSync(0, 0);
    targets = canvas.document.elementsFromPointSync(0, 0);
    expect(target).toBe(canvas.document.documentElement);
    expect(targets).toStrictEqual([canvas.document.documentElement]);

    // change circle2's fill to 'none'
    circle2.style.fill = 'none';
    target = await canvas.document.elementFromPoint(100, 100);
    targets = await canvas.document.elementsFromPoint(100, 100);
    expect(target).toBe(circle1);
    expect(targets).toStrictEqual([circle1, canvas.document.documentElement]);
    target = canvas.document.elementFromPointSync(100, 100);
    targets = canvas.document.elementsFromPointSync(100, 100);
    expect(target).toBe(circle1);
    expect(targets).toStrictEqual([circle1, canvas.document.documentElement]);

    // change circle2's fill to 'transparent'
    circle2.style.fill = 'transparent';
    target = await canvas.document.elementFromPoint(100, 100);
    targets = await canvas.document.elementsFromPoint(100, 100);
    expect(target).toBe(circle2);
    expect(targets).toStrictEqual([
      circle2,
      circle1,
      canvas.document.documentElement,
    ]);
    target = canvas.document.elementFromPointSync(100, 100);
    targets = canvas.document.elementsFromPointSync(100, 100);
    expect(target).toBe(circle2);
    expect(targets).toStrictEqual([
      circle2,
      circle1,
      canvas.document.documentElement,
    ]);

    // make it non-interactive
    circle2.style.pointerEvents = 'none';

    target = await canvas.document.elementFromPoint(100, 100);
    targets = await canvas.document.elementsFromPoint(100, 100);
    expect(target).toBe(circle1);
    expect(targets).toStrictEqual([circle1, canvas.document.documentElement]);
    target = canvas.document.elementFromPointSync(100, 100);
    targets = canvas.document.elementsFromPointSync(100, 100);
    expect(target).toBe(circle1);
    expect(targets).toStrictEqual([circle1, canvas.document.documentElement]);
  });

  it.skip('should execute region query with elementsFromBBox', async () => {
    let targets = canvas.document.elementsFromBBox(0, 0, 1, 1);
    expect(targets).toStrictEqual([canvas.document.documentElement]);

    // outside Canvas' viewport
    targets = canvas.document.elementsFromBBox(-100, -100, -50, -50);
    expect(targets).toStrictEqual([]);

    const circle = new Circle({
      style: {
        r: 100,
        cx: 100,
        cy: 100,
        fill: 'red',
      },
    });
    canvas.appendChild(circle);

    await sleep(100);

    targets = canvas.document.elementsFromBBox(100, 100, 150, 150);
    expect(targets).toStrictEqual([circle, canvas.document.documentElement]);

    targets = canvas.document.elementsFromBBox(-100, -100, -50, -50);
    expect(targets).toStrictEqual([]);
  });
});
