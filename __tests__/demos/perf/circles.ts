import { runtime, Circle } from '../../../packages/g';

export async function circles(context) {
  runtime.enableCSSParsing = false;

  const { canvas, container } = context;
  await canvas.ready;

  for (let i = 0; i < 10000; i++) {
    const circle = new Circle({
      style: {
        cx: Math.random() * 640,
        cy: Math.random() * 640,
        r: 10,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 4,
      },
    });
    canvas.appendChild(circle);
  }

  canvas.appendChild(
    new Circle({
      style: {
        cx: 320,
        cy: 320,
        r: 100,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 4,
      },
    }),
  );
}
