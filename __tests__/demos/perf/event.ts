import {
  Canvas,
  ElementEvent,
  Rect,
  Group,
  CustomEvent,
  EventTarget,
} from '@antv/g';
import * as tinybench from 'tinybench';

export async function event(context: { canvas: Canvas }) {
  const { canvas } = context;
  console.log(canvas);

  await canvas.ready;

  const { width, height } = canvas.getConfig();
  const root = new Group();
  let count = 2e4;
  let rects = [];
  let eventTargets = [];

  function render() {
    root.destroyChildren();
    rects = [];

    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 10 + Math.random() * 40;
      const speed = 1 + Math.random();

      const rect = new Rect({
        style: {
          x,
          y,
          width: size,
          height: size,
          fill: 'white',
          stroke: '#000',
          lineWidth: 1,
        },
      });
      root.appendChild(rect);
      rects[i] = { x, y, size, speed, el: rect };

      // ---
      const eventTarge = new EventTarget();
      eventTargets.push(eventTarge);
      eventTarge.addEventListener(ElementEvent.BOUNDS_CHANGED, () => {
        //
      });
    }
  }

  render();
  canvas.appendChild(root);

  // benchmark
  // ----------
  const boundsChangedEvent = new CustomEvent(ElementEvent.BOUNDS_CHANGED);
  boundsChangedEvent.detail = { affectChildren: true };

  const bench = new tinybench.Bench({ name: 'event benchmark', time: 1e2 });

  bench.add('Iterating trigger events', async () => {
    root.forEach((el) => {
      el.dispatchEvent(boundsChangedEvent);
    });
  });
  bench.add('Iterating trigger events without propagate', async () => {
    root.forEach((el) => {
      el.dispatchEvent(boundsChangedEvent, true);
    });
  });
  bench.add('Iterating over trigger events on empty objects', async () => {
    eventTargets.forEach((el) => {
      el.dispatchEvent(boundsChangedEvent);
    });
  });
  bench.add('Batch triggering events', async () => {
    canvas.dispatchEvent(boundsChangedEvent, true);
  });

  await bench.run();

  console.log(bench.name);
  console.table(bench.table());
  console.log(bench.results);
  console.log(bench.tasks);

  // ----------
}
