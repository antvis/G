import { Canvas, Rect, Group } from '@antv/g';
import * as tinybench from 'tinybench';
import * as lil from 'lil-gui';

/**
 * 元素高频销毁与实例化性能测试
 */
export async function destroyEvent(context: { canvas: Canvas; gui: lil.GUI }) {
  const { canvas, gui } = context;
  const futureFlags =
    canvas.getConfig().future || (canvas.getConfig().future = {});
  console.log(canvas, futureFlags);

  await canvas.ready;

  const { width, height } = canvas.getConfig();
  const root = new Group();
  let count = 1e3;
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
  const bench = new tinybench.Bench({
    name: 'experimentalCancelEventPropagation benchmark',
    time: 1e3,
  });

  bench.add('default', async () => {
    futureFlags.experimentalCancelEventPropagation = false;
    futureFlags.experimentalRICSyncRTree = false;
    render();
  });
  bench.add('enable', async () => {
    futureFlags.experimentalCancelEventPropagation = true;
    futureFlags.experimentalRICSyncRTree = true;
    render();
  });

  await bench.run();

  console.log(bench.name);
  console.table(bench.table());
  console.log(bench.results);
  console.log(bench.tasks);

  // ----------

  // GUI
  const observeConfig = {
    objectCount: count,
    enableTick: false,
    experimentalCancelEventPropagation:
      futureFlags.experimentalCancelEventPropagation || false,
    experimentalRICSyncRTree: futureFlags.experimentalRICSyncRTree || false,
  };

  gui.add(observeConfig, 'objectCount').onChange((value) => {
    count = value;
    render();
  });
  gui.add(observeConfig, 'enableTick').onChange((value) => {
    observeConfig.enableTick = value;
  });
  gui
    .add(observeConfig, 'experimentalCancelEventPropagation')
    .onChange((value) => {
      futureFlags.experimentalCancelEventPropagation = value;
    });
  gui.add(observeConfig, 'experimentalRICSyncRTree').onChange((value) => {
    futureFlags.experimentalRICSyncRTree = value;
  });

  function tick() {
    if (observeConfig.enableTick) {
      render();
    }
    requestAnimationFrame(tick);
  }
  tick();
}
