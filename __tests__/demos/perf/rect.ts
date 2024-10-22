import { Rect, Group, Fragment } from '@antv/g';
import type { Canvas } from '@antv/g';

export async function rects(context: { canvas: Canvas }) {
  const { canvas } = context;

  await canvas.ready;

  const group1 = canvas.appendChild(new Group({ id: 'group1' }));
  const group2 = group1.appendChild(new Group({ id: 'group2' }));

  console.time('render');

  const fragment = new Fragment();

  for (let i = 0; i < 10_0000; i++) {
    const group = fragment.appendChild(
      new Group({
        id: `group-${i}`,
        style: {
          transform: [['translate', Math.random() * 640, Math.random() * 640]],
        },
      }),
    );

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
  }

  group2.appendChild(fragment);

  canvas.addEventListener(
    'rerender',
    () => {
      console.timeEnd('render');
    },
    { once: true },
  );
}
