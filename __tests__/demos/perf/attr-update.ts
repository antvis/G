import * as lil from 'lil-gui';
import { type Canvas, Rect, Group, CanvasEvent, ElementEvent } from '@antv/g';

export async function attrUpdate(context: { canvas: Canvas; gui: lil.GUI }) {
  const { canvas, gui } = context;
  const futureFlags =
    canvas.getConfig().future || (canvas.getConfig().future = {});
  console.log(canvas);

  await canvas.ready;

  const { width, height } = canvas.getConfig();
  const root = new Group();
  let count = 1e4;
  let rects = [];

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
    // console.log('update');
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

      // rect.isMutationObserved = true;
      rect.addEventListener(ElementEvent.ATTR_MODIFIED, () => {
        console.log(ElementEvent.ATTR_MODIFIED);
      });
    }
  }

  render();
  canvas.addEventListener(CanvasEvent.BEFORE_RENDER, () => update());

  // root.isMutationObserved = true;
  // canvas.addEventListener(ElementEvent.BOUNDS_CHANGED, () => {
  //   console.log('first');
  // });

  canvas.appendChild(root);

  canvas.addEventListener(
    'rerender',
    () => {
      // console.timeEnd('render');
    },
    { once: true },
  );

  // GUI
  // canvas.getConfig().renderer.getConfig().enableCulling = true;
  canvas.getConfig().renderer.getConfig().enableRenderingOptimization = true;
  const observeConfig = {
    objectCount: count,
    enableRenderingOptimization: canvas.getConfig().renderer.getConfig()
      .enableRenderingOptimization,
    enableAttributeUpdateOptimization:
      futureFlags.experimentalAttributeUpdateOptimization || false,
  };

  gui.add(observeConfig, 'objectCount').onChange((value) => {
    count = value;
    render();
  });
  gui
    .add(observeConfig, 'enableAttributeUpdateOptimization')
    .onChange((value) => {
      futureFlags.experimentalAttributeUpdateOptimization = value;
    });
  gui.add(observeConfig, 'enableRenderingOptimization').onChange((value) => {
    canvas.getConfig().renderer.getConfig().enableRenderingOptimization = value;
  });
}
