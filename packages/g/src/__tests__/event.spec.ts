import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
// @ts-ignore
import {
  Group,
  Circle,
  Canvas,
  Text,
  Rect,
  ElementEvent,
  DisplayObject,
  FederatedEvent,
  CustomEvent,
} from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Plugin } from '@antv/g-plugin-css-select';
import interact from 'interactjs';
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

describe('Event API like DOM', () => {
  afterEach(() => {
    canvas.removeChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });
  it('pointerdown/mousedown/touchstart/rightdown', () => {
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
    canvas.appendChild(circle);

    const pointerdownCallback = sinon.spy();
    const mousedownCallback = sinon.spy();
    const rightdownCallback = sinon.spy();
    const touchstartCallback = sinon.spy();
    circle.addEventListener('pointerdown', () => {
      // @ts-ignore
      expect(pointerdownCallback).to.have.been.called;
    });
    circle.addEventListener('mousedown', () => {
      // @ts-ignore
      expect(mousedownCallback).to.have.been.called;
    });
    circle.addEventListener('rightdown', () => {
      // @ts-ignore
      expect(rightdownCallback).to.have.been.called;
    });
    circle.addEventListener('touchstart', () => {
      // @ts-ignore
      expect(touchstartCallback).to.have.been.called;
    });

    const renderingService = canvas.getRenderingService();

    renderingService.hooks.pointerDown.call(
      new PointerEvent('pointerdown', {
        pointerType: 'mouse',
        clientX: 300,
        clientY: 200,
      }),
    );
    renderingService.hooks.pointerDown.call(
      new PointerEvent('pointerdown', {
        pointerType: 'touch',
        clientX: 300,
        clientY: 200,
      }),
    );
    // right click
    renderingService.hooks.pointerDown.call(
      new PointerEvent('pointerdown', {
        pointerType: 'mouse',
        clientX: 300,
        clientY: 200,
        button: 2,
      }),
    );

    circle.destroy();
  });

  it('pointerup/mouseup/touchend/rightup', () => {
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
    canvas.appendChild(circle);

    const pointerdownCallback = sinon.spy();
    const mousedownCallback = sinon.spy();
    const rightdownCallback = sinon.spy();
    const touchstartCallback = sinon.spy();
    circle.addEventListener('pointerup', () => {
      // @ts-ignore
      expect(pointerdownCallback).to.have.been.called;
    });
    circle.addEventListener('mouseup', () => {
      // @ts-ignore
      expect(mousedownCallback).to.have.been.called;
    });
    circle.addEventListener('rightup', () => {
      // @ts-ignore
      expect(rightdownCallback).to.have.been.called;
    });
    circle.addEventListener('touchend', () => {
      // @ts-ignore
      expect(touchstartCallback).to.have.been.called;
    });

    const renderingService = canvas.getRenderingService();

    renderingService.hooks.pointerDown.call(
      new PointerEvent('pointerup', {
        pointerType: 'mouse',
        clientX: 300,
        clientY: 200,
      }),
    );
    renderingService.hooks.pointerDown.call(
      new PointerEvent('pointerup', {
        pointerType: 'touch',
        clientX: 300,
        clientY: 200,
      }),
    );
    // right click
    renderingService.hooks.pointerDown.call(
      new PointerEvent('pointerup', {
        pointerType: 'mouse',
        clientX: 300,
        clientY: 200,
        button: 2,
      }),
    );

    circle.destroy();
  });

  it('should use event delegation correctly.', async () => {
    const parent = new Group({ id: 'parent' });
    const child = new Group({ id: 'child' });

    const eventStack = [];
    parent.addEventListener(ElementEvent.MOUNTED, (e: FederatedEvent) => {
      eventStack.push([e.target, e.eventPhase]);
    });

    parent.appendChild(child);
    canvas.appendChild(parent);

    await sleep(200);

    expect(eventStack.length).to.be.eqls(2);
    expect(eventStack[0]).to.be.eqls([parent, AT_TARGET]);
    expect(eventStack[1]).to.be.eqls([child, BUBBLING_PHASE]);
  });

  it('should use event delegation with capture correctly.', async () => {
    const parent = new Group({ id: 'parent' });
    const child = new Group({ id: 'child' });

    const eventStack = [];
    parent.addEventListener(
      ElementEvent.MOUNTED,
      (e: FederatedEvent) => {
        eventStack.push([e.target, e.eventPhase]);
      },
      { capture: true },
    );

    parent.appendChild(child);
    canvas.appendChild(parent);

    await sleep(200);

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

    await sleep(400);

    expect(eventStack.length).to.be.eqls(6);
    expect(eventStack[0]).to.be.eqls([form, CAPTURING_PHASE]);
    expect(eventStack[1]).to.be.eqls([div, CAPTURING_PHASE]);
    expect(eventStack[2]).to.be.eqls([p, CAPTURING_PHASE]);
    expect(eventStack[3]).to.be.eqls([p, BUBBLING_PHASE]);
    expect(eventStack[4]).to.be.eqls([div, BUBBLING_PHASE]);
    expect(eventStack[5]).to.be.eqls([form, BUBBLING_PHASE]);
  });

  // it('should emit inserted event correctly', () => {
  //   // const rect = new Rect({
  //   //   style: {
  //   //     fill: 'rgb(239, 244, 255)',
  //   //     fillOpacity: 1,
  //   //     lineWidth: 1,
  //   //     opacity: 1,
  //   //     width: 300,
  //   //     height: 300,
  //   //     stroke: 'rgb(95, 149, 255)',
  //   //     strokeOpacity: 1,
  //   //   },
  //   // });

  //   // add a circle to canvas
  //   const circle = new Circle({
  //     className: 'draggable',
  //     style: {
  //       fill: 'rgb(239, 244, 255)',
  //       fillOpacity: 1,
  //       lineWidth: 1,
  //       opacity: 1,
  //       r: 60,
  //       stroke: 'rgb(95, 149, 255)',
  //       strokeOpacity: 1,
  //     },
  //   });

  //   // const text = new Text({
  //   //   style: {
  //   //     text: 'move',
  //   //     fontSize: 22,
  //   //     fill: '#000',
  //   //     textAlign: 'center',
  //   //     textBaseline: 'middle',
  //   //   },
  //   // });

  //   // rect.appendChild(circle);
  //   // circle.appendChild(text);
  //   // canvas.appendChild(rect);
  //   // rect.setPosition(200, 200);
  //   circle.translateLocal(150, 150);
  //   canvas.appendChild(circle);

  //   // @ts-ignore
  //   interact(circle, {
  //     context: canvas.document,
  //   }).draggable({
  //     // modifiers: [
  //     //   // interact.modifiers.snap({
  //     //   //   targets: [
  //     //   //     interact.snappers.grid({ x: 30, y: 30 })
  //     //   //   ],
  //     //   //   range: Infinity,
  //     //   //   relativePoints: [{ x: 0, y: 0 }]
  //     //   // }),
  //     //   interact.modifiers.restrict({
  //     //     // @ts-ignore
  //     //     restriction: circle.parentNode,
  //     //     elementRect: { top: 0, left: 0, bottom: 1, right: 1 },
  //     //     endOnly: true
  //     //   })
  //     // ],
  //     // inertia: true,
  //     onmove: function (event) {
  //       const { dx, dy } = event;
  //       console.log(dx, dy);
  //       circle.translateLocal(dx, dy);
  //     },
  //   });

  //   // // @ts-ignore
  //   // interact(dropZone, {
  //   //   context: canvas.document,
  //   // }).dropzone({
  //   //   accept: '.draggable',
  //   //   overlap: 0.75,
  //   //   ondragenter: function (event) {
  //   //     text.style.text = 'Dragged in';
  //   //   },
  //   //   ondragleave: function (event) {
  //   //     text.style.text = 'Dragged out';
  //   //   },
  //   //   ondrop: function (event) {
  //   //     text.style.text = 'Dropped';
  //   //   },
  //   //   ondropactivate: function (event) {
  //   //     // add active dropzone feedback
  //   //     event.target.style.fill = '#4e4';
  //   //   },
  //   //   ondropdeactivate: function (event) {
  //   //     event.target.style.fill = '#1890FF';
  //   //   }
  //   // });
  // });
});
