import { Rect } from '../../../packages/g';

export async function rotate(context) {
  const { canvas } = context;

  await canvas.ready;

  const circle = new Rect({
    style: {
      x: 200,
      y: 200,
      width: 60,
      height: 60,
      stroke: '#F04864',
      lineWidth: 4,
      transformOrigin: 'center',
    },
  });

  canvas.appendChild(circle);
  circle.animate(
    [
      { x: 200, transform: 'rotate(0)' },
      { x: 400, transform: 'rotate(360)' },
    ],
    {
      duration: 1500,
      iterations: Infinity,
      direction: 'alternate',
    },
  );
}
