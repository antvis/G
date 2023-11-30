import { Renderer as CanvasRenderer } from '../../../packages/g-svg/src';
import { Canvas, Circle, IAnimation } from '../../../packages/g/src';
import { sleep } from '../utils';

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
  let animation: IAnimation;

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
    })!;
  });

  afterEach(() => {
    canvas.destroyChildren();
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('should trigger oncancel callback correctly', async () => {
    const computedTiming = animation.effect.getComputedTiming();

    expect(canvas.document.timeline.currentTime).toBe(0);
    expect(animation.currentTime).toBe(0);
    expect(animation.playState).toBe('running');

    await new Promise((resolve) => {
      animation.oncancel = (ev) => {
        // According to https://w3c.github.io/csswg-drafts/web-animations-1/#canceling-an-animation-section
        // currentTime should be null.
        expect(ev.currentTime).toBe(null);
        expect(animation.playState).toBe('idle');

        expect(computedTiming.endTime).toBe(4000);
        expect(computedTiming.activeDuration).toBe(4000);
        // not running
        expect(computedTiming.progress).toBe(null);
        expect(computedTiming.currentIteration).toBe(null);

        resolve(undefined);
      };

      animation.cancel();
    });

    await sleep(100);
  });

  // it('should reject finished promise when cancelled', async (done) => {
  //   // According to https://w3c.github.io/csswg-drafts/web-animations-1/#canceling-an-animation-section
  //   // Reject the current finished promise.
  //   animation.finished
  //     .then(() => {
  //       expect(true).toBeFalsy();
  //     })
  //     .catch(() => {
  //       expect(true).toBeTruthy();
  //       done();
  //     });

  //   await sleep(100);
  //   animation.cancel();
  // });

  it('should not trigger onfinish callback when cancelled', async () => {
    await new Promise((resolve) => {
      animation.oncancel = (ev) => {
        expect(true).toBeTruthy();
        resolve(undefined);
      };

      animation.onfinish = () => {
        expect(true).toBeFalsy();
      };

      animation.cancel();
    });

    await sleep(100);
  });

  it('oncancel must not fire when animation finishes', async () => {
    await new Promise((resolve) => {
      animation.oncancel = (ev) => {
        expect(true).toBeFalsy();
      };

      animation.onfinish = () => {
        expect(true).toBeTruthy();
        resolve(undefined);
      };
    });

    await sleep(3000);
  });
});
