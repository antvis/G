import { Canvas, Circle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Plugin } from '@antv/g-plugin-css-select';
import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { sleep } from './utils';

chai.use(chaiAlmost());
chai.use(sinonChai);

const $container = document.createElement('div');
$container.id = 'container';
document.body.prepend($container);

// @ts-ignore
const renderer = new CanvasRenderer();
renderer.registerPlugin(new Plugin());

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
  supportsTouchEvents: true, // enable touch events
});

describe('Event API', () => {
  afterEach(() => {
    canvas.destroyChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should emit pointerdown correctly', async () => {
    const circle = new Circle({
      id: 'circle',
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
    circle.setPosition(300, 200);

    await canvas.ready;
    canvas.appendChild(circle);

    const pointerdownCallback = sinon.spy();
    circle.addEventListener('pointerdown', pointerdownCallback);

    const $canvas = canvas
      .getContextService()
      .getDomElement() as HTMLCanvasElement;

    const touch = new Touch({
      target: $canvas,
      clientX: 300,
      clientY: 200,
      force: 1,
      identifier: 0,
      pageX: 300,
      pageY: 200,
      radiusX: 27.777774810791016,
      radiusY: 27.777774810791016,
      rotationAngle: 0,
      screenX: 300,
      screenY: 200,
    });
    const touchEvent = new TouchEvent('touchstart', {
      cancelable: true,
      bubbles: true,
      touches: [touch],
      targetTouches: [touch],
      changedTouches: [touch],
    });

    await sleep(100);

    $canvas.dispatchEvent(touchEvent);

    // wait event propgation, especially for picking in an async way
    await sleep(100);

    // @ts-ignore
    expect(pointerdownCallback).to.have.been.called;
  });
});
