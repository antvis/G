import { Renderer as CanvasRenderer } from '../../../packages/g-svg/src';
import { Canvas, Circle, EasingFunctions } from '../../../packages/g/src';
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

  it('should register custom easing function correctly', async () => {
    EasingFunctions['my-easing'] = (t: number) => t;

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

    const animation = circle.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 500,
      easing: 'my-easing',
    })!;

    animation.pause();
    animation.currentTime = 250;

    expect(circle.style.opacity).toBe(0.5);
  });

  it('should use cubic-bezier correctly', async () => {
    const circle = new Circle({
      id: 'circle',
      style: {
        r: 100,
      },
    });

    await canvas.ready;
    canvas.appendChild(circle);

    const animation = circle.animate([{ r: 0 }, { r: 100 }], {
      duration: 500,
      easing: 'cubic-bezier(0.05, 0.21, 0.26, 1.31)',
      fill: 'forwards',
    })!;

    animation.pause();
    animation.currentTime = 0;
    expect(circle.style.r).toBe(0);

    animation.currentTime = 250;
    expect(circle.style.r).toBeCloseTo(98.24289047791895);

    animation.currentTime = 275;
    expect(circle.style.r).toBeCloseTo(100.96325609464722);

    animation.currentTime = 400;
    expect(circle.style.r).toBeCloseTo(105.24435426047445);

    animation.currentTime = 450;
    expect(circle.style.r).toBeCloseTo(103.43753135054527);

    animation.currentTime = 500;
    expect(circle.style.r).toBe(100);
  });
});
