import { Canvas, Circle, FederatedWheelEvent } from '@antv/g';
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
});

describe('Event API', () => {
  afterEach(() => {
    canvas.destroyChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should trigger wheel event correctly', async () => {
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

    const wheelCallback = sinon.spy();
    circle.addEventListener('wheel', wheelCallback);

    const $canvas = canvas
      .getContextService()
      .getDomElement() as HTMLCanvasElement;

    await sleep(100);

    $canvas.dispatchEvent(
      new WheelEvent('wheel', {
        altKey: false,
        bubbles: true,
        button: 0,
        buttons: 1,
        cancelable: true,
        clientX: 295.3359375,
        clientY: 201.03515625,
        composed: true,
        ctrlKey: false,
        detail: 0,
        metaKey: false,
        movementX: 0,
        movementY: 0,
        relatedTarget: null,
        screenX: 295.3359375,
        screenY: 254.03515625,
        shiftKey: false,
        view: window,
        which: 1,
        deltaX: 10,
      }),
    );

    // wait event propgation, especially for picking in an async way
    await sleep(100);

    // @ts-ignore
    expect(wheelCallback).to.have.been.called;
  });

  it('should clone wheel event correctly', async () => {
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

    await sleep(200);

    let cloned: FederatedWheelEvent;
    circle.addEventListener('wheel', (event: FederatedWheelEvent) => {
      cloned = event.clone();
    });

    const $canvas = canvas
      .getContextService()
      .getDomElement() as HTMLCanvasElement;

    // trigger native pointerdown event
    $canvas.dispatchEvent(
      new WheelEvent('wheel', {
        altKey: false,
        bubbles: true,
        button: 0,
        buttons: 1,
        cancelable: true,
        clientX: 295.3359375,
        clientY: 201.03515625,
        composed: true,
        ctrlKey: false,
        detail: 0,
        metaKey: false,
        movementX: 0,
        movementY: 0,
        relatedTarget: null,
        screenX: 295.3359375,
        screenY: 254.03515625,
        shiftKey: false,
        view: window,
        which: 1,
        deltaX: 10,
      }),
    );

    await sleep(1000);

    expect(cloned.type).to.be.eqls('wheel');
    expect(cloned.button).to.be.eqls(0);
    expect(cloned.clientX).to.be.eqls(295);
    expect(cloned.clientY).to.be.eqls(201);
    expect(cloned.deltaX).to.be.eqls(10);
    expect(cloned.target).to.be.eqls(circle);
  });
});
