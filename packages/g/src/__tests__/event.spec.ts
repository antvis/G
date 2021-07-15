import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { Group, Canvas, Circle, DISPLAY_OBJECT_EVENT } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import interact from 'interactjs';

chai.use(chaiAlmost());
chai.use(sinonChai);

const $container = document.createElement('div');
$container.id = 'container';
document.body.appendChild($container);

// @ts-ignore
const renderer = new CanvasRenderer();

// create a canvas
const canvas = new Canvas({
  container: 'container',
  width: 600,
  height: 500,
  renderer,
});

describe('Event API like DOM', () => {
  it('should emit inserted event correctly', () => {
    const circle = new Circle({
      id: 'circle',
      className: 'li',
      attrs: {
        fill: 'rgb(239, 244, 255)',
        fillOpacity: 1,
        lineWidth: 1,
        opacity: 1,
        r: 100,
        stroke: 'rgb(95, 149, 255)',
        strokeOpacity: 1,
        cursor: 'pointer',
      },
    });
    circle.setPosition(300, 200);

    canvas.appendChild(circle);

    // @ts-ignore
    interact(circle, {
      context: canvas,
    })
      .draggable({
        listeners: {
          onmousedown(event) {
            console.log(event.type, event.target);
          },
          start(event) {
            console.log(event.type, event.target);
          },
          move(event) {
            console.log(event.type, event.target);
          }
        }
      });
  });
});
