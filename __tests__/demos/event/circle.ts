import { Circle, Group } from '@antv/g';

export async function circle(context) {
  const { canvas } = context;
  await canvas.ready;

  for (let i = 0; i < 1000; i++) {
    const group = new Group();
    const circle = new Circle({
      style: {
        cx: Math.random() * 600,
        cy: Math.random() * 500,
        r: 20 + Math.random() * 10,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 4,
      },
    });
    group.appendChild(circle);
    canvas.appendChild(group);

    circle.on('mouseenter', () => {
      circle.attr('fill', '#2FC25B');
    });

    circle.on('mouseleave', () => {
      circle.attr('fill', '#1890FF');
    });
  }

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
