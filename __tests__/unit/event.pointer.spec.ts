import { Renderer as CanvasRenderer } from '../../packages/g-svg/src';
import { Plugin } from '../../packages/g-plugin-css-select/src';
import {
  Canvas,
  Circle,
  CustomEvent,
  ElementEvent,
  FederatedEvent,
  FederatedPointerEvent,
  Group,
} from '../../packages/g/src';
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

const CAPTURING_PHASE = 1;
const AT_TARGET = 2;
const BUBBLING_PHASE = 3;

describe.skip('Event API', () => {
  afterEach(() => {
    canvas.destroyChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });
  it('should trigger pointerdown/mousedown/touchstart/rightdown correctly', async () => {
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

    // wait next frame
    await sleep(200);

    const pointerdownCallback = jest.fn();
    const mousedownCallback = jest.fn();
    const rightdownCallback = jest.fn();
    const touchstartCallback = jest.fn();
    circle.addEventListener('pointerdown', pointerdownCallback);
    circle.addEventListener('mousedown', mousedownCallback);
    circle.addEventListener('touchstart', touchstartCallback);
    circle.addEventListener('rightdown', rightdownCallback);

    const $canvas = canvas
      .getContextService()
      .getDomElement() as HTMLCanvasElement;

    // trigger native pointerdown event
    $canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
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
        height: 1,
        isPrimary: true,
        metaKey: false,
        movementX: 0,
        movementY: 0,
        pointerId: 1,
        pointerType: 'mouse',
        pressure: 0.5,
        relatedTarget: null,
        screenX: 295.3359375,
        screenY: 254.03515625,
        shiftKey: false,
        tangentialPressure: 0,
        tiltX: 0,
        tiltY: 0,
        twist: 0,
        view: window,
        which: 1,
        width: 1,
      }),
    );

    // trigger native touch event
    $canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
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
        height: 1,
        isPrimary: true,
        metaKey: false,
        movementX: 0,
        movementY: 0,
        pointerId: 1,
        pointerType: 'touch',
        pressure: 0.5,
        relatedTarget: null,
        screenX: 295.3359375,
        screenY: 254.03515625,
        shiftKey: false,
        tangentialPressure: 0,
        tiltX: 0,
        tiltY: 0,
        twist: 0,
        view: window,
        which: 1,
        width: 1,
      }),
    );

    // trigger right pointerdown
    $canvas.dispatchEvent(
      new PointerEvent('pointerdown', {
        altKey: false,
        bubbles: true,
        button: 2,
        buttons: 1,
        cancelable: true,
        clientX: 295.3359375,
        clientY: 201.03515625,
        composed: true,
        ctrlKey: false,
        detail: 0,
        height: 1,
        isPrimary: true,
        metaKey: false,
        movementX: 0,
        movementY: 0,
        pointerId: 1,
        pointerType: 'mouse',
        pressure: 0.5,
        relatedTarget: null,
        screenX: 295.3359375,
        screenY: 254.03515625,
        shiftKey: false,
        tangentialPressure: 0,
        tiltX: 0,
        tiltY: 0,
        twist: 0,
        view: window,
        which: 1,
        width: 1,
      }),
    );

    await sleep(200);

    expect(pointerdownCallback).toBeCalled();
    expect(mousedownCallback).toBeCalled();
    expect(rightdownCallback).toBeCalled();
    expect(touchstartCallback).toBeCalled();
  });

  it('should trigger pointerup/mouseup/touchend/rightup correctly', async () => {
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

    const pointerupCallback = jest.fn();
    const mouseupCallback = jest.fn();
    const rightupCallback = jest.fn();
    const touchendCallback = jest.fn();
    circle.addEventListener('pointerup', pointerupCallback);
    circle.addEventListener('mouseup', mouseupCallback);
    circle.addEventListener('rightup', rightupCallback);
    circle.addEventListener('touchend', touchendCallback);

    const $canvas = canvas
      .getContextService()
      .getDomElement() as HTMLCanvasElement;

    // trigger native pointerdown event
    $canvas.dispatchEvent(
      new PointerEvent('pointerup', {
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
        height: 1,
        isPrimary: true,
        metaKey: false,
        movementX: 0,
        movementY: 0,
        pointerId: 1,
        pointerType: 'mouse',
        pressure: 0.5,
        relatedTarget: null,
        screenX: 295.3359375,
        screenY: 254.03515625,
        shiftKey: false,
        tangentialPressure: 0,
        tiltX: 0,
        tiltY: 0,
        twist: 0,
        view: window,
        which: 1,
        width: 1,
      }),
    );

    // trigger native touch event
    $canvas.dispatchEvent(
      new PointerEvent('pointerup', {
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
        height: 1,
        isPrimary: true,
        metaKey: false,
        movementX: 0,
        movementY: 0,
        pointerId: 1,
        pointerType: 'touch',
        pressure: 0.5,
        relatedTarget: null,
        screenX: 295.3359375,
        screenY: 254.03515625,
        shiftKey: false,
        tangentialPressure: 0,
        tiltX: 0,
        tiltY: 0,
        twist: 0,
        view: window,
        which: 1,
        width: 1,
      }),
    );

    // trigger right pointerup
    $canvas.dispatchEvent(
      new PointerEvent('pointerup', {
        altKey: false,
        bubbles: true,
        button: 2,
        buttons: 1,
        cancelable: true,
        clientX: 295.3359375,
        clientY: 201.03515625,
        composed: true,
        ctrlKey: false,
        detail: 0,
        height: 1,
        isPrimary: true,
        metaKey: false,
        movementX: 0,
        movementY: 0,
        pointerId: 1,
        pointerType: 'mouse',
        pressure: 0.5,
        relatedTarget: null,
        screenX: 295.3359375,
        screenY: 254.03515625,
        shiftKey: false,
        tangentialPressure: 0,
        tiltX: 0,
        tiltY: 0,
        twist: 0,
        view: window,
        which: 1,
        width: 1,
      }),
    );

    await sleep(200);

    expect(pointerupCallback).toBeCalled();
    expect(mouseupCallback).toBeCalled();
    expect(rightupCallback).toBeCalled();
    expect(touchendCallback).toBeCalled();
  });

  it('should use event delegation correctly.', async () => {
    const parent = new Group({ id: 'parent' });
    parent.isMutationObserved = true;
    const child = new Group({ id: 'child' });
    child.isMutationObserved = true;

    const eventStack: any[] = [];
    parent.addEventListener(ElementEvent.MOUNTED, (e: FederatedEvent) => {
      eventStack.push([e.target, e.eventPhase]);
    });

    parent.appendChild(child);

    await canvas.ready;
    canvas.appendChild(parent);

    expect(eventStack.length).toBe(2);
    expect(eventStack[0]).toStrictEqual([parent, AT_TARGET]);
    expect(eventStack[1]).toStrictEqual([child, BUBBLING_PHASE]);
  });

  it('should use event delegation with capture correctly.', async () => {
    const parent = new Group({ id: 'parent' });
    parent.isMutationObserved = true;
    const child = new Group({ id: 'child' });
    child.isMutationObserved = true;

    const eventStack: any[] = [];
    parent.addEventListener(
      ElementEvent.MOUNTED,
      (e: FederatedEvent) => {
        eventStack.push([e.target, e.eventPhase]);
      },
      { capture: true },
    );

    parent.appendChild(child);

    await canvas.ready;
    canvas.appendChild(parent);

    expect(eventStack.length).toBe(2);
    expect(eventStack[0]).toStrictEqual([parent, AT_TARGET]);
    expect(eventStack[1]).toStrictEqual([child, CAPTURING_PHASE]);
  });

  it('should keep order in event phases', async () => {
    // @see https://javascript.info/bubbling-and-capturing#capturing
    const form = new Group({ id: 'form' });
    const div = new Group({ id: 'div' });
    const p = new Group({ id: 'p' });

    form.appendChild(div);
    div.appendChild(p);

    await canvas.ready;
    canvas.appendChild(form);

    const event = new CustomEvent('build', { detail: { prop1: 'xx' } });
    const eventStack: any[] = [];
    [form, div, p].forEach((el) => {
      el.addEventListener(
        'build',
        (e: FederatedEvent) => {
          eventStack.push([e.currentTarget, CAPTURING_PHASE]);
        },
        { capture: true },
      );
      el.addEventListener('build', (e: FederatedEvent) => {
        eventStack.push([e.currentTarget, BUBBLING_PHASE]);
      });
    });

    p.dispatchEvent(event);

    expect(eventStack.length).toBe(6);
    expect(eventStack[0]).toStrictEqual([form, CAPTURING_PHASE]);
    expect(eventStack[1]).toStrictEqual([div, CAPTURING_PHASE]);
    expect(eventStack[2]).toStrictEqual([p, CAPTURING_PHASE]);
    expect(eventStack[3]).toStrictEqual([p, BUBBLING_PHASE]);
    expect(eventStack[4]).toStrictEqual([div, BUBBLING_PHASE]);
    expect(eventStack[5]).toStrictEqual([form, BUBBLING_PHASE]);
  });

  it('should clone pointer event correctly', async () => {
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

    let cloned: FederatedPointerEvent =
      null as unknown as FederatedPointerEvent;
    circle.addEventListener('pointerup', (event: FederatedPointerEvent) => {
      cloned = event.clone();
    });

    const $canvas = canvas
      .getContextService()
      .getDomElement() as HTMLCanvasElement;

    // trigger native pointerdown event
    $canvas.dispatchEvent(
      new PointerEvent('pointerup', {
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
        height: 1,
        isPrimary: true,
        metaKey: false,
        movementX: 0,
        movementY: 0,
        pointerId: 1,
        pointerType: 'mouse',
        pressure: 0.5,
        relatedTarget: null,
        screenX: 295.3359375,
        screenY: 254.03515625,
        shiftKey: false,
        tangentialPressure: 0,
        tiltX: 0,
        tiltY: 0,
        twist: 0,
        view: window,
        which: 1,
        width: 1,
      }),
    );

    await sleep(1000);

    expect(cloned.type).toBe('pointerup');
    expect(cloned.pointerType).toBe('mouse');
    expect(cloned.pointerId).toBe(1);
    expect(cloned.button).toBe(0);
    expect(cloned.clientX).toBe(295.3359375);
    expect(cloned.clientY).toBe(201.03515625);
    expect(cloned.target).toBe(circle);
  });
});
