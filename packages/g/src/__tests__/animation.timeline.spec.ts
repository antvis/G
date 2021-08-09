import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';

import { Group, Circle, Canvas, Text, Rect, DISPLAY_OBJECT_EVENT } from '@antv/g';
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

describe('Timeline', () => {
  it('x', () => {
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

    // tick(90);

    const animation = circle.animate(
      [], {
      duration: 500,
    });
    console.log('not ready', canvas.timeline.currentTime, animation?.currentTime, animation?.playState);

    animation?.ready.then(() => {
      console.log('ready', canvas.timeline.currentTime, animation.currentTime, animation.playState);
    });

    animation?.finished.then(() => {
      console.log('finished', canvas.timeline.currentTime, animation.currentTime, animation.playState);
    });

    // expect(animation?.playState).to.be.eql('pending');

    // tick(1000);

    // expect(animation?.playState).to.be.eql('finished');
  });
});