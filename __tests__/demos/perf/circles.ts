import { Circle, runtime } from '@antv/g';

runtime.enableCSSParsing = false;

export async function circles(context) {
  const { canvas } = context;
  await canvas.ready;

  console.time('render');

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

  canvas.addEventListener(
    'rerender',
    () => {
      console.timeEnd('render');
    },
    { once: true },
  );
}
