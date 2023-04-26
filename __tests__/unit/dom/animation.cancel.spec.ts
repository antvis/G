import { Canvas, Circle } from '@antv/g';
import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import chai, { expect } from 'chai';
// @ts-ignore
import chaiAlmost from 'chai-almost';
// @ts-ignore
import sinonChai from 'sinon-chai';
import { sleep } from '../utils';

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

describe('Animation Cancel Event', () => {
  let animation: Animation;

  beforeEach(async () => {
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

    animation = circle.animate([], {
      duration: 4000,
    });
  });

  afterEach(() => {
    canvas.destroyChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should trigger oncancel callback correctly', async (done) => {
    const computedTiming = animation.effect.getComputedTiming();

    expect(canvas.document.timeline.currentTime).to.be.eqls(0);
    expect(animation.currentTime).to.be.eqls(0);
    expect(animation.playState).to.be.eqls('running');

    animation.oncancel = (ev) => {
      // According to https://w3c.github.io/csswg-drafts/web-animations-1/#canceling-an-animation-section
      // currentTime should be null.
      expect(ev.currentTime).to.be.eqls(null);
      expect(animation.playState).to.be.eqls('idle');

      expect(computedTiming.endTime).to.be.eqls(4000);
      expect(computedTiming.activeDuration).to.be.eqls(4000);
      // not running
      expect(computedTiming.progress).to.be.eqls(null);
      expect(computedTiming.currentIteration).to.be.eqls(null);

      done();
    };

    await sleep(100);
    animation.cancel();
  });

  it('should reject finished promise when cancelled', async (done) => {
    // According to https://w3c.github.io/csswg-drafts/web-animations-1/#canceling-an-animation-section
    // Reject the current finished promise.
    animation.finished
      .then(() => {
        expect(true).to.be.false;
      })
      .catch(() => {
        expect(true).to.be.true;
        done();
      });

    await sleep(100);
    animation.cancel();
  });

  it('should not trigger onfinish callback when cancelled', async (done) => {
    animation.oncancel = (ev) => {
      expect(true).to.be.true;
      done();
    };

    animation.onfinish = () => {
      expect(true).to.be.false;
    };

    await sleep(100);
    animation.cancel();
  });

  it('oncancel must not fire when animation finishes', async (done) => {
    animation.oncancel = (ev) => {
      expect(true).to.be.false;
    };

    animation.onfinish = () => {
      expect(true).to.be.true;
      done();
    };

    await sleep(3000);
  });
});
