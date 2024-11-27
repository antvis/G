import { Renderer } from '@antv/g-canvas';

export async function switchRenderer(context) {
  const { canvas } = context;

  await canvas.ready;

  const renderer = new Renderer();

  canvas.setRenderer(renderer);

  console.log('switched');
}
