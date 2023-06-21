import { Renderer as CanvasRenderer } from '../../../packages/g-canvas/src';
import { Canvas, Circle } from '../../../packages/g/src';
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

describe('Animation Timeline', () => {
  afterEach(() => {
    canvas.destroyChildren();
  });

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

    await canvas.ready;
    canvas.appendChild(circle);

    const animation = circle.animate([], {
      duration: 500,
    })!;
    const computedTiming = animation.effect.getComputedTiming();

    expect(canvas.document.timeline.currentTime).toBe(0);
    expect(animation.currentTime).toBe(0);
    expect(animation.playState).toBe('running');

    animation.ready.then(() => {
      expect(animation.currentTime).toBe(0);
      expect(animation.playState).toBe('running');

      expect(computedTiming.endTime).toBe(500);
      expect(computedTiming.activeDuration).toBe(500);
      expect(computedTiming.progress).toBe(0);
      expect(computedTiming.currentIteration).toBe(0);
    });

    animation.finished.then(() => {
      expect(animation.currentTime).toBe(500);
      expect(animation.playState).toBe('finished');

      expect(computedTiming.endTime).toBe(500);
      expect(computedTiming.activeDuration).toBe(500);
      // not running
      expect(computedTiming.progress).toBe(null);
      expect(computedTiming.currentIteration).toBe(null);
    });

    animation.onfinish = (ev) => {
      expect(ev.currentTime).toBe(500);
      expect(animation.playState).toBe('finished');

      expect(computedTiming.endTime).toBe(500);
      expect(computedTiming.activeDuration).toBe(500);
      // not running
      expect(computedTiming.progress).toBe(null);
      expect(computedTiming.currentIteration).toBe(null);
    };

    await sleep(1000);
  });
});
