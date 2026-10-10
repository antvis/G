import { Renderer as SVGRenderer } from '../../../packages/g-svg/src';
import { Canvas, Circle } from '../../../packages/g/src';
import type { IAnimation } from '../../../packages/g-lite/src';

/**
 * When the `ready` and `finished` promises settle, relative to animation frames and `playState`.
 * Frames are driven by hand, so every log line says in which frame (0 = before the first) it
 * happened.
 */
function createFrames() {
  let callbacks = new Map<number, FrameRequestCallback>();
  let id = 0;
  return {
    count: 0,
    requestAnimationFrame(callback: FrameRequestCallback) {
      callbacks.set(++id, callback);
      return id;
    },
    cancelAnimationFrame(handle: number) {
      callbacks.delete(handle);
    },
    /** Runs one frame, then its microtasks and the timers it scheduled. */
    async next() {
      // What the test did since the last frame settles under that frame's number.
      await new Promise((resolve) => setTimeout(resolve, 0));
      this.count++;
      const running = callbacks;
      callbacks = new Map();
      running.forEach((callback) => callback(this.count * 16));
      await new Promise((resolve) => setTimeout(resolve, 0));
    },
    async run(n: number) {
      for (let i = 0; i < n; i++) await this.next();
    },
  };
}

describe('Animation promises', () => {
  let frames: ReturnType<typeof createFrames>;
  let canvas: Canvas;
  let log: string[];

  const circle = () => {
    const circle = new Circle({ style: { cx: 10, cy: 10, r: 10 } });
    canvas.appendChild(circle);
    return circle;
  };
  const animate = (options: KeyframeAnimationOptions = {}) =>
    circle().animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 100,
      ...options,
    })!;
  /** Logs when the current `ready` and `finished` promises of `animation` settle. */
  const watch = (name: string, animation: IAnimation) => {
    const into = log;
    const settled = (promise: string) => [
      () =>
        into.push(`${frames.count} ${name} ${promise} ${animation.playState}`),
      () => into.push(`${frames.count} ${name} ${promise} rejected`),
    ];
    animation.ready.then(...settled('ready'));
    animation.finished.then(...settled('finished'));
  };
  const listen = (name: string, animation: IAnimation) => {
    const into = log;
    animation.onfinish = () => into.push(`${frames.count} ${name} onfinish`);
    animation.oncancel = () => into.push(`${frames.count} ${name} oncancel`);
  };
  const state = (name: string, animation: IAnimation) =>
    log.push(`${frames.count} ${name} is ${animation.playState}`);

  beforeEach(async () => {
    frames = createFrames();
    log = [];
    const $container = document.createElement('div');
    document.body.append($container);
    canvas = new Canvas({
      container: $container,
      width: 100,
      height: 100,
      renderer: new SVGRenderer(),
      requestAnimationFrame: frames.requestAnimationFrame.bind(frames),
      cancelAnimationFrame: frames.cancelAnimationFrame.bind(frames),
    });
    await canvas.ready;
  });

  afterEach(() => {
    canvas.destroy();
  });

  it('should settle ready and finished in the frames they did before', async () => {
    const a = animate();
    watch('a', a);
    listen('a', a);
    state('a', a);
    for (let i = 0; i < 9; i++) {
      await frames.next();
      state('a', a);
    }
    expect(log).toMatchInlineSnapshot(`
[
  "0 a is running",
  "1 a ready running",
  "1 a is running",
  "2 a is running",
  "3 a is running",
  "4 a is running",
  "5 a is running",
  "6 a is running",
  "7 a is running",
  "8 a finished finished",
  "8 a onfinish",
  "8 a is finished",
  "9 a is finished",
]
`);
  });

  it('should settle the promises of many animations started in one task together', async () => {
    const animations = Array.from({ length: 50 }, (_, i) =>
      animate({ duration: 50 + (i % 5) * 16 }),
    );
    let ready = 0;
    let finished = 0;
    animations.forEach((animation) => {
      animation.ready.then(() => ready++);
      animation.finished.then(() => finished++);
    });
    for (let i = 0; i < 8; i++) {
      await frames.next();
      log.push(`${frames.count} ready ${ready} finished ${finished}`);
    }
    expect(log).toMatchInlineSnapshot(`
[
  "1 ready 50 finished 0",
  "2 ready 50 finished 0",
  "3 ready 50 finished 0",
  "4 ready 50 finished 0",
  "5 ready 50 finished 10",
  "6 ready 50 finished 20",
  "7 ready 50 finished 30",
  "8 ready 50 finished 40",
]
`);
  });

  it('should settle the promises after pause, play, reverse and playbackRate changes', async () => {
    const a = animate({ duration: 160 });
    watch('a', a);
    listen('a', a);
    await frames.run(2);
    a.pause();
    state('a', a);
    watch('a paused', a);
    await frames.run(2);
    state('a', a);
    a.play();
    state('a', a);
    watch('a played', a);
    await frames.run(2);
    a.reverse();
    state('a', a);
    watch('a reversed', a);
    await frames.run(2);
    a.updatePlaybackRate(2);
    state('a', a);
    watch('a faster', a);
    for (let i = 0; i < 10; i++) {
      await frames.next();
      state('a', a);
    }
    expect(log).toMatchInlineSnapshot(`
[
  "1 a ready running",
  "2 a is paused",
  "3 a paused ready paused",
  "4 a is paused",
  "4 a is running",
  "5 a played ready running",
  "6 a is running",
  "6 a finished running",
  "6 a paused finished running",
  "6 a played finished running",
  "6 a reversed ready running",
  "8 a reversed finished finished",
  "8 a onfinish",
  "8 a is running",
  "8 a faster ready running",
  "9 a is running",
  "10 a is running",
  "11 a is running",
  "12 a is running",
  "13 a faster finished finished",
  "13 a onfinish",
  "13 a is finished",
  "14 a is finished",
  "15 a is finished",
  "16 a is finished",
  "17 a is finished",
  "18 a is finished",
]
`);
  });

  it('should settle the promises after cancel, finish and seeking', async () => {
    const cancelled = animate();
    const finishedEarly = animate();
    const seeked = animate();
    const seekedBack = animate({ fill: 'both' });
    for (const [name, animation] of Object.entries({
      cancelled,
      finishedEarly,
      seeked,
      seekedBack,
    })) {
      watch(name, animation);
      listen(name, animation);
    }
    await frames.run(2);
    cancelled.cancel();
    finishedEarly.finish();
    seeked.currentTime = 100;
    seekedBack.currentTime = 100;
    state('cancelled', cancelled);
    state('finishedEarly', finishedEarly);
    state('seeked', seeked);
    state('seekedBack', seekedBack);
    await frames.run(2);
    seekedBack.currentTime = 50;
    state('seekedBack', seekedBack);
    watch('seekedBack again', seekedBack);
    for (let i = 0; i < 6; i++) {
      await frames.next();
      state('seekedBack', seekedBack);
    }
    expect(log).toMatchInlineSnapshot(`
[
  "1 cancelled ready running",
  "1 finishedEarly ready running",
  "1 seeked ready running",
  "1 seekedBack ready running",
  "2 cancelled is idle",
  "2 finishedEarly is finished",
  "2 seeked is finished",
  "2 seekedBack is finished",
  "2 finishedEarly finished finished",
  "2 seeked finished finished",
  "2 seekedBack finished finished",
  "2 cancelled oncancel",
  "3 finishedEarly onfinish",
  "3 seeked onfinish",
  "3 seekedBack onfinish",
  "4 seekedBack is running",
  "4 seekedBack again ready running",
  "5 seekedBack is running",
  "6 seekedBack is running",
  "7 seekedBack is running",
  "8 seekedBack is running",
  "9 seekedBack is running",
  "10 seekedBack is running",
]
`);
  });

  it('should settle the promises of animations started from promise callbacks', async () => {
    const a = animate({ duration: 32 });
    watch('a', a);
    a.finished.then(() => {
      const b = animate({ duration: 32 });
      watch('b', b);
      b.finished.then(() => {
        // Already finished: a fresh read resolves at once.
        watch('b read late', b);
      });
    });
    // Read `finished` while the animation is in the middle of a frame's callbacks.
    const c = animate({ duration: 32 });
    c.ready.then(() => watch('c', c));
    await frames.run(8);
    expect(log).toMatchInlineSnapshot(`
[
  "1 a ready running",
  "1 c ready running",
  "3 a finished finished",
  "3 c finished finished",
  "4 b ready running",
  "6 b finished finished",
  "6 b read late ready finished",
  "6 b read late finished finished",
]
`);
  });

  it('should drop the promises of animations whose target is destroyed', async () => {
    const a = animate();
    const b = animate();
    watch('a', a);
    watch('b', b);
    await frames.run(2);
    a.effect.target.destroy();
    await frames.run(10);
    log.push(
      `${frames.count} animationsWithPromises ${canvas.document.timeline.animationsWithPromises.length}`,
    );
    expect(log).toMatchInlineSnapshot(`
[
  "1 a ready running",
  "1 b ready running",
  "8 b finished finished",
  "12 animationsWithPromises 1",
]
`);
  });

  /**
   * Counts the calls to `updatePromises` in the frame after `prepare(n)`, which must stay linear
   * in n. In 6.3.1 they were about 2·n² (2.0 million for n = 1000 in each of these cases): every
   * animation queued its own frame callback, and each callback went over every animation that
   * has promises, twice.
   */
  const expectLinear = async (prepare: (n: number) => Promise<void>) => {
    const prototype = Object.getPrototypeOf(animate());
    const updatePromises = prototype.updatePromises;
    let calls = 0;
    prototype.updatePromises = function () {
      calls++;
      return updatePromises.call(this);
    };
    try {
      for (const n of [1000, 2000]) {
        canvas.destroyChildren();
        await prepare(n);
        calls = 0;
        await frames.next();
        expect(calls).toBeLessThan(10 * n);
      }
    } finally {
      prototype.updatePromises = updatePromises;
    }
  };
  const animations = (n: number, options?: KeyframeAnimationOptions) =>
    Array.from({ length: n }, () => {
      const animation = animate(options);
      // Reading `finished` puts the animation on the timeline's promise list, as G6 does.
      expect(animation.finished).toBeInstanceOf(Promise);
      return animation;
    });

  it('should do promise bookkeeping in linear time for animations started in one task', async () => {
    await expectLinear(async (n) => {
      animations(n);
    });
  });

  it('should do promise bookkeeping in linear time for paused animations seeked in one task', async () => {
    await expectLinear(async (n) => {
      const paused = animations(n);
      paused.forEach((animation) => animation.pause());
      await frames.next();
      paused.forEach((animation) => (animation.currentTime = 50));
    });
  });

  it('should do promise bookkeeping in linear time for finished animations seeked in one task', async () => {
    await expectLinear(async (n) => {
      const finished = animations(n, { fill: 'both' });
      await frames.run(10);
      finished.forEach((animation) => (animation.currentTime = 200));
    });
  });
});
