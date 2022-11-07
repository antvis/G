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
  supportsPointerEvents: false, // disable pointer event
});

describe('Event API', () => {
  afterEach(() => {
    canvas.destroyChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should emit mouseup event correctly', async () => {
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

    await sleep(100);

    const mouseupCallback = sinon.spy();
    circle.addEventListener('mouseup', mouseupCallback);

    const $canvas = canvas.getContextService().getDomElement() as HTMLCanvasElement;

    $canvas.dispatchEvent(
      new MouseEvent('mouseup', {
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
      }),
    );

    // wait event propgation, especially for picking in an async way
    await sleep(100);

    // @ts-ignore
    expect(mouseupCallback).to.have.been.called;
  });
});
