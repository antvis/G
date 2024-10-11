import { Rect, Group, runtime } from '@antv/g';
import type { Canvas } from '@antv/g';

runtime.enableCSSParsing = false;

export async function rects(context: { canvas: Canvas }) {
  const { canvas } = context;

  await canvas.ready;

  const group1 = new Group({});
  const group2 = group1.appendChild(new Group({}));
  canvas.appendChild(group2);

  console.time('render');

  for (let i = 0; i < 10_0000; i++) {
    const group = new Group({
      style: {
        transform: [['translate', Math.random() * 640, Math.random() * 640]],
      },
    });

    group.appendChild(
      new Rect({
        style: {
          width: 10,
          height: 10,
          fill: '#1890FF',
          stroke: '#F04864',
          lineWidth: 4,
        },
      }),
    );

    group2.appendChild(group);
  }

  canvas.addEventListener(
    'rerender',
    () => {
      console.timeEnd('render');
    },
    { once: true },
  );
}
