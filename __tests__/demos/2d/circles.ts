import { Circle, runtime } from '../../../packages/g';

export async function circles(context) {
  runtime.enableCSSParsing = false;

  const { canvas } = context;
  await canvas.ready;

  for (let i = 0; i < 50000; i++) {
    const circle = new Circle({
      style: {
        cx: Math.random() * 500,
        cy: Math.random() * 500,
        r: 5,
        fill: 'red',
        stroke: 'blue',
      },
    });
    canvas.appendChild(circle);

    circle.addEventListener('mouseenter', () => {
      circle.style.fill = 'green';
    });
    circle.addEventListener('mouseleave', () => {
      circle.style.fill = 'red';
    });
  }
}
