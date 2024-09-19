import { Ellipse } from '@antv/g';

export async function ellipse(context) {
  const { canvas } = context;
  await canvas.ready;

  // fill
  const ellipse1 = new Ellipse({
    style: {
      cx: 100,
      cy: 100,
      rx: 50,
      ry: 100,
      fill: 'red',
      cursor: 'pointer',
    },
  });
  canvas.appendChild(ellipse1);

  const ellipse2 = new Ellipse({
    style: {
      cx: 200,
      cy: 100,
      rx: 50,
      ry: 100,
      fill: 'red',
      pointerEvents: 'none',
      cursor: 'pointer',
    },
  });
  canvas.appendChild(ellipse2);

  const ellipse3 = new Ellipse({
    style: {
      cx: 300,
      cy: 100,
      rx: 50,
      ry: 100,
      fill: 'red',
      stroke: 'green',
      lineWidth: 20,
      pointerEvents: 'fill',
      cursor: 'pointer',
    },
  });
  canvas.appendChild(ellipse3);

  const ellipse4 = new Ellipse({
    style: {
      cx: 400,
      cy: 100,
      rx: 50,
      ry: 100,
      fill: 'red',
      stroke: 'green',
      lineWidth: 20,
      pointerEvents: 'stroke',
      cursor: 'pointer',
    },
  });
  canvas.appendChild(ellipse4);
}
