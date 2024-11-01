import * as lil from 'lil-gui';
import { Rect, Group, CanvasEvent } from '@antv/g';
import type { Canvas } from '@antv/g';

export async function attrUpdate(context: { canvas: Canvas; gui: lil.GUI }) {
  const { canvas, gui } = context;
  console.log(canvas);

  await canvas.ready;

  const { width, height } = canvas.getConfig();
  const count = 2e4;
  const root = new Group();
  const rects = [];

  const perfStore: { [k: string]: { count: number; time: number } } = {
    update: { count: 0, time: 0 },
    setAttribute: { count: 0, time: 0 },
  };

  function updatePerf(key: string, time: number) {
    perfStore[key].count++;
    perfStore[key].time += time;
    console.log(
      `average ${key} time: `,
      perfStore[key].time / perfStore[key].count,
    );
  }

  function update() {
    // const startTime = performance.now();
    // console.time('update');

    const rectsToRemove = [];

    // const startTime0 = performance.now();
    // console.time('setAttribute');
    for (let i = 0; i < count; i++) {
      const rect = rects[i];
      rect.x -= rect.speed;
      (rect.el as Rect).setAttribute('x', rect.x);
      if (rect.x + rect.size < 0) rectsToRemove.push(i);
    }
    // console.timeEnd('setAttribute');
    // updatePerf('setAttribute', performance.now() - startTime0);

    rectsToRemove.forEach((i) => {
      rects[i].x = width + rects[i].size / 2;
    });

    // console.timeEnd('update');
    // updatePerf('update', performance.now() - startTime);
  }

  function render() {
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
          stroke: 'black',
        },
      });
      root.appendChild(rect);
      rects[i] = { x, y, size, speed, el: rect };
    }
  }

  render();
  canvas.addEventListener(CanvasEvent.BEFORE_RENDER, () => update());

  canvas.appendChild(root);

  canvas.addEventListener(
    'rerender',
    () => {
      // console.timeEnd('render');
    },
    { once: true },
  );

  // GUI
  canvas.getConfig().renderer.getConfig().enableRenderingOptimization = true;

  gui
    .add(
      {
        enableRenderingOptimization: canvas.getConfig().renderer.getConfig()
          .enableRenderingOptimization,
      },
      'enableRenderingOptimization',
    )
    .onChange((result) => {
      canvas.getConfig().renderer.getConfig().enableRenderingOptimization =
        result;
    });
}
