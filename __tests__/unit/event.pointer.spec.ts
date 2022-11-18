import {
  Canvas,
  Circle,
  CustomEvent,
  ElementEvent,
  FederatedEvent,
  FederatedPointerEvent,
  Group,
} from '@antv/g';
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

const CAPTURING_PHASE = 1;
const AT_TARGET = 2;
const BUBBLING_PHASE = 3;

describe('Event API', () => {
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

    const pointerdownCallback = sinon.spy();
    const mousedownCallback = sinon.spy();
    const rightdownCallback = sinon.spy();
    const touchstartCallback = sinon.spy();
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

    // @ts-ignore
    expect(pointerdownCallback).to.have.been.called;
    // @ts-ignore
    expect(mousedownCallback).to.have.been.called;
    // @ts-ignore
    expect(rightdownCallback).to.have.been.called;
    // @ts-ignore
    expect(touchstartCallback).to.have.been.called;
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

    const pointerupCallback = sinon.spy();
    const mouseupCallback = sinon.spy();
    const rightupCallback = sinon.spy();
    const touchendCallback = sinon.spy();
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

    // @ts-ignore
    expect(pointerupCallback).to.have.been.called;
    // @ts-ignore
    expect(mouseupCallback).to.have.been.called;
    // @ts-ignore
    expect(rightupCallback).to.have.been.called;
    // @ts-ignore
    expect(touchendCallback).to.have.been.called;
  });

  it('should use event delegation correctly.', async () => {
    const parent = new Group({ id: 'parent' });
    parent.isMutationObserved = true;
    const child = new Group({ id: 'child' });
    child.isMutationObserved = true;

    const eventStack = [];
    parent.addEventListener(ElementEvent.MOUNTED, (e: FederatedEvent) => {
      eventStack.push([e.target, e.eventPhase]);
    });

    parent.appendChild(child);

    await canvas.ready;
    canvas.appendChild(parent);

    expect(eventStack.length).to.be.eqls(2);
    expect(eventStack[0]).to.be.eqls([parent, AT_TARGET]);
    expect(eventStack[1]).to.be.eqls([child, BUBBLING_PHASE]);
  });

  it('should use event delegation with capture correctly.', async () => {
    const parent = new Group({ id: 'parent' });
    parent.isMutationObserved = true;
    const child = new Group({ id: 'child' });
    child.isMutationObserved = true;

    const eventStack = [];
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

    expect(eventStack.length).to.be.eqls(2);
    expect(eventStack[0]).to.be.eqls([parent, AT_TARGET]);
    expect(eventStack[1]).to.be.eqls([child, CAPTURING_PHASE]);
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
    const eventStack = [];
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

    expect(eventStack.length).to.be.eqls(6);
    expect(eventStack[0]).to.be.eqls([form, CAPTURING_PHASE]);
    expect(eventStack[1]).to.be.eqls([div, CAPTURING_PHASE]);
    expect(eventStack[2]).to.be.eqls([p, CAPTURING_PHASE]);
    expect(eventStack[3]).to.be.eqls([p, BUBBLING_PHASE]);
    expect(eventStack[4]).to.be.eqls([div, BUBBLING_PHASE]);
    expect(eventStack[5]).to.be.eqls([form, BUBBLING_PHASE]);
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

    let cloned: FederatedPointerEvent;
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

    expect(cloned.type).to.be.eqls('pointerup');
    expect(cloned.pointerType).to.be.eqls('mouse');
    expect(cloned.pointerId).to.be.eqls(1);
    expect(cloned.button).to.be.eqls(0);
    expect(cloned.clientX).to.be.eqls(295.3359375);
    expect(cloned.clientY).to.be.eqls(201.03515625);
    expect(cloned.target).to.be.eqls(circle);
  });
});
