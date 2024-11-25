import { Group, Path, Rect, runtime } from '@antv/g';

export async function group_with_stroke(context) {
  const { canvas } = context;

  await canvas.ready;

  const group = new Group({
    style: {
      stroke: 'red',
      lineWidth: 6,
    },
  });

  group.appendChild(
    new Path({
      style: {
        d: [
          ['M', 100, 100],
          ['L', 200, 100],
          ['L', 200, 200],
        ],
        stroke: 'pink',
        lineWidth: 2,
      },
    }),
  );

  canvas.appendChild(group);

  const bounds = group.getRenderBounds();

  const {
    min: [minX, minY],
    max: [maxX, maxY],
  } = bounds;
  const width = maxX - minX;
  const height = maxY - minY;
  const rect = new Rect({
    style: {
      x: minX,
      y: minY,
      width,
      height,
      fill: 'green',
      fillOpacity: 0.1,
    },
  });

  canvas.appendChild(rect);
}
