import { Circle } from '../../../packages/g';

export async function circle(context) {
  const { canvas } = context;
  await canvas.ready;

  // fill
  const circle1 = new Circle({
    style: {
      cx: 100,
      cy: 100,
      r: 50,
      fill: 'red',
      cursor: 'pointer',
    },
  });
  canvas.appendChild(circle1);

  const circle2 = new Circle({
    style: {
      cx: 200,
      cy: 100,
      r: 50,
      fill: 'red',
      pointerEvents: 'none',
      cursor: 'pointer',
    },
  });
  canvas.appendChild(circle2);

  const circle3 = new Circle({
    style: {
      cx: 300,
      cy: 100,
      r: 50,
      fill: 'red',
      stroke: 'green',
      lineWidth: 20,
      pointerEvents: 'fill',
      cursor: 'pointer',
    },
  });
  canvas.appendChild(circle3);

  const circle4 = new Circle({
    style: {
      cx: 400,
      cy: 100,
      r: 50,
      fill: 'red',
      stroke: 'green',
      lineWidth: 20,
      pointerEvents: 'stroke',
      cursor: 'pointer',
    },
  });
  canvas.appendChild(circle4);
}
