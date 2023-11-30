import { Canvas, Circle, FederatedWheelEvent } from '../../packages/g/src';
import { Renderer as CanvasRenderer } from '../../packages/g-svg/src';
import { Plugin } from '../../packages/g-plugin-css-select/src';
import { sleep } from './utils';

const $container = document.createElement('div');
$container.id = 'container';
document.body.prepend($container);
const renderer = new CanvasRenderer();
renderer.registerPlugin(new Plugin());

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
});

describe.skip('Event API', () => {
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

    const wheelCallback = jest.fn();
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
    expect(wheelCallback).toBeCalled();
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

    let cloned: FederatedWheelEvent = null as unknown as FederatedWheelEvent;
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

    expect(cloned.type).toBe('wheel');
    expect(cloned.button).toBe(0);
    expect(cloned.clientX).toBe(295);
    expect(cloned.clientY).toBe(201);
    expect(cloned.deltaX).toBe(10);
    expect(cloned.target).toBe(circle);
  });
});
