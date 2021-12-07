import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinon from 'sinon';
// @ts-ignore
import sinonChai from 'sinon-chai';

import { Group, Circle, Canvas, Text, Rect, ElementEvent } from '../../../lib';
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

const sleep = (n) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined);
    }, n);
  });
};

describe('Animation Timeline', () => {
  afterAll(() => {
    canvas.destroy();
  });
  it('should calculate playState & currentTime correctly', async () => {
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

    const animation = circle.animate([], {
      duration: 500,
    });
    const computedTiming = animation.effect.getComputedTiming();

    expect(canvas.document.timeline.currentTime).to.be.eqls(0);
    expect(animation.currentTime).to.be.eqls(0);
    expect(animation.playState).to.be.eqls('running');

    animation.ready.then(() => {
      expect(animation.currentTime).to.be.eqls(0);
      expect(animation.playState).to.be.eqls('running');

      expect(computedTiming.endTime).to.be.eqls(500);
      expect(computedTiming.activeDuration).to.be.eqls(500);
      expect(computedTiming.progress).to.be.eqls(0);
      expect(computedTiming.currentIteration).to.be.eqls(0);
    });

    animation.finished.then(() => {
      expect(animation.currentTime).to.be.eqls(500);
      expect(animation.playState).to.be.eqls('finished');

      expect(computedTiming.endTime).to.be.eqls(500);
      expect(computedTiming.activeDuration).to.be.eqls(500);
      // not running
      expect(computedTiming.progress).to.be.eqls(null);
      expect(computedTiming.currentIteration).to.be.eqls(null);
    });

    await sleep(1000);
  });
});
