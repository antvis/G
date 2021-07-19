import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { Group, Circle, Canvas, Text, Rect, DISPLAY_OBJECT_EVENT } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { containerModule } from '@antv/g-plugin-css-select';
import interact from 'interactjs';

chai.use(chaiAlmost());
chai.use(sinonChai);

const $container = document.createElement('div');
$container.id = 'container';
document.body.prepend($container);

// @ts-ignore
const renderer = new CanvasRenderer();
renderer.registerPlugin(containerModule);

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
});

describe('Event API like DOM', () => {
  // it('pointerdown/mousedown/touchstart/rightdown', () => {
  //   const circle = new Circle({
  //     id: 'circle',
  //     attrs: {
  //       fill: 'rgb(239, 244, 255)',
  //       fillOpacity: 1,
  //       lineWidth: 1,
  //       opacity: 1,
  //       r: 50,
  //       stroke: 'rgb(95, 149, 255)',
  //       strokeOpacity: 1,
  //       cursor: 'pointer',
  //     },
  //   });
  //   circle.setPosition(300, 200);
  //   canvas.appendChild(circle);

  //   const pointerdownCallback = sinon.spy();
  //   const mousedownCallback = sinon.spy();
  //   const rightdownCallback = sinon.spy();
  //   const touchstartCallback = sinon.spy();
  //   circle.addEventListener('pointerdown', () => {
  //     // @ts-ignore
  //     expect(pointerdownCallback).to.have.been.called;
  //   });
  //   circle.addEventListener('mousedown', () => {
  //     // @ts-ignore
  //     expect(mousedownCallback).to.have.been.called;
  //   });
  //   circle.addEventListener('rightdown', () => {
  //     // @ts-ignore
  //     expect(rightdownCallback).to.have.been.called;
  //   });
  //   circle.addEventListener('touchstart', () => {
  //     // @ts-ignore
  //     expect(touchstartCallback).to.have.been.called;
  //   });

  //   const renderingService = canvas.getRenderingService();

  //   renderingService.hooks.pointerDown.call(new PointerEvent('pointerdown', {
  //     pointerType: 'mouse',
  //     clientX: 300,
  //     clientY: 200,
  //   }));
  //   renderingService.hooks.pointerDown.call(new PointerEvent('pointerdown', {
  //     pointerType: 'touch',
  //     clientX: 300,
  //     clientY: 200,
  //   }));
  //   // right click
  //   renderingService.hooks.pointerDown.call(new PointerEvent('pointerdown', {
  //     pointerType: 'mouse',
  //     clientX: 300,
  //     clientY: 200,
  //     button: 2,
  //   }));

  //   circle.destroy();
  // });

  // it('pointerup/mouseup/touchend/rightup', () => {
  //   const circle = new Circle({
  //     id: 'circle',
  //     attrs: {
  //       fill: 'rgb(239, 244, 255)',
  //       fillOpacity: 1,
  //       lineWidth: 1,
  //       opacity: 1,
  //       r: 50,
  //       stroke: 'rgb(95, 149, 255)',
  //       strokeOpacity: 1,
  //       cursor: 'pointer',
  //     },
  //   });
  //   circle.setPosition(300, 200);
  //   canvas.appendChild(circle);

  //   const pointerdownCallback = sinon.spy();
  //   const mousedownCallback = sinon.spy();
  //   const rightdownCallback = sinon.spy();
  //   const touchstartCallback = sinon.spy();
  //   circle.addEventListener('pointerup', () => {
  //     // @ts-ignore
  //     expect(pointerdownCallback).to.have.been.called;
  //   });
  //   circle.addEventListener('mouseup', () => {
  //     // @ts-ignore
  //     expect(mousedownCallback).to.have.been.called;
  //   });
  //   circle.addEventListener('rightup', () => {
  //     // @ts-ignore
  //     expect(rightdownCallback).to.have.been.called;
  //   });
  //   circle.addEventListener('touchend', () => {
  //     // @ts-ignore
  //     expect(touchstartCallback).to.have.been.called;
  //   });

  //   const renderingService = canvas.getRenderingService();

  //   renderingService.hooks.pointerDown.call(new PointerEvent('pointerup', {
  //     pointerType: 'mouse',
  //     clientX: 300,
  //     clientY: 200,
  //   }));
  //   renderingService.hooks.pointerDown.call(new PointerEvent('pointerup', {
  //     pointerType: 'touch',
  //     clientX: 300,
  //     clientY: 200,
  //   }));
  //   // right click
  //   renderingService.hooks.pointerDown.call(new PointerEvent('pointerup', {
  //     pointerType: 'mouse',
  //     clientX: 300,
  //     clientY: 200,
  //     button: 2,
  //   }));

  //   circle.destroy();
  // });

  // it('should capture in event flow', () => {

  // });

  it('should emit inserted event correctly', () => {
    // add a circle to canvas
    const circle = new Circle({
      className: 'draggable',
      attrs: {
        fill: 'rgb(239, 244, 255)',
        fillOpacity: 1,
        lineWidth: 1,
        opacity: 1,
        r: 60,
        stroke: 'rgb(95, 149, 255)',
        strokeOpacity: 1,
      },
    });

    const text = new Text({
      attrs: {
        text: 'Drag me',
        fontSize: 22,
        fill: '#000',
        textAlign: 'center',
        textBaseline: 'middle',
      },
    });

    const dropZone = new Rect({
      attrs: {
        x: 200,
        y: 300,
        width: 300,
        height: 200,
        fill: '#1890FF',
      },
    });

    canvas.appendChild(dropZone);

    circle.appendChild(text);
    canvas.appendChild(circle);
    circle.setPosition(100, 100);

    // @ts-ignore
    interact(circle, {
      context: canvas.document,
    }).draggable({
      onmove: function (event) {
        const { dx, dy } = event;
        circle.translateLocal(dx, dy);
      }
    });

    // @ts-ignore
    interact(dropZone, {
      context: canvas.document,
    }).dropzone({
      accept: '.draggable',
      overlap: 0.75,
      ondragenter: function (event) {
        text.style.text = 'Dragged in';
      },
      ondragleave: function (event) {
        text.style.text = 'Dragged out';
      },
      ondrop: function (event) {
        text.style.text = 'Dropped';
      },
      ondropactivate: function (event) {
        // add active dropzone feedback
        event.target.style.fill = '#4e4';
      },
      ondropdeactivate: function (event) {
        event.target.style.fill = '#1890FF';
      }
    });
  });
});
