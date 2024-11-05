import * as lil from 'lil-gui';
import { type Canvas } from '@antv/g';
import * as tinybench from 'tinybench';

export async function canvasApi(context: { canvas: Canvas; gui: lil.GUI }) {
  const { canvas } = context;
  console.log(canvas);

  await canvas.ready;

  // benchmark
  // ----------
  const bench = new tinybench.Bench({ name: 'canvas benchmark', time: 100 });

  const canvasContext = canvas
    .getContextService()
    .getContext() as CanvasRenderingContext2D;
  const offscreenCanvas = new OffscreenCanvas(
    canvas.getConfig().width,
    canvas.getConfig().height,
  ).getContext('2d');
  const props = {
    fillStyle: '#000',
    strokeStyle: '#000',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    filter: 'none',
  };
  const propsKeys = Object.keys(props);

  bench.add('get object props', () => {
    propsKeys.forEach((key) => {
      props[key];
    });
  });
  bench.add('set object props', () => {
    propsKeys.forEach((key) => {
      props[key] = props[key];
    });
  });

  propsKeys.forEach((key) => {
    bench.add(`get canvas context props - ${key}`, async () => {
      canvasContext[key];
    });
    bench.add(`set canvas context props - ${key}`, async () => {
      canvasContext[key] = canvasContext[key];
    });
  });
  bench.add('canvas context save() & restore()', async () => {
    canvasContext.save();
    canvasContext.restore();
  });

  propsKeys.forEach((key) => {
    bench.add(`get offscreenCanvas context props - ${key}`, async () => {
      offscreenCanvas[key];
    });
    bench.add(`set offscreenCanvas context props - ${key}`, async () => {
      offscreenCanvas[key] = canvasContext[key];
    });
  });
  bench.add('canvas offscreenCanvas save() & restore()', async () => {
    offscreenCanvas.save();
    offscreenCanvas.restore();
  });

  await bench.run();

  console.log(bench.name);
  console.table(bench.table());
  console.log(bench.results);
  console.log(bench.tasks);

  // ----------
}
