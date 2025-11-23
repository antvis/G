import { Renderer } from '@antv/g-canvas';

export async function bugfixSwitchRenderer(context) {
  const { canvas } = context;

  await canvas.ready;

  const renderer = new Renderer();

  canvas.setRenderer(renderer);

  console.log('switched');
}
