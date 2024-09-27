import { Circle, Rect } from '@antv/g';

export async function marchingAnts(context) {
  const { canvas } = context;

  await canvas.ready;

  const circle = new Circle({
    style: {
      cx: 200,
      cy: 200,
      r: 60,
      stroke: '#F04864',
      lineWidth: 4,
      lineDash: [10, 10],
    },
  });

  const rect = new Rect({
    style: {
      x: 300,
      y: 100,
      width: 200,
      height: 200,
      stroke: '#F04864',
      lineWidth: 4,
      radius: 8,
      lineDash: [10, 10],
    },
  });

  canvas.appendChild(circle);
  circle.animate([{ lineDashOffset: -20 }, { lineDashOffset: 0 }], {
    duration: 500,
    iterations: Infinity,
  });

  canvas.appendChild(rect);
  rect.animate([{ lineDashOffset: -20 }, { lineDashOffset: 0 }], {
    duration: 500,
    iterations: Infinity,
  });
}
