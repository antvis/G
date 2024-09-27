import { Circle } from '@antv/g';

export async function scale0(context) {
  const { canvas } = context;
  await canvas.ready;

  const circle = new Circle({
    style: {
      cx: 100,
      cy: 100,
      r: 50,
      fill: 'green',
      transform: 'scaleX(0)',
    },
  });
  canvas.appendChild(circle);
}
