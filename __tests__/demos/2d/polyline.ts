import { Polyline } from '../../../packages/g';

export async function polyline(context) {
  const { canvas } = context;
  await canvas.ready;

  const polyline = new Polyline({
    style: {
      points: [
        [10, 10],
        [10, 30],
        [30, 30],
      ],
      stroke: 'red',
      lineWidth: 6,
    },
  });
  canvas.appendChild(polyline);
}
