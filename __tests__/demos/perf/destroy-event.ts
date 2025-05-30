import {
  Canvas,
  ElementEvent,
  Rect,
  Group,
  EventTarget,
  runtime,
} from '@antv/g';
import * as tinybench from 'tinybench';

/**
 * 元素高频销毁与实例化性能测试
 */
export async function destroyEvent(context: { canvas: Canvas }) {
  const { canvas } = context;
  console.log(canvas);

  await canvas.ready;

  const { width, height } = canvas.getConfig();
  const root = new Group();
  let count = 2e2;
  let rects = [];

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
    }
  }

  render();
  canvas.appendChild(root);

  // benchmark
  // ----------
  const bench = new tinybench.Bench({ name: 'event benchmark', time: 1e2 });

  bench.add('0', async () => {
    runtime.enablePerformanceOptimization = false;
    render();
  });
  bench.add('1', async () => {
    runtime.enablePerformanceOptimization = true;
    render();
  });

  await bench.run();

  console.log(bench.name);
  console.table(bench.table());
  console.log(bench.results);
  console.log(bench.tasks);

  // ----------
}
