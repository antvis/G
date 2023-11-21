import { Line } from '../../../packages/g';

export async function line(context) {
  const { canvas } = context;
  await canvas.ready;

  const line = new Line({
    style: {
      x1: 10,
      y1: 10,
      x2: 10,
      y2: 30,
      stroke: 'red',
      lineWidth: 6,
    },
  });
  canvas.appendChild(line);
}
