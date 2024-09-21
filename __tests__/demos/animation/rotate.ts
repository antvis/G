import { Rect } from '@antv/g';

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
      transformOrigin: 'center', // or '230 230'
    },
  });

  canvas.appendChild(circle);
  circle.animate(
    [
      // We can't animate the attribute `x` here since it will affect transform origin.
      { transform: 'translateX(0) rotate(0)' },
      { transform: 'translateX(200) rotate(360)' },
    ],
    {
      duration: 1500,
      iterations: Infinity,
      direction: 'alternate',
    },
  );
}
