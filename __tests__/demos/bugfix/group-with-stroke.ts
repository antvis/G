import { Group, Path, Rect, runtime, CustomElement } from '@antv/g';

export async function group_with_stroke(context) {
  const { canvas } = context;

  await canvas.ready;

  class CustomGroup extends CustomElement<any> {}

  const group = new CustomGroup({
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

  let rect;

  const upsert = () => {
    const {
      min: [minX, minY],
      max: [maxX, maxY],
    } = group.getRenderBounds();
    const width = maxX - minX;
    const height = maxY - minY;
    const style = {
      x: minX,
      y: minY,
      width,
      height,
      fill: 'green',
      fillOpacity: 0.1,
      zIndex: -1,
    };

    if (!rect) {
      rect = new Rect({ style });
      canvas.appendChild(rect);
    } else {
      rect.attr(style);
    }
  };

  upsert();

  Object.assign(window, {
    upsert,
    group,
  });
}
