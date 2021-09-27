import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';

import { Group, Circle, Canvas, Text, Rect, ElementEvent, SHAPE } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';

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
  it('should createElement correctly', () => {
    const circle = canvas.document.createElement(SHAPE.Circle, {
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

    const ellipse = canvas.document.createElement(SHAPE.Ellipse, {
      style: {
        rx: 50,
        ry: 50,
      },
    });
    canvas.appendChild(ellipse);
    expect(ellipse.style.rx).to.be.eql(50);
    expect(ellipse.style.ry).to.be.eql(50);

    const rect = canvas.document.createElement(SHAPE.Rect, {
      style: {
        width: 50,
        height: 50,
      },
    });
    canvas.appendChild(rect);
    expect(rect.style.width).to.be.eql(50);
    expect(rect.style.height).to.be.eql(50);

    const image = canvas.document.createElement(SHAPE.Image, {
      style: {
        img: '',
        width: 50,
        height: 50,
      },
    });
    canvas.appendChild(image);
    expect(image.style.width).to.be.eql(50);
    expect(image.style.height).to.be.eql(50);
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
    canvas.removeChildren();

    const ellipse = canvas.document.createElement(SHAPE.Ellipse, {
      id: 'ellipse',
      name: 'ellipse-name',
      className: 'ellipse-classname',
      style: {
        rx: 50,
        ry: 50,
      },
    });
    canvas.appendChild(ellipse);

    expect(canvas.document.getElementById('ellipse')).eqls(ellipse);
    expect(canvas.document.getElementsByName('ellipse-name')[0]).eqls(ellipse);
    expect(canvas.document.getElementsByTagName(SHAPE.Ellipse)[0]).eqls(ellipse);
    expect(canvas.document.getElementsByClassName('ellipse-classname')[0]).eqls(ellipse);
    expect(canvas.document.querySelector('#ellipse')).eqls(ellipse);
    expect(canvas.document.querySelectorAll('#ellipse')[0]).eqls(ellipse);

    expect(canvas.document.find(({ id }) => id === 'ellipse')).eqls(ellipse);
    expect(canvas.document.findAll(({ id }) => id === 'ellipse')[0]).eqls(ellipse);
  });
});
