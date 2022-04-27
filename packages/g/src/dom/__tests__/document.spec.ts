import chai, { expect } from 'chai';
import chaiAlmost from 'chai-almost';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import {
  Circle,
  Canvas,
  Rect,
  Shape,
  Ellipse,
  EllipseStyleProps,
  RectStyleProps,
  Image,
  ImageStyleProps,
} from '../../../lib';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { sleep } from '../../__tests__/utils';

chai.use(chaiAlmost());
chai.use(sinonChai);

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
    canvas.removeChildren();
  });

  it('should createElement correctly', () => {
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
    canvas.appendChild(circle);
    expect(circle.style.r).to.be.eql(50);

    const ellipse = canvas.document.createElement<Ellipse, EllipseStyleProps>(Shape.ELLIPSE, {
      style: {
        rx: 50,
        ry: 50,
      },
    });
    canvas.appendChild(ellipse);
    expect(ellipse.style.rx).to.be.eql(50);
    expect(ellipse.style.ry).to.be.eql(50);

    const rect = canvas.document.createElement<Rect, RectStyleProps>(Shape.RECT, {
      style: {
        width: 50,
        height: 50,
      },
    });
    canvas.appendChild(rect);
    expect(rect.style.width).to.be.eql(50);
    expect(rect.style.height).to.be.eql(50);

    // const image = canvas.document.createElement<Image, ImageStyleProps>(Shape.IMAGE, {
    //   style: {
    //     img: '',
    //     width: 50,
    //     height: 50,
    //   },
    // });
    // canvas.appendChild(image);
    // expect(image.style.width).to.be.eql(50);
    // expect(image.style.height).to.be.eql(50);
  });

  it('should create documentElement correctly', () => {
    const element = canvas.document.documentElement;
    expect(canvas.document.children[0]).to.be.eql(element);
    expect(canvas.document.childElementCount).to.be.eql(1);
    expect(canvas.document.firstElementChild).to.be.eql(element);
    expect(canvas.document.lastElementChild).to.be.eql(element);
  });

  it('should throw errors when calling appendChild', () => {
    expect(canvas.document.cloneNode).to.throw('Method not implemented.');
    expect(canvas.document.appendChild).to.throw('Use document.documentElement instead.');
    expect(canvas.document.insertBefore).to.throw('Use document.documentElement instead.');
    expect(canvas.document.removeChild).to.throw('Use document.documentElement instead.');
    expect(canvas.document.replaceChild).to.throw('Use document.documentElement instead.');
    expect(canvas.document.append).to.throw('Use document.documentElement instead.');
    expect(canvas.document.prepend).to.throw('Use document.documentElement instead.');
  });

  it('should proxy query methods to documentElement', () => {
    const ellipse = canvas.document.createElement<Ellipse, EllipseStyleProps>(Shape.ELLIPSE, {
      id: 'ellipse',
      name: 'ellipse-name',
      className: 'ellipse-classname',
      style: {
        rx: 50,
        ry: 50,
      },
    });

    canvas.appendChild(ellipse);

    expect(canvas.document.getElementById('ellipse') as Ellipse).eqls(ellipse);
    expect(canvas.document.getElementsByName('ellipse-name')[0]).eqls(ellipse);
    expect(canvas.document.getElementsByTagName(Shape.ELLIPSE)[0]).eqls(ellipse);
    expect(canvas.document.getElementsByClassName('ellipse-classname')[0]).eqls(ellipse);
    expect(canvas.document.querySelector('[name=ellipse-name]')).eqls(ellipse);
    expect(canvas.document.querySelectorAll('[name=ellipse-name]')[0]).eqls(ellipse);
    expect(canvas.document.querySelector(Shape.ELLIPSE)).eqls(ellipse);
    expect(canvas.document.querySelectorAll(Shape.ELLIPSE)[0]).eqls(ellipse);
    expect(canvas.document.querySelector('#ellipse')).eqls(ellipse);
    expect(canvas.document.querySelectorAll('#ellipse')[0]).eqls(ellipse);
    expect(canvas.document.querySelector('.ellipse-classname')).eqls(ellipse);
    expect(canvas.document.querySelectorAll('.ellipse-classname')[0]).eqls(ellipse);

    expect(canvas.document.find(({ id }) => id === 'ellipse')).eqls(ellipse);
    expect(canvas.document.findAll(({ id }) => id === 'ellipse')[0]).eqls(ellipse);

    expect(canvas.document.find(({ id }) => id === 'non-existed')).eqls(null);
    expect(canvas.document.findAll(({ id }) => id === 'non-existed')).eqls([]);
  });

  it('should picking with element(s)FromPoint', async () => {
    let target = await canvas.document.elementFromPoint(0, 0);
    let targets = await canvas.document.elementsFromPoint(0, 0);
    expect(target).to.be.eqls(canvas.document.documentElement);
    expect(targets).to.be.eqls([canvas.document.documentElement]);

    // outside Canvas' viewport
    target = await canvas.document.elementFromPoint(-100, -100);
    targets = await canvas.document.elementsFromPoint(-100, -100);
    expect(target).to.be.null;
    expect(targets).to.be.eqls([]);
    target = await canvas.document.elementFromPoint(1000, 1000);
    targets = await canvas.document.elementsFromPoint(1000, 1000);
    expect(target).to.be.null;
    expect(targets).to.be.eqls([]);

    const circle = new Circle({
      style: {
        r: 100,
        x: 100,
        y: 100,
        fill: 'red',
      },
    });
    canvas.appendChild(circle);

    await sleep(100);

    // picking the center of circle
    target = await canvas.document.elementFromPoint(100, 100);
    targets = await canvas.document.elementsFromPoint(100, 100);
    expect(target).to.be.eqls(circle);
    expect(targets).to.be.eqls([circle, canvas.document.documentElement]);
    target = await canvas.document.elementFromPoint(0, 0);
    targets = await canvas.document.elementsFromPoint(0, 0);
    expect(target).to.be.eqls(canvas.document.documentElement);
    expect(targets).to.be.eqls([canvas.document.documentElement]);
  });

  it('should get element(s)FromPoint correctly, account for some style props such as `interactive`.', async () => {
    // 2 overlap circles
    const circle1 = new Circle({
      style: {
        r: 100,
        x: 100,
        y: 100,
        fill: 'red',
      },
    });
    canvas.appendChild(circle1);
    const circle2 = new Circle({
      style: {
        r: 100,
        x: 100,
        y: 100,
        fill: 'green',
      },
    });
    canvas.appendChild(circle2);

    let target = await canvas.document.elementFromPoint(100, 100);
    let targets = await canvas.document.elementsFromPoint(100, 100);
    expect(target).to.be.eqls(circle2);
    expect(targets).to.be.eqls([circle2, circle1, canvas.document.documentElement]);
    target = await canvas.document.elementFromPoint(0, 0);
    targets = await canvas.document.elementsFromPoint(0, 0);
    expect(target).to.be.eqls(canvas.document.documentElement);
    expect(targets).to.be.eqls([canvas.document.documentElement]);

    // change circle2's fill to 'none'
    circle2.style.fill = 'none';
    target = await canvas.document.elementFromPoint(100, 100);
    targets = await canvas.document.elementsFromPoint(100, 100);
    expect(target).to.be.eqls(circle1);
    expect(targets).to.be.eqls([circle1, canvas.document.documentElement]);

    // change circle2's fill to 'transparent'
    circle2.style.fill = 'transparent';
    target = await canvas.document.elementFromPoint(100, 100);
    targets = await canvas.document.elementsFromPoint(100, 100);
    expect(target).to.be.eqls(circle2);
    expect(targets).to.be.eqls([circle2, circle1, canvas.document.documentElement]);

    // make it non-interactive
    circle2.style.interactive = false;
    target = await canvas.document.elementFromPoint(100, 100);
    targets = await canvas.document.elementsFromPoint(100, 100);
    expect(target).to.be.eqls(circle1);
    expect(targets).to.be.eqls([circle1, canvas.document.documentElement]);
  });
});
