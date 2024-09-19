import { Circle } from '@antv/g';

export async function dirty(context) {
  const { canvas } = context;
  //   await canvas.ready;

  for (let i = 0; i < 1000; i++) {
    const circle = new Circle({
      style: {
        cx: Math.random() * 100 + 320,
        cy: Math.random() * 100 + 320,
        r: 10,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 4,
      },
    });
    canvas.appendChild(circle);
  }

  setTimeout(() => {
    const circle2 = new Circle({
      style: {
        cx: 320,
        cy: 320,
        r: 300,
        fill: 'red',
        zIndex: -1,
      },
    });
    canvas.appendChild(circle2);

    circle2.animate([{ opacity: 0.5 }, { opacity: 1 }], {
      duration: 300,
      fill: 'both',
    });
  });
}
